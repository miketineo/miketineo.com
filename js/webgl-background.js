/**
 * WebGL Background Animation - Morphing Icosahedron Network
 * miketineo.com
 *
 * Features:
 * - Icosahedron geometry with wireframe rendering
 * - Mouse parallax interaction
 * - Scroll-based transformations
 * - Breathing animation
 * - Auto-rotation
 * - Theme-aware colors
 * - Mobile-optimized
 * - Reduced motion support
 * - Performance monitoring
 */

(function() {
  'use strict';

  // Animation enabled on all pages
  // Previously restricted to homepage only - now available site-wide per client request

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.log('WebGL animation disabled: prefers-reduced-motion');
    return;
  }

  // Wait for THREE.js to load
  function initWhenReady() {
    if (typeof THREE === 'undefined') {
      setTimeout(initWhenReady, 100);
      return;
    }
    init();
  }

  // Design parameters from product designer
  const CONFIG = {
    // Geometry
    geometry: {
      baseFaces: 80,        // Subdivided icosahedron
      mobileFaces: 40,      // Simplified for mobile
      size: 0.4             // 40% of viewport height
    },

    // Position
    position: {
      xOffset: 0.1,         // +10% X-axis offset
      centerY: true
    },

    // Visual
    visual: {
      lineWidth: 1.5,
      // Light mode colors
      light: {
        primary: 'rgba(255, 138, 91, 0.40)',
        accent: 'rgba(91, 200, 204, 0.35)'
      },
      // Dark mode colors
      dark: {
        primary: 'rgba(255, 154, 111, 0.15)',
        accent: 'rgba(109, 212, 216, 0.15)'
      }
    },

    // Interactions
    mouse: {
      sensitivity: 0.0003,
      maxRotationX: 15 * Math.PI / 180,  // Convert to radians
      maxRotationY: 25 * Math.PI / 180,
      easing: 0.08
    },

    // Scroll effects
    scroll: {
      scaleStart: 1.0,
      scaleEnd: 0.7,
      opacityStart: 1.0,
      opacityEnd: 0.3,
      distance: 2 // viewport heights
    },

    // Animations
    animation: {
      breathing: {
        speed: 0.0008,
        amplitude: 0.05
      },
      autoRotation: 0.0001
    },

    // Performance
    performance: {
      targetFPSDesktop: 60,
      targetFPSMobile: 30,
      fpsCheckInterval: 1000,
      qualityAdjustThreshold: 45
    }
  };

  // State
  const state = {
    mouse: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 },
    currentRotation: { x: 0, y: 0 },
    scrollProgress: 0,
    time: 0,
    lastFrameTime: 0,
    fps: 60,
    frameCount: 0,
    lastFpsCheck: 0,
    isMobile: window.innerWidth < 768
  };

  // Three.js objects
  let scene, camera, renderer, geometry, material, mesh, canvas;

  /**
   * Initialize the WebGL scene
   */
  function init() {
    // Create canvas container
    canvas = document.createElement('div');
    canvas.id = 'webgl-background';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    // Setup Three.js
    setupScene();
    setupGeometry();
    setupRenderer();

    // Setup interactions
    setupMouseTracking();
    setupScrollTracking();
    setupThemeTracking();
    setupResizeHandler();

    // Start animation loop
    animate();

    console.log('WebGL background initialized');
  }

  /**
   * Setup Three.js scene and camera
   */
  function setupScene() {
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
  }

  /**
   * Create icosahedron geometry with wireframe material
   */
  function setupGeometry() {
    // Create base icosahedron
    const radius = (window.innerHeight * CONFIG.geometry.size) / 100;
    const detail = state.isMobile ? 1 : 2; // Subdivisions

    geometry = new THREE.IcosahedronGeometry(radius, detail);

    // Create wireframe material with theme-appropriate color
    const colors = getCurrentThemeColors();
    material = new THREE.LineBasicMaterial({
      color: colors.primary,
      linewidth: CONFIG.visual.lineWidth,
      transparent: true,
      opacity: 1.0
    });

    // Create wireframe mesh
    const wireframe = new THREE.WireframeGeometry(geometry);
    mesh = new THREE.LineSegments(wireframe, material);

    // Apply X-axis offset
    mesh.position.x = window.innerWidth * CONFIG.position.xOffset / 100;

    scene.add(mesh);
  }

  /**
   * Setup WebGL renderer
   */
  function setupRenderer() {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !state.isMobile, // Disable AA on mobile for performance
      powerPreference: state.isMobile ? 'low-power' : 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(state.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background

    canvas.appendChild(renderer.domElement);
  }

  /**
   * Get theme colors based on current theme
   */
  function getCurrentThemeColors() {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';

    return {
      primary: isDark ? CONFIG.visual.dark.primary : CONFIG.visual.light.primary,
      accent: isDark ? CONFIG.visual.dark.accent : CONFIG.visual.light.accent
    };
  }

  /**
   * Setup mouse/pointer tracking for parallax effect
   */
  function setupMouseTracking() {
    const handleMove = (e) => {
      // Normalize mouse position to -1 to 1 range
      state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Calculate target rotation with sensitivity and limits
      state.targetRotation.y = state.mouse.x * CONFIG.mouse.sensitivity * window.innerWidth;
      state.targetRotation.y = Math.max(-CONFIG.mouse.maxRotationX,
                                        Math.min(CONFIG.mouse.maxRotationX, state.targetRotation.y));

      state.targetRotation.x = state.mouse.y * CONFIG.mouse.sensitivity * window.innerHeight;
      state.targetRotation.x = Math.max(-CONFIG.mouse.maxRotationY,
                                        Math.min(CONFIG.mouse.maxRotationY, state.targetRotation.x));
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('pointermove', handleMove, { passive: true });
  }

  /**
   * Setup scroll tracking for transformations
   */
  function setupScrollTracking() {
    const handleScroll = () => {
      const scrollDistance = CONFIG.scroll.distance * window.innerHeight;
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate progress (0 to 1)
      state.scrollProgress = Math.min(scrolled / scrollDistance, 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
  }

  /**
   * Setup theme change tracking
   */
  function setupThemeTracking() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          updateThemeColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }

  /**
   * Update colors when theme changes
   */
  function updateThemeColors() {
    const colors = getCurrentThemeColors();

    // Parse RGBA color to THREE.Color and opacity
    const rgbaMatch = colors.primary.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]) / 255;
      const g = parseInt(rgbaMatch[2]) / 255;
      const b = parseInt(rgbaMatch[3]) / 255;
      const a = parseFloat(rgbaMatch[4] || 1);

      material.color.setRGB(r, g, b);
      material.opacity = a;
    }
  }

  /**
   * Setup window resize handler
   */
  function setupResizeHandler() {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        state.isMobile = window.innerWidth < 768;

        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(state.isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

        // Update geometry size and position
        const radius = (window.innerHeight * CONFIG.geometry.size) / 100;
        mesh.position.x = window.innerWidth * CONFIG.position.xOffset / 100;

        // Optionally rebuild geometry for mobile/desktop switch
        if (state.isMobile !== (geometry.parameters.detail === 1)) {
          rebuildGeometry();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }

  /**
   * Rebuild geometry (for mobile/desktop transition)
   */
  function rebuildGeometry() {
    const radius = (window.innerHeight * CONFIG.geometry.size) / 100;
    const detail = state.isMobile ? 1 : 2;

    // Remove old mesh
    scene.remove(mesh);
    geometry.dispose();

    // Create new geometry
    geometry = new THREE.IcosahedronGeometry(radius, detail);
    const wireframe = new THREE.WireframeGeometry(geometry);
    mesh = new THREE.LineSegments(wireframe, material);
    mesh.position.x = window.innerWidth * CONFIG.position.xOffset / 100;

    scene.add(mesh);
  }

  /**
   * Monitor FPS and adjust quality if needed
   */
  function monitorPerformance(deltaTime) {
    state.frameCount++;
    const now = performance.now();

    if (now - state.lastFpsCheck >= CONFIG.performance.fpsCheckInterval) {
      state.fps = state.frameCount;
      state.frameCount = 0;
      state.lastFpsCheck = now;

      // Auto-adjust quality if FPS drops too low
      const targetFPS = state.isMobile ?
        CONFIG.performance.targetFPSMobile :
        CONFIG.performance.targetFPSDesktop;

      if (state.fps < CONFIG.performance.qualityAdjustThreshold &&
          renderer.getPixelRatio() > 1) {
        console.log('Reducing quality due to low FPS:', state.fps);
        renderer.setPixelRatio(1);
      }
    }
  }

  /**
   * Animation loop
   */
  function animate(currentTime = 0) {
    requestAnimationFrame(animate);

    // Calculate delta time
    const deltaTime = currentTime - state.lastFrameTime;
    state.lastFrameTime = currentTime;
    state.time = currentTime;

    // Monitor performance
    monitorPerformance(deltaTime);

    // Apply eased mouse parallax rotation
    state.currentRotation.x += (state.targetRotation.x - state.currentRotation.x) * CONFIG.mouse.easing;
    state.currentRotation.y += (state.targetRotation.y - state.currentRotation.y) * CONFIG.mouse.easing;

    mesh.rotation.x = state.currentRotation.x;
    mesh.rotation.y = state.currentRotation.y;

    // Apply breathing animation
    const breathingScale = 1 + Math.sin(currentTime * CONFIG.animation.breathing.speed) *
                                CONFIG.animation.breathing.amplitude;

    // Apply scroll-based transformations
    const scrollScale = CONFIG.scroll.scaleStart -
                       (CONFIG.scroll.scaleStart - CONFIG.scroll.scaleEnd) * state.scrollProgress;
    const scrollOpacity = CONFIG.scroll.opacityStart -
                         (CONFIG.scroll.opacityStart - CONFIG.scroll.opacityEnd) * state.scrollProgress;

    // Combine breathing and scroll scale
    mesh.scale.setScalar(scrollScale * breathingScale);

    // Update opacity (combine scroll opacity with theme base opacity)
    const theme = document.documentElement.getAttribute('data-theme');
    const baseOpacity = theme === 'dark' ? 0.15 : 0.40;
    material.opacity = scrollOpacity * baseOpacity;

    // Apply auto-rotation
    mesh.rotation.z += CONFIG.animation.autoRotation;

    // Render
    renderer.render(scene, camera);
  }

  // Start initialization
  initWhenReady();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (renderer) {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    }
  });

})();
