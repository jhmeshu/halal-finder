// Halal Finder — Discover page: data loading, filtering, rendering.
//
// Honest data states:
//   loading  — fetch in flight
//   error    — fetch/parse failed; visible error + Retry, never a blank grid
//   real     — ./data/listings.json contained records
//   sample   — listings.json is intentionally empty; the six fictional
//              sample records are shown under a prominent "Sample listings
//              — fictional examples" callout. Nothing is passed off as real.

import { $, qsa, escapeHtml } from './dom.js';
import { loadListings, filterListings, FILTERS } from './listings.js';
import { cardHtml, findListingById } from './cards.js';
import { openListingDetail } from './detail.js';
import { isSaved, toggleSavedAndNotify, updateSavedCount } from './saved.js';
import { updateMapMarkers, focusMapPlace } from './map.js';

const state = {
  mode: 'loading', // 'loading' | 'error' | 'real' | 'sample'
  all: [],
  source: 'real',
  query: '',
  filter: FILTERS.ALL,
  error: '',
  rendered: [],
};

// Used by the Saved page cascade to re-render against the loaded dataset.
export function getDiscoverItems() {
  return state.all;
}

export function isSampleMode() {
  return state.mode === 'sample';
}

function debounce(fn, waitMs) {
  let timer = 0;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), waitMs);
  };
}

const SAMPLE_NOTICE =
  '<div class="notice sample-notice" role="note"><strong>Real London listings are not available yet.</strong> ' +
  'Our sourced directory is still being built, so this preview shows fictional sample listings only — ' +
  'nothing below is a real business, and no certification is implied.</div>';

function sampleHeadingHtml() {
  return `<div class="sample-heading"><h3>Sample listings — fictional examples</h3><p class="small muted">${state.all.length} made-up records showing how evidence labels look in practice. Businesses, details and any implied certificates are invented for demonstration only.</p></div>`;
}

function loadingHtml() {
  return '<div class="list-status" role="status">Loading listings…</div>';
}

function errorHtml() {
  return `<div class="notice notice-error" role="alert"><strong>Listings could not be loaded.</strong><br>${escapeHtml(state.error)}<br><button class="btn outline u-mt-3" type="button" data-action="retry-listings">Try again</button></div>`;
}

function emptyHtml() {
  const message =
    state.mode === 'sample'
      ? 'No fictional samples match. Try a different search or category.'
      : 'No listings match. Try a different search or category.';
  return `<div class="empty">${message}</div>`;
}

function currentItems() {
  return filterListings(state.all, { query: state.query, filter: state.filter });
}

function updateResultCount(items) {
  const el = $('resultCount');
  if (!el) return;
  if (state.mode === 'loading') {
    el.textContent = 'Loading listings…';
    return;
  }
  if (state.mode === 'error') {
    el.textContent = 'Listings unavailable';
    return;
  }
  const isFiltered = state.query.length > 0 || state.filter !== FILTERS.ALL;
  if (state.mode === 'sample') {
    el.textContent = isFiltered
      ? `${items.length} of ${state.all.length} fictional samples`
      : `No real listings yet · ${state.all.length} fictional samples`;
    return;
  }
  el.textContent = `${items.length} ${items.length === 1 ? 'listing' : 'listings'}`;
}

export function renderDiscover() {
  const grid = $('places');
  if (!grid) return;

  if (state.mode === 'loading') {
    state.rendered = [];
    grid.innerHTML = loadingHtml();
    updateResultCount([]);
    return;
  }
  if (state.mode === 'error') {
    state.rendered = [];
    grid.innerHTML = errorHtml();
    updateResultCount([]);
    return;
  }

  const items = currentItems();
  state.rendered = items;

  const parts = [];
  if (state.mode === 'sample') {
    parts.push(SAMPLE_NOTICE, sampleHeadingHtml());
  }
  parts.push(
    ...(items.length ? items.map((item) => cardHtml(item, { isSaved })) : [emptyHtml()]),
  );
  grid.innerHTML = parts.join('');
  updateResultCount(items);
  updateSavedCount();
  updateMapMarkers(items);
}

async function loadAndRender() {
  state.mode = 'loading';
  state.error = '';
  renderDiscover();
  try {
    const { listings, source } = await loadListings();
    state.all = listings;
    state.source = source;
    state.mode = source === 'sample' ? 'sample' : 'real';
  } catch (error) {
    state.all = [];
    state.mode = 'error';
    state.error =
      error && error.message
        ? error.message
        : 'The listing data could not be loaded. Check your connection and try again.';
  }
  renderDiscover();
}

function syncFilterChips() {
  qsa('[data-filter]').forEach((chip) => {
    const active = chip.dataset.filter === state.filter;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  });
}

function applySearchFromInput() {
  state.query = $('searchInput').value.trim();
  state.filter = FILTERS.ALL;
  syncFilterChips();
  renderDiscover();
}

function onPlacesClick(event) {
  const retry = event.target.closest('[data-action="retry-listings"]');
  if (retry) {
    event.preventDefault();
    loadAndRender();
    return;
  }

  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;
  const item = findListingById(state.rendered, actionEl.dataset.id);
  if (!item) return;

  if (actionEl.dataset.action === 'toggle-save') {
    // Cascade re-renders the grid; nothing else to do here.
    toggleSavedAndNotify(item);
  } else if (actionEl.dataset.action === 'details') {
    openListingDetail(item, actionEl);
  } else if (actionEl.dataset.action === 'map-pin') {
    focusMapPlace(item);
  }
}

export async function initDiscover() {
  const grid = $('places');
  if (!grid) return;

  const searchInput = $('searchInput');
  $('searchBtn').addEventListener('click', applySearchFromInput);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applySearchFromInput();
  });
  // Live, debounced filtering while typing (button still works as before).
  searchInput.addEventListener(
    'input',
    debounce(() => {
      state.query = searchInput.value.trim();
      renderDiscover();
    }, 180),
  );

  $('filters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    syncFilterChips();
    renderDiscover();
  });

  grid.addEventListener('click', onPlacesClick);

  await loadAndRender();
}
