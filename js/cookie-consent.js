/**
 * Cookie Consent Manager for miketineo.com
 * GDPR-compliant cookie consent banner and Mixpanel analytics management
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'miketineo-cookie-consent',
    consentVersion: '1.0',
    mixpanelToken: 'cb4406fcec4756c1b586092081f64c21',
    mixpanelApiHost: 'https://api-eu.mixpanel.com'
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
    initializeMixpanel();
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
    alert('We use Mixpanel to understand how visitors use our site. This helps us improve user experience. You can opt out anytime by changing your cookie preferences in the footer.');
  }

  /**
   * Initialize Mixpanel analytics (only if user has consented)
   */
  function initializeMixpanel() {
    // Check if Mixpanel is already loaded
    if (window.mixpanel && typeof window.mixpanel.init === 'function') {
      console.log('[Cookie Consent] Mixpanel already initialized');
      return;
    }

    console.log('[Cookie Consent] Loading Mixpanel analytics...');

    // Load Mixpanel library
    (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?
    MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);

    // Initialize Mixpanel with configuration
    try {
      window.mixpanel.init(CONFIG.mixpanelToken, {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: CONFIG.mixpanelApiHost
      });
      console.log('[Cookie Consent] Mixpanel initialized successfully');
    } catch (error) {
      console.error('[Cookie Consent] Error initializing Mixpanel:', error);
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
        initializeMixpanel();
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
