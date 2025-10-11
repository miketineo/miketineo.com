/**
 * Theme Manager for miketineo.com
 * Handles light/dark/auto theme switching with localStorage persistence
 */

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'auto';
    this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)');

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
    this.setupButtons();
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

  setupButtons() {
    const buttons = document.querySelectorAll('.theme-btn');

    buttons.forEach(btn => {
      // Set initial active state
      if (btn.dataset.theme === this.theme) {
        btn.classList.add('active');
      }

      // Add click handler
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });
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
    this.updateButtons();
    this.updateMetaThemeColor();

    // Remove transitioning class after a brief moment
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 50);
  }

  updateButtons() {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
      if (btn.dataset.theme === this.theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
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
