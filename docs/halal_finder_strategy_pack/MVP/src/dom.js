// Halal Finder — DOM helpers, HTML escaping and the shared toast.

export function $(id) {
  return document.getElementById(id);
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Every string interpolated into innerHTML must pass through this.
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch]);
}

const TOAST_DURATION_MS = 2600;
let toastTimer = 0;

export function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = String(message);
  el.classList.remove('hide');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.add('hide'), TOAST_DURATION_MS);
}
