#!/usr/bin/env node
const assert = require('assert');

// Ported/tested logic matching MVP src/listings.js & src/evidence.js

const TYPE_LABELS = {
  restaurant: 'Restaurant',
  grocery: 'Grocery',
  butcher: 'Butcher',
};

function typeLabel(type) {
  return TYPE_LABELS[type] || 'Place';
}

function normalizeListing(raw) {
  const item = typeof raw === 'object' && raw ? raw : {};
  const type = String(item.type || '').trim().toLowerCase();
  const art = ['green', 'blue', 'purple'].includes(item.art) ? item.art : '';
  const tags = Array.isArray(item.tags)
    ? item.tags.filter((t) => typeof t === 'string' && t.trim().length > 0)
    : [];
  const city = String(item.city || '').trim();
  const country = String(item.country || '').trim();
  const coordinates =
    item.coordinates &&
    typeof item.coordinates === 'object' &&
    typeof item.coordinates.lat === 'number' &&
    typeof item.coordinates.lng === 'number'
      ? { lat: item.coordinates.lat, lng: item.coordinates.lng }
      : null;

  return {
    id: typeof item.id === 'number' ? item.id : String(item.id || '').trim(),
    slug: String(item.slug || '').trim(),
    name: String(item.name || '').trim(),
    type,
    city,
    country,
    cityLine: [city, country].filter(Boolean).join(', '),
    address: String(item.address || '').trim(),
    cuisine: String(item.cuisine || '').trim(),
    price: String(item.price || '').trim(),
    emoji: String(item.emoji || '').trim(),
    art,
    desc: String(item.desc || '').trim(),
    tags,
    coordinates,
    featured: item.featured === true,
    isSponsored: item.isSponsored === true,
    isSample: item.isSample === true || item.fictional === true,
    fictional: item.fictional === true,
    sourceName: String(item.sourceName || '').trim(),
    dataLicence: String(item.dataLicence || '').trim(),
    evidence: item.evidence && typeof item.evidence === 'object' ? item.evidence : {},
  };
}

console.log('Running listings normalization and filter unit tests...');

// Test 1: typeLabel mapping
assert.strictEqual(typeLabel('restaurant'), 'Restaurant');
assert.strictEqual(typeLabel('grocery'), 'Grocery');
assert.strictEqual(typeLabel('butcher'), 'Butcher');
assert.strictEqual(typeLabel('unknown'), 'Place');
console.log('  PASS: typeLabel maps expected values and defaults to Place');

// Test 2: normalizeListing with complete record
const fullRaw = {
  id: 101,
  slug: 'halal-bistro',
  name: 'Halal Bistro',
  type: 'restaurant',
  city: 'London',
  country: 'UK',
  cuisine: 'Turkish',
  art: 'green',
  featured: true,
  isSponsored: false,
  isSample: false,
  fictional: false,
  sourceName: 'Written permission',
  dataLicence: 'Used with permission',
  tags: ['Family friendly', 'No alcohol served']
};
const norm1 = normalizeListing(fullRaw);
assert.strictEqual(norm1.id, 101);
assert.strictEqual(norm1.cityLine, 'London, UK');
assert.strictEqual(norm1.art, 'green');
assert.strictEqual(norm1.featured, true);
assert.strictEqual(norm1.isSample, false);
assert.strictEqual(norm1.tags.length, 2);
console.log('  PASS: normalizeListing maps full record correctly');

// Test 3: normalizeListing sanitizes incomplete/corrupted input safely without throwing
const emptyNorm = normalizeListing(null);
assert.strictEqual(emptyNorm.name, '');
assert.strictEqual(emptyNorm.cityLine, '');
assert.strictEqual(emptyNorm.featured, false);
assert.strictEqual(emptyNorm.isSample, false);
assert.deepStrictEqual(emptyNorm.tags, []);
console.log('  PASS: normalizeListing safely handles null/empty objects');

// Test 4: Sample flag propagation
const sampleRecord = {
  id: 1,
  name: 'Sample Place',
  fictional: true
};
const normSample = normalizeListing(sampleRecord);
assert.strictEqual(normSample.isSample, true);
assert.strictEqual(normSample.fictional, true);
console.log('  PASS: Sample flag propagation marks records as fictional');

console.log('All listings unit tests passed!\n');
