// Halal Finder — listing detail dialog.
//
// A real, accessible detail view for a single listing. Evidence honesty is
// the whole point of this surface:
//   · every value passes through escapeHtml (nothing raw is interpolated)
//   · missing source / expiry / last-checked are shown as "Not recorded",
//     never silently omitted
//   · an expired certificate_reviewed record resolves through the one shared
//     resolveEvidenceStatus() implementation in evidence.js and shows the
//     ExpiryDowngradeBanner copy; it is never shown as "Certificate reviewed"
//   · sample records say "Sample listing — fictional" and "Confirm with the
//     business." — fiction is never dressed up as verification
//   · sponsored placement is labelled and never touches evidence styling
//
// Accessibility: native <dialog> (role="dialog", aria-modal="true",
// aria-labelledby). A Tab trap keeps focus cycling inside the dialog,
// Esc/backdrop/Close buttons close it, and focus returns to the invoking
// button on close. The trap also covers browsers without showModal().

import { $, escapeHtml } from './dom.js';
import { getEvidenceDisplay } from './evidence.js';
import { typeLabel } from './listings.js';

const NOT_RECORDED = 'Not recorded';

let lastInvoker = null;
let previousBodyOverflow = null;

function asText(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function orNotRecorded(value) {
  return asText(value) || NOT_RECORDED;
}

// Safe external link: http/https only, always noopener noreferrer + _blank.
// Anything else (javascript:, data:, …) is rendered as plain text, never a link.
function sourceUrlHtml(url) {
  const clean = asText(url);
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) {
    return `<p class="detail-source-url"><a class="detail-link" href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer" dir="ltr">${escapeHtml(clean)}</a></p>`;
  }
  return `<p class="detail-source-url"><span class="detail-source-raw" dir="ltr">${escapeHtml(clean)}</span><span class="small muted"> — link not usable (only http/https URLs are shown as links).</span></p>`;
}

// Source line: name + licence + optional access date when present. If there
// is no provenance at all, say exactly that — treat with caution.
function sourceHtml(item) {
  const evidence = item.evidence && typeof item.evidence === 'object' ? item.evidence : {};
  const name = asText(item.sourceName) || asText(evidence.sourceName);
  const licence = asText(item.dataLicence) || asText(evidence.sourceLicence);
  const accessed =
    asText(item.sourceAccessedAt) ||
    asText(evidence.sourceAccessedAt) ||
    asText(evidence.accessedAt) ||
    asText(evidence.licenceAccessedAt);
  const url = asText(evidence.sourceUrl) || asText(item.sourceUrl);

  if (!name && !licence && !accessed && !url) {
    return '<p class="detail-source-missing"><span class="detail-source-marker" aria-hidden="true">!</span> Source not recorded — treat with caution.</p>';
  }

  const parts = [];
  if (name) parts.push(`<span class="detail-source-name">${escapeHtml(name)}</span>`);
  if (licence) parts.push(`Licence: ${escapeHtml(licence)}`);
  if (accessed) parts.push(`Accessed ${escapeHtml(accessed)}`);
  return `<p class="detail-source-line">${parts.join(' <span aria-hidden="true">·</span> ')}</p>${sourceUrlHtml(url)}`;
}

function rowHtml(label, value, { wide = false } = {}) {
  const content = asText(value) ? escapeHtml(asText(value)) : NOT_RECORDED;
  const cls = wide ? 'detail-row detail-row--wide' : 'detail-row';
  return `<div class="${cls}"><dt>${escapeHtml(label)}</dt><dd>${content}</dd></div>`;
}

function limitationsHtml(evidence) {
  const raw = Array.isArray(evidence.limitations) ? evidence.limitations : [];
  const items = raw.map(asText).filter(Boolean);
  if (!items.length) {
    return '<p class="detail-no-limitations muted">No limitations recorded. Absence of notes is not proof of coverage.</p>';
  }
  return `<ul class="detail-limitations">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function badgesHtml(item) {
  const badges = [];
  if (item.isSponsored) {
    // Sponsored is a placement label only — it never touches evidence styling.
    badges.push('<span class="featured sponsored-flag">Sponsored</span>');
  }
  if (item.featured) {
    badges.push('<span class="featured">Example promotion</span>');
  }
  if (item.isSample) {
    badges.push('<span class="sample-flag">Sample · fictional</span>');
  }
  return badges.length ? `<div class="detail-badges">${badges.join('')}</div>` : '';
}

function bodyHtml(item, display) {
  const evidence = item.evidence && typeof item.evidence === 'object' ? item.evidence : {};
  const parts = [];

  const badges = badgesHtml(item);
  if (badges) parts.push(badges);

  if (item.isSample) {
    parts.push(
      '<div class="notice detail-sample-notice" role="note"><strong>Sample listing — fictional.</strong> Confirm with the business.</div>',
    );
  }

  if (display.isDowngraded) {
    const dateText = escapeHtml(asText(evidence.expiryDate));
    parts.push(
      `<div class="notice detail-expiry-notice" role="alert">Certificate shown expired on ${dateText}; status downgraded to Not verified.</div>`,
    );
  }

  parts.push(
    `<p class="detail-evidence"><span class="evidence evidence--md ${escapeHtml(display.className)}"><span class="evidence-marker" aria-hidden="true">${escapeHtml(display.marker)}</span><span>${escapeHtml(display.label)}</span></span></p>`,
  );

  const desc = asText(item.desc);
  if (desc) parts.push(`<p class="detail-desc">${escapeHtml(desc)}</p>`);

  const cityLine = asText(item.cityLine) || [asText(item.city), asText(item.country)].filter(Boolean).join(', ');
  const rows = [];
  rows.push(`<div class="detail-row"><dt>Type</dt><dd>${escapeHtml(typeLabel(item.type))}</dd></div>`);
  rows.push(`<div class="detail-row"><dt>Cuisine</dt><dd>${escapeHtml(orNotRecorded(item.cuisine))}</dd></div>`);
  rows.push(`<div class="detail-row"><dt>Location</dt><dd>${escapeHtml(cityLine || NOT_RECORDED)}</dd></div>`);
  const address = asText(item.address);
  if (address) {
    rows.push(`<div class="detail-row detail-row--wide"><dt>Address</dt><dd>${escapeHtml(address)}</dd></div>`);
  }
  parts.push(`<dl class="detail-facts">${rows.join('')}</dl>`);

  const evidenceRows = [];
  evidenceRows.push(`<div class="detail-row detail-row--wide"><dt>Source</dt><dd>${sourceHtml(item)}</dd></div>`);
  evidenceRows.push(rowHtml('Issuer', orNotRecorded(evidence.issuer)));
  const scope = asText(evidence.scope);
  evidenceRows.push(
    `<div class="detail-row detail-row--wide"><dt>Scope</dt><dd>${escapeHtml(scope || `${NOT_RECORDED} — what the evidence covers is unknown.`)}</dd></div>`,
  );
  evidenceRows.push(rowHtml('Issue date', orNotRecorded(evidence.issueDate)));
  evidenceRows.push(rowHtml('Expiry date', orNotRecorded(evidence.expiryDate)));
  // Last checked is always shown; absence is stated, never hidden.
  evidenceRows.push(rowHtml('Last checked', orNotRecorded(evidence.lastCheckedAt)));
  const nextReview = asText(evidence.nextReviewDate);
  if (nextReview) {
    evidenceRows.push(rowHtml('Next review', nextReview));
  }
  // Reviewer role only — never a personal identity.
  evidenceRows.push(rowHtml('Reviewer', orNotRecorded(evidence.reviewerRole)));
  const certificateId = asText(evidence.certificateId);
  if (certificateId) {
    evidenceRows.push(rowHtml('Certificate ID', certificateId));
  }
  parts.push(
    `<section class="detail-section" aria-label="Evidence"><h3 class="detail-section-title">Evidence</h3><dl class="detail-facts">${evidenceRows.join('')}</dl></section>`,
  );

  parts.push(
    `<section class="detail-section" aria-label="Limitations"><h3 class="detail-section-title">Limitations</h3>${limitationsHtml(evidence)}</section>`,
  );

  return parts.join('');
}

function renderDetail(item) {
  const dialog = $('listingDetailDialog');
  if (!dialog) return false;
  const display = getEvidenceDisplay(item.evidence);
  const title = $('listingDetailTitle');
  const subtitle = $('listingDetailSubtitle');
  const body = $('listingDetailBody');
  if (title) title.textContent = asText(item.name) || 'Listing';
  if (subtitle) {
    const cityLine = asText(item.cityLine) || [asText(item.city), asText(item.country)].filter(Boolean).join(', ');
    subtitle.textContent = cityLine || 'Location not recorded';
  }
  if (body) body.innerHTML = bodyHtml(item, display);
  return true;
}

function lockScroll() {
  if (document.body && previousBodyOverflow === null) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
}

function unlockScroll() {
  if (document.body && previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = null;
  }
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Focus trap for both native modal dialogs and the no-showModal fallback:
// keep Tab / Shift+Tab cycling inside the dialog, and recover focus into the
// dialog if it ever lands outside.
function trapTabKey(event) {
  const dialog = $('listingDetailDialog');
  if (!dialog || !dialog.hasAttribute('open')) return;
  const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true',
  );
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const index = focusable.indexOf(active);
  if (index === -1) {
    // Focus is outside the cycle (e.g. the JS-focused title or <body>):
    // pull it back to the nearest boundary.
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }
  if (event.shiftKey && index === 0) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && index === focusable.length - 1) {
    event.preventDefault();
    first.focus();
  }
}

function onDialogKeydown(event) {
  if (event.key === 'Tab') {
    trapTabKey(event);
  } else if (event.key === 'Escape') {
    closeListingDetail();
  }
}

export function isListingDetailOpen() {
  const dialog = $('listingDetailDialog');
  return Boolean(dialog && dialog.open);
}

export function openListingDetail(item, invoker) {
  const dialog = $('listingDetailDialog');
  if (!dialog || !item || typeof item !== 'object') return false;

  lastInvoker =
    invoker instanceof HTMLElement
      ? invoker
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  if (!renderDetail(item)) return false;

  lockScroll();
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
  } else {
    // Fallback for engines without <dialog> showModal: emulate modal behaviour.
    dialog.setAttribute('open', '');
    document.body.classList.add('detail-open-fallback');
  }

  const title = $('listingDetailTitle');
  if (title) title.focus();
  return true;
}

export function closeListingDetail() {
  const dialog = $('listingDetailDialog');
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
    // close() removes the open attribute synchronously but the 'close'
    // event is queued — unlock scroll and restore focus right away.
    handleClosed();
  } else if (dialog.hasAttribute('open')) {
    dialog.removeAttribute('open');
    handleClosed();
  }
}

function handleClosed() {
  unlockScroll();
  if (document.body) document.body.classList.remove('detail-open-fallback');
  if (lastInvoker && document.contains(lastInvoker)) {
    lastInvoker.focus();
  }
  lastInvoker = null;
}

// Wire the static dialog chrome once (close buttons, backdrop, close event).
export function initListingDetail() {
  const dialog = $('listingDetailDialog');
  if (!dialog) return;

  dialog.addEventListener('click', (event) => {
    // Backdrop click: the click lands on the <dialog> element itself.
    if (event.target === dialog) {
      closeListingDetail();
      return;
    }
    const closer = event.target.closest('[data-action="close-detail"]');
    if (closer) closeListingDetail();
  });

  // Escape fires 'cancel' before the dialog closes; unlock/restore then,
  // synchronously, as a belt-and-braces alongside the queued 'close' event.
  dialog.addEventListener('cancel', handleClosed);
  dialog.addEventListener('close', handleClosed);
  // Single keydown handler: Tab trap + Escape close (works in engines where
  // the native Esc path or the 'close' event are unreliable).
  dialog.addEventListener('keydown', onDialogKeydown);

  const closeBtn = $('listingDetailCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeListingDetail);
}
