// Halal Finder — Open Food Facts barcode lookup.
//
// The only runtime network call in the MVP. Uses an AbortController
// timeout, caches responses to respect OFF rate limits/terms, falls back
// to a stale cache entry when the network fails (labelled as stale), and
// always attributes Open Food Facts with the "not a halal certification"
// warning. Missing records are reported honestly — absence of a record
// says nothing about halal status.

import { $, escapeHtml, toast } from './dom.js';
import {
  OFF_API_BASE,
  OFF_PRODUCT_PAGE,
  OFF_TIMEOUT_MS,
  OFF_CACHE_KEY,
  OFF_CACHE_TTL_MS,
  OFF_CACHE_MAX_ENTRIES,
} from './config.js';

const BARCODE_PATTERN = /^\d{8,14}$/;

// ---- one-line cache helpers (best effort; failures are ignored) ----

function readCacheEntry(code) {
  try {
    const raw = localStorage.getItem(OFF_CACHE_KEY);
    if (!raw) return null;
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) return null;
    const hit = entries.find((entry) => entry && String(entry.code) === String(code));
    if (!hit || !hit.product) return null;
    const age = Date.now() - Number(hit.savedAt || 0);
    return { product: hit.product, fresh: age >= 0 && age <= OFF_CACHE_TTL_MS, savedAt: Number(hit.savedAt || 0) };
  } catch {
    return null;
  }
}

function writeCacheEntry(code, product) {
  try {
    const raw = localStorage.getItem(OFF_CACHE_KEY);
    let entries = [];
    try {
      const parsed = JSON.parse(raw || '[]');
      entries = Array.isArray(parsed) ? parsed : [];
    } catch {
      entries = [];
    }
    const rest = entries.filter((entry) => entry && String(entry.code) !== String(code));
    const next = [...rest, { code: String(code), product, savedAt: Date.now() }].slice(-OFF_CACHE_MAX_ENTRIES);
    localStorage.setItem(OFF_CACHE_KEY, JSON.stringify(next));
  } catch {
    // Cache is advisory only.
  }
}

// ---- OFF payload handling ----

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Reduce an OFF product to the small, safe shape we render and cache.
function sanitiseProduct(product) {
  const p = product && typeof product === 'object' ? product : {};
  return {
    name: asText(p.product_name) || asText(p.product_name_en) || 'Product record found',
    brands: asText(p.brands),
    ingredients: asText(p.ingredients_text) || asText(p.ingredients_text_en),
  };
}

function attributionHtml() {
  return `<p class="small muted">Product data from Open Food Facts (ODbL) — <a href="${OFF_PRODUCT_PAGE}" target="_blank" rel="noopener noreferrer">${escapeHtml(OFF_PRODUCT_PAGE.replace('https://', ''))}</a>. Community-contributed; may be incomplete or outdated. Not a halal certification.</p>`;
}

function productHtml(product, { fromCache = false, stale = false } = {}) {
  const cacheNote = fromCache
    ? `<p class="small muted">${stale ? 'Could not reach Open Food Facts — showing a cached record.' : 'Showing a cached record.'}</p>`
    : '';
  const ingredients = product.ingredients
    ? `<p class="small">${escapeHtml(product.ingredients)}</p><button class="btn primary" type="button" data-action="use-ingredients">Screen listed ingredients</button>`
    : '<p class="small">Ingredient list not available in the database for this record. You can paste the label ingredients manually below.</p>';
  return `<div class="result"><strong>${escapeHtml(product.name)}</strong><p class="small">${escapeHtml(product.brands || 'Brand not listed')} · Source: Open Food Facts</p>${cacheNote}${ingredients}${attributionHtml()}</div>`;
}

function notFoundHtml(code) {
  return `<div class="result"><strong>No product record found</strong><p class="small">Open Food Facts has no record for <span dir="ltr">${escapeHtml(code)}</span>. This does <em>not</em> indicate whether the product is halal — only that its database has no entry yet.</p><p class="small muted">You can still paste the ingredient list manually in the screening panel.</p>${attributionHtml()}</div>`;
}

function unreachableHtml(detail) {
  return `<div class="result"><strong>Could not reach Open Food Facts</strong><p class="small">${escapeHtml(detail)} Try again when you are online, or paste the ingredients manually below.</p><button class="btn outline" type="button" data-action="retry-barcode">Try again</button>${attributionHtml()}</div>`;
}

// ---- lookup flow ----

let lastLookup = null; // { name, ingredients } — used by the copy-to-screening action

async function lookup() {
  const input = $('barcode');
  const box = $('barcodeResult');
  const code = input.value.trim();

  if (!BARCODE_PATTERN.test(code)) {
    toast('Enter an 8–14 digit barcode');
    input.focus();
    return;
  }

  const cached = readCacheEntry(code);
  if (cached && cached.fresh) {
    lastLookup = cached.product;
    box.innerHTML = productHtml(cached.product, { fromCache: true, stale: false });
    return;
  }

  if (navigator.onLine === false) {
    if (cached) {
      lastLookup = cached.product;
      box.innerHTML = productHtml(cached.product, { fromCache: true, stale: true });
    } else {
      lastLookup = null;
      box.innerHTML = unreachableHtml('You appear to be offline.');
    }
    return;
  }

  box.innerHTML = '<div class="result" role="status">Looking up product record…</div>';

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), OFF_TIMEOUT_MS);
  try {
    const response = await fetch(`${OFF_API_BASE}/${encodeURIComponent(code)}.json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`The product database responded with HTTP ${response.status}.`);
    }
    const data = await response.json();
    if (!data || data.status !== 1 || !data.product) {
      lastLookup = null;
      box.innerHTML = notFoundHtml(code);
      return;
    }
    const product = sanitiseProduct(data.product);
    writeCacheEntry(code, product);
    lastLookup = product;
    box.innerHTML = productHtml(product, { fromCache: false });
  } catch (error) {
    if (cached) {
      // Network failed but we have an older copy — show it, clearly labelled.
      lastLookup = cached.product;
      box.innerHTML = productHtml(cached.product, { fromCache: true, stale: true });
    } else {
      lastLookup = null;
      const timedOut = error && error.name === 'AbortError';
      const detail = timedOut
        ? 'The lookup took too long and was cancelled.'
        : 'The public product database could not be reached.';
      box.innerHTML = unreachableHtml(detail);
    }
  } finally {
    window.clearTimeout(timer);
  }
}

function copyIngredientsToScreening() {
  if (!lastLookup) return;
  $('productName').value = lastLookup.name || '';
  $('ingredients').value = lastLookup.ingredients || '';
  $('ingredients').focus();
  toast('Ingredients copied into screening form');
}

export function initBarcode() {
  const lookupBtn = $('lookupBtn');
  const box = $('barcodeResult');
  if (!lookupBtn || !box) return;

  lookupBtn.addEventListener('click', lookup);
  $('barcode').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') lookup();
  });

  // Delegated actions for buttons rendered inside #barcodeResult.
  box.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    if (actionEl.dataset.action === 'use-ingredients') {
      copyIngredientsToScreening();
    } else if (actionEl.dataset.action === 'retry-barcode') {
      lookup();
    }
  });
}
