/**
 * Feature-flag gate for content that ships dark.
 *
 * Elements carry `data-flag="<key>"` plus the `hidden` attribute. They are
 * revealed when PostHog reports the flag enabled for this visitor, or when the
 * reviewer override is set: open any page with `?ff=<key>` to turn a flag on
 * for this browser (stored in localStorage), `?ff=-<key>` to turn it off.
 *
 * PostHog only exists after cookie consent (cookie-consent.js dispatches
 * `posthog:ready` once it has initialised), so for visitors who have not
 * consented a flag can only be on through the override.
 *
 * Elements with `data-ph-event="<name>"` send a named PostHog event on click,
 * when PostHog is loaded.
 */
(function () {
  'use strict';

  var STORAGE_PREFIX = 'ff:';

  function flaggedElements() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-flag]'));
  }

  function applyOverrideFromUrl() {
    var value = new URLSearchParams(window.location.search).get('ff');
    if (!value) return;
    try {
      if (value.charAt(0) === '-') {
        localStorage.removeItem(STORAGE_PREFIX + value.slice(1));
      } else {
        localStorage.setItem(STORAGE_PREFIX + value, '1');
      }
    } catch (error) {
      // Storage unavailable: the override cannot persist, nothing else to do.
    }
  }

  function applyStoredOverrides() {
    flaggedElements().forEach(function (el) {
      try {
        if (localStorage.getItem(STORAGE_PREFIX + el.getAttribute('data-flag')) === '1') {
          el.hidden = false;
        }
      } catch (error) {
        // Storage unavailable: leave the element as shipped.
      }
    });
  }

  function applyPostHogFlags() {
    var posthog = window.posthog;
    if (!posthog || typeof posthog.onFeatureFlags !== 'function') return;
    posthog.onFeatureFlags(function () {
      flaggedElements().forEach(function (el) {
        if (posthog.isFeatureEnabled(el.getAttribute('data-flag'))) {
          el.hidden = false;
        }
      });
    });
  }

  function captureNamedClicks() {
    document.addEventListener('click', function (event) {
      var el = event.target.closest ? event.target.closest('[data-ph-event]') : null;
      if (!el || !window.posthog || typeof window.posthog.capture !== 'function') return;
      window.posthog.capture(el.getAttribute('data-ph-event'), {
        href: el.getAttribute('href') || null,
        page: window.location.pathname
      });
    });
  }

  applyOverrideFromUrl();
  applyStoredOverrides();
  if (window.posthog && window.posthog.__loaded) applyPostHogFlags();
  document.addEventListener('posthog:ready', applyPostHogFlags);
  captureNamedClicks();
})();
