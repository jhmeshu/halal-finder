// Halal Finder — page switching (.page sections + nav buttons).
// Pages share the [data-page] attribute; activation is centralised here.

import { qsa } from './dom.js';

const pageEnterCallbacks = new Map();

// Register a callback run each time a named page becomes visible.
export function onPageEnter(name, callback) {
  pageEnterCallbacks.set(name, callback);
}

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function showPage(name) {
  qsa('.page').forEach((page) => page.classList.toggle('active', page.id === `${name}Page`));
  qsa('[data-page]').forEach((button) => {
    const isActive = button.dataset.page === name;
    button.classList.toggle('active', isActive);
    if (button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', String(isActive));
    }
  });
  const callback = pageEnterCallbacks.get(name);
  if (callback) callback();
  window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
}

// Wire every [data-page] element (top nav, hero CTA, footer links).
export function initRouter() {
  qsa('[data-page]').forEach((button) => {
    button.addEventListener('click', () => showPage(button.dataset.page));
  });
}
