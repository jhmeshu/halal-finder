// Halal Finder — Privacy & Trust Promise dialog.
//
// Accessible modal displaying Halal Finder's Sacred Trust & Privacy Invariants:
// - Data minimization: Saved places stored locally on device; zero tracking.
// - Location privacy: No GPS required to search; manual city/postcode first.
// - No pay-to-verify: Sponsored places never alter evidence status.
// - Evidence honesty: 5 distinct evidence statuses; automatic expiration downgrade.
// - Ingredient screening: Informational triage only, never a religious ruling.
// - Attribution: Open Food Facts and OpenStreetMap compliance.

import { $ } from './dom.js';

let lastInvoker = null;
let previousBodyOverflow = null;

function onDialogKeydown(event) {
  if (event.key === 'Escape') {
    closePrivacy();
    return;
  }
  if (event.key !== 'Tab') return;

  const dialog = $('privacyDialog');
  if (!dialog) return;

  const focusables = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function openPrivacy(invoker = null) {
  const dialog = $('privacyDialog');
  if (!dialog) return;

  lastInvoker = invoker || document.activeElement;

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  const title = $('privacyDialogTitle');
  if (title) {
    title.focus();
  }
}

export function closePrivacy() {
  const dialog = $('privacyDialog');
  if (!dialog) return;

  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
    if (previousBodyOverflow !== null) {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = null;
    }
  }

  if (lastInvoker && typeof lastInvoker.focus === 'function') {
    lastInvoker.focus();
    lastInvoker = null;
  }
}

export function initPrivacy() {
  const dialog = $('privacyDialog');
  if (!dialog) return;

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closePrivacy();
      return;
    }
    const closer = event.target.closest('[data-action="close-privacy"]');
    if (closer) closePrivacy();
  });

  dialog.addEventListener('cancel', () => {
    if (lastInvoker && typeof lastInvoker.focus === 'function') {
      lastInvoker.focus();
      lastInvoker = null;
    }
  });

  dialog.addEventListener('keydown', onDialogKeydown);

  const closeBtn = $('privacyDialogCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closePrivacy);

  // Wire all openers across header / footer / hero
  document.querySelectorAll('[data-action="open-privacy"]').forEach((btn) => {
    btn.addEventListener('click', (e) => openPrivacy(e.currentTarget));
  });
}
