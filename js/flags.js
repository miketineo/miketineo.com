/**
 * Feature-flag gate for content that ships dark.
 *
 * Elements carry `data-flag="<key>"` plus the `hidden` attribute. They are
 * revealed when PostHog reports the flag enabled for this visitor, or when the
 * reviewer override is set: open any page with `?ff=<key>` to turn a flag on
 * for this browser (stored in localStorage), `?ff=-<key>` to turn it off.
 *
 * PostHog is loaded by the shared module (js/posthog-setup.js): production
 * hostnames only, and only after consent. `window.posthog` therefore may not
 * exist at load, and may appear later when the banner calls
 * `window.phConsent(true)`, so this script checks once at load (covers
 * returning consented visitors, the module boots synchronously before this
 * defer script runs) and wraps phConsent for late accepts. Off production and
 * pre-consent, a flag can only be on through the override.
 *
 * Elements with `data-ph-event="<name>"` send a named event on click through
 * `window.phTrack`, the shared module's buffered capture stub: safe to call
 * before PostHog loads, a no-op off production.
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
      if (!el || typeof window.phTrack !== 'function') return;
      window.phTrack(el.getAttribute('data-ph-event'), {
        href: el.getAttribute('href') || null,
        page: window.location.pathname
      });
    });
  }

  applyOverrideFromUrl();
  applyStoredOverrides();
  applyPostHogFlags();

  var previousConsent = window.phConsent;
  if (typeof previousConsent === 'function') {
    window.phConsent = function (granted) {
      previousConsent.apply(null, arguments);
      if (granted) applyPostHogFlags();
    };
  }

  captureNamedClicks();
})();
