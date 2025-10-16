/**
 * Theme Manager for miketineo.com
 * Handles light/dark/auto theme switching with localStorage persistence
 * Uses minimal single-button toggle design
 */

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'auto';
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    this.themeOrder = ['light', 'auto', 'dark'];

    // Apply theme immediately (before page renders)
    this.applyTheme();

    // Setup after DOM loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.setupToggle();
    this.setupSystemListener();
    this.updateMetaThemeColor();
  }

  applyTheme() {
    let effectiveTheme = this.theme;

    if (this.theme === 'auto') {
      effectiveTheme = this.systemPreference.matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }

  setupToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Set initial state
    this.updateToggle();

    // Add click handler - cycles through themes
    toggle.addEventListener('click', () => {
      this.cycleTheme();
    });
  }

  cycleTheme() {
    const currentIndex = this.themeOrder.indexOf(this.theme);
    const nextIndex = (currentIndex + 1) % this.themeOrder.length;
    const nextTheme = this.themeOrder[nextIndex];

    this.setTheme(nextTheme);
  }

  setupSystemListener() {
    this.systemPreference.addEventListener('change', (e) => {
      if (this.theme === 'auto') {
        this.applyTheme();
        this.updateMetaThemeColor();
      }
    });
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('theme', theme);

    // Add transitioning class to prevent jarring animations
    document.documentElement.classList.add('theme-transitioning');

    this.applyTheme();
    this.updateToggle();
    this.updateMetaThemeColor();

    // Remove transitioning class after a brief moment
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 50);
  }

  updateToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Update data attribute for CSS positioning
    toggle.setAttribute('data-current-theme', this.theme);

    // Update icon
    const icon = toggle.querySelector('.theme-toggle-icon');
    if (icon) {
      icon.innerHTML = this.getIconForTheme(this.theme);
    }

    // Update aria-label
    toggle.setAttribute('aria-label', `Current theme: ${this.theme}. Click to cycle through themes.`);
  }

  getIconForTheme(theme) {
    const icons = {
      light: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>`,
      auto: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 14h-1V7a3 3 0 00-3-3H7a3 3 0 00-3 3v7H3a1 1 0 00-1 1v2a3 3 0 003 3h14a3 3 0 003-3v-2a1 1 0 00-1-1zM6 7a1 1 0 011-1h10a1 1 0 011 1v7H6V7z"/>
      </svg>`,
      dark: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73 8.15 8.15 0 01-8.14-8.1 8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.36-1.05z"/>
      </svg>`
    };
    return icons[theme] || icons.auto;
  }

  updateMetaThemeColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'dark' ? '#0F0F0F' : '#FFFFFF';

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = color;
  }
}

// Initialize theme manager
new ThemeManager();
