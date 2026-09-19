/**
 * Cookie Consent Manager for miketineo.com
 * GDPR-compliant cookie consent banner. This file owns the banner and the
 * stored choice only; PostHog itself is loaded and configured by
 * js/posthog-setup.js + js/posthog-config.js, which this file drives through
 * window.phConsent(true|false).
 *
 * Contract: ~/hack/miketineo/the-audacity/website/shared/analytics/README.md
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'miketineo-cookie-consent',
    consentVersion: '2.0'
  };

  // Consent state
  let consentState = null;

  /**
   * Get consent data from localStorage
   * @returns {Object|null} Consent data or null if not set
   */
  function getConsent() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Validate consent data structure
      if (typeof data.accepted !== 'boolean' || !data.timestamp || !data.version) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading consent data:', error);
      return null;
    }
  }

  /**
   * Save consent preference to localStorage
   * @param {boolean} accepted - User's consent choice
   */
  function saveConsent(accepted) {
    const consentData = {
      accepted: accepted,
      timestamp: Date.now(),
      version: CONFIG.consentVersion
    };

    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(consentData));
      consentState = consentData;
      console.log(`[Cookie Consent] User ${accepted ? 'accepted' : 'declined'} cookies`);
    } catch (error) {
      console.error('Error saving consent data:', error);
    }
  }

  /**
   * Create and display the cookie consent banner
   */
  function showConsentBanner() {
    // Check if banner already exists
    if (document.getElementById('cookie-consent-banner')) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');

    banner.innerHTML = `
      <div class="cookie-consent-content">
        <div class="cookie-consent-message">
          <span class="cookie-icon" aria-hidden="true">🍪</span>
          <p>
            We use cookies to improve your experience and analyze site traffic.
            <a href="#privacy" class="cookie-privacy-link" id="cookie-privacy-link">Learn more</a>
          </p>
        </div>
        <div class="cookie-consent-buttons">
          <button
            type="button"
            class="btn btn-primary cookie-accept"
            id="cookie-accept-btn"
            aria-label="Accept cookies">
            Accept All
          </button>
          <button
            type="button"
            class="btn btn-secondary cookie-decline"
            id="cookie-decline-btn"
            aria-label="Decline cookies">
            Decline
          </button>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(banner);

    // Add event listeners
    const acceptBtn = document.getElementById('cookie-accept-btn');
    const declineBtn = document.getElementById('cookie-decline-btn');
    const privacyLink = document.getElementById('cookie-privacy-link');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', handleAccept);
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', handleDecline);
    }

    if (privacyLink) {
      privacyLink.addEventListener('click', handlePrivacyLink);
    }

    // Trigger fade-in animation
    setTimeout(() => {
      banner.classList.add('cookie-consent-visible');
    }, 100);

    // Focus management for accessibility
    setTimeout(() => {
      acceptBtn && acceptBtn.focus();
    }, 500);
  }

  /**
   * Hide and remove the cookie consent banner
   */
  function hideConsentBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('cookie-consent-visible');

      // Remove from DOM after animation completes
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }

  /**
   * Handle Accept button click
   */
  function handleAccept() {
    saveConsent(true);
    hideConsentBanner();
    window.phConsent(true);
  }

  /**
   * Handle Decline button click
   */
  function handleDecline() {
    saveConsent(false);
    hideConsentBanner();
    // Also opts out an already-booted PostHog, so accept -> Cookie Settings ->
    // decline stops capturing immediately instead of on the next reload.
    window.phConsent(false);
    console.log('[Cookie Consent] Analytics disabled: User declined cookies');
  }

  /**
   * Handle privacy link click
   */
  function handlePrivacyLink(event) {
    event.preventDefault();
    alert('We use PostHog to understand how visitors use our site. This helps us improve user experience. You can opt out anytime by changing your cookie preferences in the footer.');
  }

  /**
   * Re-show the consent banner (for Cookie Settings link)
   */
  function resetConsent() {
    // Remove existing consent
    try {
      localStorage.removeItem(CONFIG.storageKey);
      consentState = null;
      console.log('[Cookie Consent] Consent reset, showing banner');
    } catch (error) {
      console.error('Error resetting consent:', error);
    }

    // Show banner again
    showConsentBanner();
  }

  /**
   * Initialize cookie consent system
   */
  function initCookieConsent() {
    // Check for existing consent
    consentState = getConsent();

    if (consentState === null) {
      // No consent stored - show banner
      console.log('[Cookie Consent] No consent found, showing banner');
      showConsentBanner();
    } else {
      // A stored choice needs no call: posthog-config.js reads this same key
      // through its consent adapter before posthog-setup.js decides to boot.
      console.log(`[Cookie Consent] Stored consent: ${consentState.accepted ? 'accepted' : 'declined'}`);
    }

    // Setup Cookie Settings link in footer (if it exists)
    setupCookieSettingsLink();
  }

  /**
   * Setup the Cookie Settings link in footer
   */
  function setupCookieSettingsLink() {
    // Use setTimeout to ensure DOM is fully loaded
    setTimeout(() => {
      const cookieSettingsLinks = document.querySelectorAll('[href="#cookie-settings"], #cookie-settings-link');

      cookieSettingsLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          resetConsent();
        });
      });

      if (cookieSettingsLinks.length > 0) {
        console.log(`[Cookie Consent] Setup ${cookieSettingsLinks.length} Cookie Settings link(s)`);
      }
    }, 100);
  }

  /**
   * Public API
   */
  window.CookieConsent = {
    init: initCookieConsent,
    resetConsent: resetConsent,
    getConsent: getConsent,
    hasAccepted: function() {
      const consent = getConsent();
      return consent ? consent.accepted : false;
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    // DOM already loaded
    initCookieConsent();
  }

})();
