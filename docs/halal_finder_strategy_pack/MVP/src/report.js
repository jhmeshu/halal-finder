// Halal Finder — correction report (local preview, zero network).
//
// There is no backend and no published feedback address in this repo, so a
// correction report can never leave the device from here. This module builds
// an accessible dialog that:
//   · collects a reason (required), an optional note and an optional
//     http(s) source URL — and nothing else. No name, email, phone or
//     precise location fields exist, and no draft is persisted anywhere;
//   · validates inline (aria-invalid / aria-describedby, errors on submit);
//   · renders a LOCAL preview of the report (listing id/name/city, reason,
//     note, source URL, prepared date, fictional-sample labelling when the
//     listing is a sample) with a clear "not submitted" disclaimer;
//   · offers "Copy report" via the Clipboard API, falling back to selecting
//     the read-only report-text textarea for manual copy;
//   · shows "Feedback channel not configured yet — nothing can be submitted."
//     while HF_FEEDBACK_EMAIL is empty. If a monitored address is ever set in
//     config.js, a mailto link with prefilled subject/body is rendered
//     instead. No other delivery path exists.
//
// Trust rules honoured here:
//   · the listing never changes automatically; a reviewer decides what, if
//     anything, changes — the copy says exactly that;
//   · wording avoids alleging dishonesty — reports describe what may be
//     outdated / inaccurate / misleading, never fraud or lying;
//   · reports for fictional sample listings are labelled fictional;
//   · everything interpolated into HTML passes through escapeHtml.
//
// Accessibility mirrors detail.js: native <dialog> (role="dialog",
// aria-modal="true", aria-labelledby/describedby), a Tab trap, Esc/backdrop/
// Close handling, focus moved into the dialog on open and restored to the
// invoking "Report a correction" button on close. The detail dialog stays
// open underneath and keeps its own state.

import { $, escapeHtml } from './dom.js';
import { HF_FEEDBACK_EMAIL } from './config.js';
import { listingKey } from './listings.js';

const MAX_NOTE = 1000;

// Reason values are stable identifiers (they would enter a moderation queue
// in a future backend); labels are deliberately free of blame.
const REASON_LABELS = Object.freeze({
  outdated: 'Information looks outdated',
  expired: 'Evidence or certificate may be expired',
  incorrect: 'Something looks incorrect',
  misleading: 'Something may be misleading',
  closed: 'The place may be closed',
  duplicate: 'This may duplicate another listing',
  other: 'Something else',
});

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

let currentItem = null;
let lastInvoker = null;
let preparedAt = null;

function asText(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function cityLineOf(item) {
  if (!item || typeof item !== 'object') return '';
  const direct = asText(item.cityLine);
  if (direct) return direct;
  return [asText(item.city), asText(item.country)].filter(Boolean).join(', ');
}

function isSampleOf(item) {
  return Boolean(item) && (item.isSample === true || item.fictional === true);
}

const preparedFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatPrepared(date) {
  try {
    return preparedFormatter.format(date);
  } catch {
    return date.toISOString();
  }
}

// ---------- Field-level errors (aria-invalid + aria-describedby) ----------

function errorParts(errorEl) {
  return {
    box: errorEl,
    text: errorEl ? errorEl.querySelector('.field-error-text') : null,
  };
}

function setFieldError(field, errorEl, hintId, message) {
  const { box, text } = errorParts(errorEl);
  if (!field || !box || !text) return;
  text.textContent = message;
  box.hidden = false;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', `${hintId} ${box.id}`.trim());
}

function clearFieldError(field, errorEl, hintId) {
  const { box } = errorParts(errorEl);
  if (field) {
    field.removeAttribute('aria-invalid');
    if (hintId) field.setAttribute('aria-describedby', hintId);
    else field.removeAttribute('aria-describedby');
  }
  if (box) {
    box.hidden = true;
    const text = box.querySelector('.field-error-text');
    if (text) text.textContent = '';
  }
}

function clearAllErrors() {
  clearFieldError($('reportReason'), $('reportReasonError'), 'reportReasonHint');
  clearFieldError($('reportNote'), $('reportNoteError'), 'reportNoteHint');
  clearFieldError($('reportSourceUrl'), $('reportSourceUrlError'), 'reportSourceUrlHint');
}

function isHttpUrl(value) {
  // Accept only absolute http(s) URLs; parse to reject malformed input.
  if (!/^https?:\/\/\S+$/i.test(value)) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Returns { ok, reason, note, sourceUrl }. Shows inline errors when invalid.
function validateForm() {
  clearAllErrors();
  const reasonField = $('reportReason');
  const noteField = $('reportNote');
  const urlField = $('reportSourceUrl');

  const reason = reasonField ? reasonField.value : '';
  const note = noteField ? asText(noteField.value) : '';
  const sourceUrl = urlField ? asText(urlField.value) : '';

  let firstInvalid = null;

  if (!reason || !Object.prototype.hasOwnProperty.call(REASON_LABELS, reason)) {
    setFieldError(
      reasonField,
      $('reportReasonError'),
      'reportReasonHint',
      'Choose the option that best fits.',
    );
    firstInvalid = firstInvalid || reasonField;
  }

  if (note.length > MAX_NOTE) {
    setFieldError(
      noteField,
      $('reportNoteError'),
      'reportNoteHint',
      `Keep the note under ${MAX_NOTE} characters.`,
    );
    firstInvalid = firstInvalid || noteField;
  }

  if (sourceUrl && !isHttpUrl(sourceUrl)) {
    setFieldError(
      urlField,
      $('reportSourceUrlError'),
      'reportSourceUrlHint',
      'Enter a full http(s) link, like https://example.com/page — or leave this empty.',
    );
    firstInvalid = firstInvalid || urlField;
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return { ok: false };
  }
  return { ok: true, reason, note, sourceUrl };
}

// ---------- Report text building (preview + copy share one source) ----------

function reportLines(item, prepared, fields) {
  const name = asText(item && item.name) || 'Unnamed listing';
  const key = listingKey(item && item.id);
  const where = cityLineOf(item);
  const lines = [
    'Halal Finder — correction report (NOT SUBMITTED)',
    `Prepared: ${formatPrepared(prepared)} · ${prepared.toISOString()}`,
    'Nothing is sent from this app. This report has not been submitted and the listing will not change automatically; a reviewer decides what, if anything, changes.',
    `Listing: #${key} — ${name}${where ? ` · ${where}` : ''}`,
  ];
  if (isSampleOf(item)) {
    lines.push('Sample listing: fictional — this report concerns a fictional sample place.');
  }
  lines.push(`Reason: ${REASON_LABELS[fields.reason]} (${fields.reason})`);
  lines.push(`Note: ${fields.note ? fields.note : '(none)'}`);
  lines.push(`Source link: ${fields.sourceUrl ? fields.sourceUrl : '(none)'}`);
  return lines;
}

function buildReportText(item, prepared, fields) {
  return reportLines(item, prepared, fields).join('\n');
}

function previewRow(label, valueHtml, { wide = false } = {}) {
  const cls = wide ? 'detail-row detail-row--wide' : 'detail-row';
  return `<div class="${cls}"><dt>${escapeHtml(label)}</dt><dd>${valueHtml}</dd></div>`;
}

function renderPreview(item, prepared, fields) {
  const facts = $('reportPreviewFacts');
  if (!facts) return;
  const name = asText(item.name) || 'Unnamed listing';
  const key = listingKey(item.id);
  const where = cityLineOf(item) || 'Not recorded';

  const rows = [
    previewRow('Listing', `${escapeHtml(name)} <span class="muted">· #${escapeHtml(key)}</span>`),
    previewRow('Location', escapeHtml(where)),
    previewRow('Reason', escapeHtml(REASON_LABELS[fields.reason])),
    previewRow(
      'Note',
      fields.note
        ? `<span class="report-note-value">${escapeHtml(fields.note)}</span>`
        : 'None',
      { wide: true },
    ),
    previewRow(
      'Source link',
      fields.sourceUrl
        ? `<span class="report-source-value" dir="ltr">${escapeHtml(fields.sourceUrl)}</span>`
        : 'None',
      { wide: true },
    ),
    previewRow('Prepared', escapeHtml(formatPrepared(prepared))),
  ];
  facts.innerHTML = rows.join('');

  const sampleNote = $('reportPreviewSample');
  if (sampleNote) sampleNote.hidden = !isSampleOf(item);
}

// Render (or hide) the feedback-channel action for the prepared report.
// While HF_FEEDBACK_EMAIL is empty the mailto link stays hidden and the
// unconfigured notice is visible; no delivery path is advertised.
function renderFeedbackChannel(text) {
  const mailto = $('reportMailtoLink');
  const unconfigured = $('reportFeedbackUnconfigured');
  if (HF_FEEDBACK_EMAIL) {
    const name = currentItem ? asText(currentItem.name) : '';
    const subject = `Halal Finder correction report${name ? ` — ${name}` : ''}`;
    if (mailto) {
      // Config value is trusted (not user input); keep it readable in the
      // href. Subject/body are user-influenced and always encoded.
      mailto.href = `mailto:${HF_FEEDBACK_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(text)}`;
      mailto.hidden = false;
    }
    if (unconfigured) unconfigured.hidden = true;
  } else {
    if (mailto) {
      mailto.hidden = true;
      mailto.removeAttribute('href');
    }
    if (unconfigured) unconfigured.hidden = false;
  }
}

// ---------- Dialog lifecycle (mirrors detail.js safety pattern) ----------

function trapTabKey(event) {
  const dialog = $('reportDialog');
  if (!dialog || !dialog.hasAttribute('open')) return;
  const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true' &&
      // Hidden sections (form vs preview) are not focusable while hidden.
      !el.closest('[hidden]'),
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
    closeReport();
  }
}

// Reset every field and the preview — nothing persists between sessions.
function resetReportState() {
  const form = $('reportForm');
  if (form) form.reset();
  clearAllErrors();
  preparedAt = null;

  const formEl = $('reportForm');
  const preview = $('reportPreview');
  if (formEl) formEl.hidden = false;
  if (preview) preview.hidden = true;

  const facts = $('reportPreviewFacts');
  if (facts) facts.innerHTML = '';
  const sampleNote = $('reportPreviewSample');
  if (sampleNote) sampleNote.hidden = true;
  const text = $('reportText');
  if (text) text.value = '';
  const status = $('reportCopyStatus');
  if (status) {
    status.textContent = '';
    status.classList.remove('is-warn');
  }
  const mailto = $('reportMailtoLink');
  if (mailto) {
    mailto.hidden = true;
    mailto.removeAttribute('href');
  }
  const unconfigured = $('reportFeedbackUnconfigured');
  if (unconfigured) unconfigured.hidden = true;
}

function renderListingSummary(item) {
  const summary = $('reportListingSummary');
  if (!summary) return;
  const name = asText(item && item.name) || 'Unnamed listing';
  const key = listingKey(item && item.id);
  const where = cityLineOf(item);
  const sampleBadge = isSampleOf(item)
    ? '<span class="sample-flag">Sample · fictional</span>'
    : '';
  summary.innerHTML = `<span class="report-listing-name">${escapeHtml(
    name,
  )}</span><span class="muted">#${escapeHtml(key)}${where ? ` · ${escapeHtml(where)}` : ''}</span>${sampleBadge}`;
}

export function isReportOpen() {
  const dialog = $('reportDialog');
  return Boolean(dialog && dialog.open);
}

export function openReport(item, invoker) {
  const dialog = $('reportDialog');
  if (!dialog || !item || typeof item !== 'object') return false;
  if (dialog.open) return true;

  currentItem = item;
  lastInvoker =
    invoker instanceof HTMLElement
      ? invoker
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  resetReportState();
  renderListingSummary(item);

  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    // Fallback for engines without <dialog> showModal.
    dialog.setAttribute('open', '');
  }

  const title = $('reportDialogTitle');
  if (title) title.focus();
  return true;
}

function handleClosed() {
  resetReportState();
  currentItem = null;
  if (lastInvoker && document.contains(lastInvoker)) {
    lastInvoker.focus();
  }
  lastInvoker = null;
}

export function closeReport() {
  const dialog = $('reportDialog');
  if (!dialog) return;
  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
    // close() removes [open] synchronously; restore focus right away.
    handleClosed();
  } else if (dialog.hasAttribute('open')) {
    dialog.removeAttribute('open');
    handleClosed();
  }
}

// ---------- Clipboard (async API with textarea-selection fallback) ----------

async function copyReportText(text) {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch {
      // Permission denied or document not focused — fall through to selection.
    }
  }
  const out = $('reportText');
  if (out) {
    out.focus();
    out.setSelectionRange(0, out.value.length);
    try {
      if (typeof document.execCommand === 'function' && document.execCommand('copy')) {
        return 'copied';
      }
    } catch {
      // execCommand unavailable/blocked — user copies manually.
    }
  }
  return 'manual';
}

function showCopyStatus(kind) {
  const status = $('reportCopyStatus');
  if (!status) return;
  if (kind === 'copied') {
    status.textContent = 'Report copied. Send it through the Halal Finder feedback channel.';
    status.classList.remove('is-warn');
  } else {
    status.textContent =
      "Copy isn't available in this browser — the report text is selected; press Ctrl/Cmd+C to copy it.";
    status.classList.add('is-warn');
  }
}

// ---------- Wiring ----------

function onPrepare(event) {
  event.preventDefault();
  if (!currentItem) return;
  const result = validateForm();
  if (!result.ok) return;

  preparedAt = new Date();
  const text = buildReportText(currentItem, preparedAt, result);

  renderPreview(currentItem, preparedAt, result);

  const textOut = $('reportText');
  if (textOut) textOut.value = text;
  renderFeedbackChannel(text);

  const status = $('reportCopyStatus');
  if (status) {
    status.textContent = '';
    status.classList.remove('is-warn');
  }

  const formEl = $('reportForm');
  const preview = $('reportPreview');
  if (formEl) formEl.hidden = true;
  if (preview) preview.hidden = false;

  const previewTitle = $('reportPreviewTitle');
  if (previewTitle) previewTitle.focus();
}

async function onCopy() {
  const textOut = $('reportText');
  const text = textOut ? textOut.value : '';
  if (!text) return;
  const outcome = await copyReportText(text);
  showCopyStatus(outcome);
}

function onEdit() {
  const formEl = $('reportForm');
  const preview = $('reportPreview');
  if (preview) preview.hidden = true;
  if (formEl) formEl.hidden = false;
  const reason = $('reportReason');
  if (reason) reason.focus();
}

export function initReport() {
  const dialog = $('reportDialog');
  if (!dialog) return;

  dialog.addEventListener('click', (event) => {
    // Backdrop click: the click lands on the <dialog> element itself.
    if (event.target === dialog) {
      closeReport();
      return;
    }
    const closer = event.target.closest('[data-action="close-report"]');
    if (closer) closeReport();
  });

  // Esc fires 'cancel' before the dialog closes; restore focus then, as a
  // belt-and-braces alongside the queued 'close' event.
  dialog.addEventListener('cancel', handleClosed);
  dialog.addEventListener('close', handleClosed);
  dialog.addEventListener('keydown', onDialogKeydown);

  const closeBtn = $('reportDialogCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeReport);

  const form = $('reportForm');
  if (form) form.addEventListener('submit', onPrepare);

  // Clear a field's error as the user fixes it (errors surface on submit).
  const urlField = $('reportSourceUrl');
  if (urlField) {
    urlField.addEventListener('input', () =>
      clearFieldError(urlField, $('reportSourceUrlError'), 'reportSourceUrlHint'),
    );
  }
  const reasonField = $('reportReason');
  if (reasonField) {
    reasonField.addEventListener('change', () =>
      clearFieldError(reasonField, $('reportReasonError'), 'reportReasonHint'),
    );
  }
  const noteField = $('reportNote');
  if (noteField) {
    noteField.addEventListener('input', () =>
      clearFieldError(noteField, $('reportNoteError'), 'reportNoteHint'),
    );
  }

  const cancelBtn = $('reportCancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeReport);

  const copyBtn = $('reportCopyBtn');
  if (copyBtn) copyBtn.addEventListener('click', onCopy);

  const editBtn = $('reportEditBtn');
  if (editBtn) editBtn.addEventListener('click', onEdit);
}
