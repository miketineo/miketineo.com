/**
 * Cookie Consent Manager for miketineo.com
 * GDPR-compliant cookie consent banner and PostHog analytics management
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'miketineo-cookie-consent',
    consentVersion: '2.0',
    posthogApiKey: 'phc_CefEYSP2v97ZazvvsctE6r8iKtej6qdubPyyaM8UR7Vs',
    posthogApiHost: 'https://eu.i.posthog.com'
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
    initializePostHog();
  }

  /**
   * Handle Decline button click
   */
  function handleDecline() {
    saveConsent(false);
    hideConsentBanner();
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
   * Initialize PostHog analytics (only if user has consented)
   */
  function initializePostHog() {
    // Check if PostHog is already loaded
    if (window.posthog && window.posthog.__loaded) {
      console.log('[Cookie Consent] PostHog already initialized');
      return;
    }

    console.log('[Cookie Consent] Loading PostHog analytics...');

    // Load PostHog library
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host?s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js":"https://eu-assets.i.posthog.com/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    // Initialize PostHog with configuration
    try {
      window.posthog.init(CONFIG.posthogApiKey, {
        api_host: CONFIG.posthogApiHost,
        person_profiles: 'always',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: true
        }
      });
      console.log('[Cookie Consent] PostHog initialized successfully');
    } catch (error) {
      console.error('[Cookie Consent] Error initializing PostHog:', error);
    }
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
      // Consent already stored
      if (consentState.accepted) {
        console.log('[Cookie Consent] User has accepted cookies, loading analytics');
        initializePostHog();
      } else {
        console.log('[Cookie Consent] User has declined cookies, analytics disabled');
      }
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
