// Halal Finder — listing loading and filtering.
//
// Data comes from ./data/listings.json (production placeholder, currently
// an intentionally empty array). When it is empty we fall back to
// ./data/sample-listings.json, which contains six fictional records.
// Samples are NEVER presented as real; callers must check `source`.
// No listing copy is embedded here — the JSON files are the only source.

import { LISTINGS_URL, SAMPLE_LISTINGS_URL } from './config.js';
import { EVIDENCE_STATUS, resolveEvidenceStatus } from './evidence.js';

export const TYPE_LABELS = Object.freeze({
  restaurant: 'Restaurant',
  grocery: 'Grocery',
  butcher: 'Butcher',
});

export function typeLabel(type) {
  return TYPE_LABELS[type] || 'Place';
}

export function listingKey(id) {
  return String(id);
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isListingObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const id = value.id;
  const hasId =
    (typeof id === 'number' && Number.isFinite(id)) ||
    (typeof id === 'string' && id.trim().length > 0);
  return hasId && typeof value.name === 'string' && value.name.trim().length > 0;
}

// Normalise a raw JSON record into the shape the UI renders. Unknown
// optional fields are left absent rather than invented.
export function normalizeListing(raw) {
  const item = typeof raw === 'object' && raw ? raw : {};
  const type = asString(item.type).toLowerCase();
  const art = ['green', 'blue', 'purple'].includes(item.art) ? item.art : '';
  const tags = Array.isArray(item.tags)
    ? item.tags.filter((t) => typeof t === 'string' && t.trim().length > 0)
    : [];
  const city = asString(item.city);
  const country = asString(item.country);
  const coordinates =
    item.coordinates &&
    typeof item.coordinates === 'object' &&
    typeof item.coordinates.lat === 'number' &&
    typeof item.coordinates.lng === 'number'
      ? { lat: item.coordinates.lat, lng: item.coordinates.lng }
      : null;

  return {
    id: typeof item.id === 'number' ? item.id : asString(item.id),
    slug: asString(item.slug),
    name: asString(item.name),
    type,
    city,
    country,
    cityLine: [city, country].filter(Boolean).join(', '),
    address: asString(item.address),
    cuisine: asString(item.cuisine),
    price: asString(item.price),
    emoji: asString(item.emoji),
    art,
    desc: asString(item.desc),
    tags,
    coordinates,
    featured: item.featured === true,
    isSponsored: item.isSponsored === true,
    isSample: item.isSample === true || item.fictional === true,
    fictional: item.fictional === true,
    sourceName: asString(item.sourceName),
    dataLicence: asString(item.dataLicence),
    evidence: item.evidence && typeof item.evidence === 'object' ? item.evidence : {},
  };
}

async function fetchJson(fetchImpl, url) {
  let response;
  try {
    const freshUrl = url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
    response = await fetchImpl(freshUrl, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });
  } catch (error) {
    const detail = error && error.message ? error.message : 'network error';
    throw new Error(`Could not load ${url} (${detail}).`);
  }
  if (!response.ok) {
    throw new Error(`Could not load ${url} (HTTP ${response.status}).`);
  }
  try {
    return await response.json();
  } catch {
    throw new Error(`Could not read ${url} (invalid JSON).`);
  }
}

// Load listings. Returns { listings, source } where source is 'real' or
// 'sample'. Throws an Error with a user-safe message on any failure.
export async function loadListings(fetchImpl = globalThis.fetch && globalThis.fetch.bind(globalThis)) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('This browser cannot fetch listing data.');
  }

  const real = await fetchJson(fetchImpl, LISTINGS_URL);
  if (!Array.isArray(real)) {
    throw new Error(`${LISTINGS_URL} did not contain a JSON array.`);
  }
  const realListings = real.filter(isListingObject).map(normalizeListing);
  if (realListings.length > 0) {
    return { listings: realListings, source: 'real' };
  }

  // Production listings are intentionally absent; fall back to the
  // fictional sample set, clearly labelled as such by the UI.
  const samples = await fetchJson(fetchImpl, SAMPLE_LISTINGS_URL);
  if (!Array.isArray(samples)) {
    throw new Error(`${SAMPLE_LISTINGS_URL} did not contain a JSON array.`);
  }
  const sampleListings = samples
    .filter(isListingObject)
    .map((entry) => ({ ...normalizeListing(entry), isSample: true }));
  if (sampleListings.length === 0) {
    throw new Error('No listings are available, and the sample set could not be read.');
  }
  return { listings: sampleListings, source: 'sample' };
}

export const FILTERS = Object.freeze({
  ALL: 'All',
  RESTAURANT: 'Restaurant',
  GROCERY: 'Grocery',
  BUTCHER: 'Butcher',
  CERTIFIED: 'Certified evidence',
  UNKNOWN: 'Unknown',
});

function matchesFilter(item, filter, today) {
  switch (filter) {
    case FILTERS.RESTAURANT:
      return item.type === 'restaurant';
    case FILTERS.GROCERY:
      return item.type === 'grocery';
    case FILTERS.BUTCHER:
      return item.type === 'butcher';
    case FILTERS.CERTIFIED:
      // Uses the resolved (post-downgrade) status — an expired certificate
      // is not "certified evidence".
      return resolveEvidenceStatus(item.evidence, today).status === 'certificate_reviewed';
    case FILTERS.UNKNOWN:
      return resolveEvidenceStatus(item.evidence, today).status === 'not_verified';
    case FILTERS.ALL:
    default:
      return true;
  }
}

function matchesQuery(item, query, today) {
  if (!query) return true;
  const resolved = resolveEvidenceStatus(item.evidence, today).status;
  const haystack = [
    item.name,
    item.city,
    item.country,
    item.cityLine,
    item.cuisine,
    item.type,
    typeLabel(item.type),
    resolved,
    EVIDENCE_STATUS[resolved].label,
    (item.tags || []).join(' '),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

// Pure filter: safe to unit-test and reuse on any listing array.
export function filterListings(items, { query = '', filter = FILTERS.ALL, today } = {}) {
  const list = Array.isArray(items) ? items : [];
  const q = String(query).trim().toLowerCase();
  return list.filter((item) => matchesFilter(item, filter, today) && matchesQuery(item, q, today));
}
