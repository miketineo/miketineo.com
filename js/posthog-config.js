/**
 * posthog-config.js — everything about PostHog that is specific to
 * miketineo.com. The shared loader next to it (posthog-setup.js) is
 * byte-identical on every Audacity surface and CI asserts its sha256, so all
 * per-site knowledge lives here.
 *
 * Contract: ~/hack/miketineo/the-audacity/website/shared/analytics/README.md
 *
 * Load this FIRST and unblocked, then posthog-setup.js with defer:
 *
 *   <script src="/js/posthog-config.js"></script>
 *   <script src="/js/posthog-setup.js" defer></script>
 *
 * env is NOT set here: posthog-setup.js derives it from the hostname and skips
 * init entirely off production. That is the only possible fix for the bear
 * previews, which symlink this very js/ directory into preview/<slug>/ and so
 * load the literal same file as production.
 */
window.__PH_CONFIG = {
  key: 'phc_CefEYSP2v97ZazvvsctE6r8iKtej6qdubPyyaM8UR7Vs',
  product: 'miketineo',
  release_id: '__RELEASE_ID__',
  init: {
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '.ph-mask, [data-ph-mask]',
      minimumDurationMilliseconds: 5000,
      sampleRate: 0.1
    }
  },
  consent: {
    // cookie-consent.js owns this key and its {accepted, timestamp, version}
    // shape. Adapt it, never converge it: changing the format re-prompts every
    // visitor who has already consented.
    read: function () {
      try {
        var d = JSON.parse(localStorage.getItem('miketineo-cookie-consent') || 'null');
        return d ? !!d.accepted : null;   // true | false | null (undecided)
      } catch (e) { return null; }
    }
  }
};

// The 4-line stub queue. Page code can call these before posthog-setup.js has
// parsed; the module overwrites them and drains __PH_Q on execution.
window.phTrack    = function(){ (window.__PH_Q = window.__PH_Q || []).push(['capture'].concat([].slice.call(arguments))); };
window.phRegister = function(p){ (window.__PH_Q = window.__PH_Q || []).push(['register', p]); };
window.phConsent  = function(g){ (window.__PH_Q = window.__PH_Q || []).push(['consent', g]); };
