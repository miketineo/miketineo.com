// PLEX design system — mobile nav disclosure. The site's only JS (SYSTEM.md 3.1).
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('site-nav');
  if (!toggle || !panel) return;

  function closePanel() {
    toggle.setAttribute('aria-expanded', 'false');
    panel.removeAttribute('data-open');
  }

  function openPanel() {
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('data-open', '');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) { closePanel(); } else { openPanel(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closePanel();
      toggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' &&
        !panel.contains(e.target) && !toggle.contains(e.target)) {
      closePanel();
    }
  });
})();
