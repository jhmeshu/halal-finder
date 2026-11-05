// Halal Finder — saved places store (hf_saved_v2).
//
// Handles corrupt localStorage data without crashing: unreadable data is
// quarantined to hf_saved_v2_corrupt, the main key is reset to [], and the
// user is told once. Writes are wrapped so private browsing / quota
// failures degrade to a toast instead of an exception.
//
// Ids keep their JSON types (numeric for the legacy sample records) and
// are compared by string coercion, so mixed arrays from older builds
// still work.

import {
  HF_SAVED_KEY,
  HF_SAVED_CORRUPT_KEY,
  STORAGE_UNAVAILABLE_MESSAGE,
} from './config.js';
import { $, toast } from './dom.js';
import { cardHtml, findListingById } from './cards.js';
import { openListingDetail } from './detail.js';
import { onPageEnter } from './router.js';

let savedIds = [];
let savedChangedCascade = () => {};

function isSavedId(value) {
  return (
    (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' && value.trim().length > 0)
  );
}

const keyOf = (value) => String(value);

function dedupe(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    const key = keyOf(id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

// Read hf_saved_v2. Never throws.
export function hydrateSaved() {
  const raw = safeGet(HF_SAVED_KEY);
  if (raw == null) {
    savedIds = [];
    return savedIds;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Saved places data is not an array.');
    }
    savedIds = dedupe(parsed.filter(isSavedId));
    return savedIds;
  } catch {
    // Quarantine the corrupt payload, then reset to a clean empty list.
    safeSet(HF_SAVED_CORRUPT_KEY, raw);
    safeSet(HF_SAVED_KEY, '[]');
    savedIds = [];
    toast('Saved places could not be read and were reset on this device.');
    return savedIds;
  }
}

export function getSavedIds() {
  return [...savedIds];
}

export function savedCount() {
  return savedIds.length;
}

export function isSaved(id) {
  const key = keyOf(id);
  return savedIds.some((entry) => keyOf(entry) === key);
}

export function persistSaved() {
  const ok = safeSet(HF_SAVED_KEY, JSON.stringify(savedIds));
  if (!ok) toast(STORAGE_UNAVAILABLE_MESSAGE);
  return ok;
}

// Toggle an id. Returns true when the item is saved afterwards.
export function toggleSaved(id) {
  if (!isSavedId(id)) return false;
  const key = keyOf(id);
  const index = savedIds.findIndex((entry) => keyOf(entry) === key);
  if (index >= 0) {
    savedIds.splice(index, 1);
  } else {
    savedIds.push(typeof id === 'number' ? id : String(id));
  }
  persistSaved();
  updateSavedCount();
  return index < 0;
}

export function updateSavedCount() {
  const el = $('savedCount');
  if (el) el.textContent = String(savedIds.length);
}

// Register the cascade run after any save/unsave (re-renders lists and
// the count badge). Wired once at startup by app.js.
export function setSavedCascade(fn) {
  savedChangedCascade = typeof fn === 'function' ? fn : () => {};
}

export function notifySavedChanged() {
  updateSavedCount();
  try {
    savedChangedCascade();
  } catch {
    // A rendering failure must not break saving itself.
  }
}

export function toggleSavedAndNotify(item) {
  const nowSaved = toggleSaved(item && item.id);
  toast(nowSaved ? 'Saved on this device' : 'Removed from saved places');
  notifySavedChanged();
  return nowSaved;
}

function savedEmptyHtml() {
  return (
    '<div class="empty"><strong>No saved places yet.</strong><br>' +
    '<span class="small muted">Save a listing to start a shortlist. Saved places live on this device only.</span></div>'
  );
}

// Render the Saved page grid from the currently loaded listings.
export function renderSavedPlaces(allItems) {
  const grid = $('savedPlaces');
  if (!grid) return;
  const items = Array.isArray(allItems) ? allItems : [];
  const savedItems = getSavedIds()
    .map((id) => findListingById(items, id))
    .filter(Boolean);
  grid.innerHTML = savedItems.length
    ? savedItems.map((item) => cardHtml(item, { isSaved })).join('')
    : savedEmptyHtml();
  updateSavedCount();
}

// Wire the Saved page: page-enter render + delegated card actions.
export function initSavedPage(getItems) {
  const provider = typeof getItems === 'function' ? getItems : () => [];
  onPageEnter('saved', () => renderSavedPlaces(provider()));

  const grid = $('savedPlaces');
  if (!grid) return;
  grid.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const item = findListingById(provider(), actionEl.dataset.id);
    if (!item) return;
    if (actionEl.dataset.action === 'toggle-save') {
      toggleSavedAndNotify(item);
    } else if (actionEl.dataset.action === 'details') {
      openListingDetail(item, actionEl);
    }
  });

  renderSavedPlaces(provider());
}
