/**
 * main.js - Navigation, animations, and general utilities
 * miketineo.com
 */

(function() {
  'use strict';

  // =====================================================
  // Mobile Navigation Toggle
  // =====================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';

      // Toggle menu visibility
      navMenu.classList.toggle('active');

      // Update ARIA attribute
      navToggle.setAttribute('aria-expanded', !isExpanded);

      // Animate hamburger icon
      navToggle.classList.toggle('active');
    });

    // Close menu when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
      if (!isClickInsideNav && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      }
    });
  }

  // =====================================================
  // Hide/Show Navigation on Scroll
  // =====================================================
  let lastScrollTop = 0;
  const nav = document.querySelector('.nav');
  const scrollThreshold = 100;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Don't hide nav at the very top of the page
    if (scrollTop < scrollThreshold) {
      nav.classList.remove('hidden');
      return;
    }

    // Hide on scroll down, show on scroll up
    if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }

    lastScrollTop = scrollTop;
  }, { passive: true });

  // =====================================================
  // Smooth Scroll for Anchor Links
  // =====================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip if href is just "#"
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();

        const navHeight = nav ? nav.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - navHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =====================================================
  // Set Active Navigation Link Based on Current Page
  // =====================================================
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkPath = new URL(link.href).pathname;

      // Exact match or if we're on a subpage
      if (linkPath === currentPath ||
          (linkPath !== '/' && currentPath.startsWith(linkPath))) {
        link.classList.add('active');
      }
    });
  }

  setActiveNavLink();

  // =====================================================
  // Fade-in Animation on Scroll (Intersection Observer)
  // =====================================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  document.querySelectorAll('.card, .hero-content, .metric-card, .talk-card').forEach(el => {
    observer.observe(el);
  });

  // =====================================================
  // Toast Notification System
  // =====================================================
  window.showToast = function(message, type = 'success', duration = 4000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Add to document
    document.body.appendChild(toast);

    // Auto-remove after duration
    setTimeout(() => {
      toast.style.animation = 'slideOutDown 300ms ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  };

  // =====================================================
  // External Link Handling (open in new tab with security)
  // =====================================================
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    // Skip if link is to the same domain
    if (link.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // =====================================================
  // Keyboard Navigation Improvements
  // =====================================================
  // Trap focus in mobile menu when open
  if (navMenu) {
    navMenu.addEventListener('keydown', function(e) {
      if (!navMenu.classList.contains('active')) return;

      const focusableElements = navMenu.querySelectorAll('a[href], button:not([disabled])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Trap tab key
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }

      // Close on Escape
      if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // =====================================================
  // Console Easter Egg
  // =====================================================
  console.log('%c👋 Hi there!', 'font-size: 20px; font-weight: bold; color: #004BFF;');
  console.log('%cInterested in how this site was built?', 'font-size: 14px;');
  console.log('%cIt\'s a simple, performant static site with vanilla JS. No frameworks, no build tools.', 'font-size: 12px; color: #666;');
  console.log('%cCheck out the source: https://github.com/miketineo/miketineo.com', 'font-size: 12px; color: #004BFF;');

  // =====================================================
  // Log Page Load Performance
  // =====================================================
  window.addEventListener('load', function() {
    if (window.performance && window.performance.timing) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`Page loaded in ${pageLoadTime}ms`);
    }
  });

})();
