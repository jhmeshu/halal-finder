// Halal Finder — shared configuration (MVP)
// Everything here is safe to ship to the browser: no secrets, no tokens.

// localStorage keys for saved places.
export const HF_SAVED_KEY = 'hf_saved_v2';
export const HF_SAVED_CORRUPT_KEY = 'hf_saved_v2_corrupt';

// Feedback channel for the MVP. Intentionally empty until a monitored
// address exists; the UI must not advertise a contact that goes nowhere.
export const HF_FEEDBACK_EMAIL = '';

// Listing data sources (relative to the MVP root, fetched over HTTP).
export const LISTINGS_URL = './data/listings.json';
export const SAMPLE_LISTINGS_URL = './data/sample-listings.json';

// Open Food Facts — the only runtime network call in the MVP.
export const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product';
export const OFF_PRODUCT_PAGE = 'https://world.openfoodfacts.org';
export const OFF_TIMEOUT_MS = 8000;

// Open Food Facts response cache budget. Caching respects OFF rate limits
// and terms; stale entries are never presented as fresh.
export const OFF_CACHE_KEY = 'hf_off_cache_v1';
export const OFF_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const OFF_CACHE_MAX_ENTRIES = 25;

// Shown when localStorage cannot be written (private browsing, quota).
export const STORAGE_UNAVAILABLE_MESSAGE =
  'Saved places could not be written on this device.';
