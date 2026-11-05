#!/usr/bin/env node
const assert = require('assert');
const path = require('path');
const {
  transformOsmElement,
  isDuplicate,
  slugify,
  resolvePlaceType,
  resolveCuisine
} = require('../../scripts/import-osm-halal.cjs');

console.log('Running tests for scripts/import-osm-halal.cjs...');

// 1. slugify
assert.strictEqual(slugify('Café Bangkok! 123'), 'cafe-bangkok-123');
assert.strictEqual(slugify('Phuket   Halal   Food'), 'phuket-halal-food');
assert.strictEqual(slugify(''), 'osm-place');
assert.strictEqual(slugify(null), 'osm-place');

// 2. resolvePlaceType
assert.strictEqual(resolvePlaceType({ shop: 'butcher' }), 'butcher');
assert.strictEqual(resolvePlaceType({ shop: 'supermarket' }), 'grocery');
assert.strictEqual(resolvePlaceType({ shop: 'convenience' }), 'grocery');
assert.strictEqual(resolvePlaceType({ amenity: 'restaurant' }), 'restaurant');
assert.strictEqual(resolvePlaceType({ amenity: 'cafe' }), 'restaurant');
assert.strictEqual(resolvePlaceType({}), 'restaurant');
assert.strictEqual(resolvePlaceType(null), 'restaurant');

// 3. resolveCuisine
assert.strictEqual(resolveCuisine({ cuisine: 'thai;halal' }, 'restaurant'), 'Thai · Halal');
assert.strictEqual(resolveCuisine({}, 'grocery'), 'Halal Groceries · Market');
assert.strictEqual(resolveCuisine({}, 'butcher'), 'Fresh Halal Meat · Butcher');
assert.strictEqual(resolveCuisine({}, 'restaurant'), 'Halal Dining');

// 4. transformOsmElement
const sampleNode = {
  type: 'node',
  id: 12345678,
  lat: 13.7563,
  lon: 100.5018,
  tags: {
    name: 'Farida Fatornee Halal Food',
    'name:en': 'Farida Fatornee',
    amenity: 'restaurant',
    cuisine: 'thai;indian',
    'diet:halal': 'only',
    'addr:street': 'Phaya Thai Road',
    'addr:city': 'Bangkok'
  }
};

const transformed = transformOsmElement(sampleNode, { city: 'bangkok', country: 'Thailand' });

assert.ok(transformed, 'Transformation should return an object');
assert.strictEqual(transformed.id, 'osm-node-12345678');
assert.strictEqual(transformed.name, 'Farida Fatornee');
assert.strictEqual(transformed.type, 'restaurant');
assert.strictEqual(transformed.city, 'Bangkok');
assert.strictEqual(transformed.country, 'Thailand');
assert.strictEqual(transformed.coordinates.lat, 13.7563);
assert.strictEqual(transformed.coordinates.lng, 100.5018);
assert.strictEqual(transformed.cuisine, 'Thai · Indian');
assert.strictEqual(transformed.isMuslimOwned, true, 'diet:halal=only should designate isMuslimOwned');
assert.strictEqual(transformed.fictional, false);
assert.ok(transformed.sourceName.includes('OpenStreetMap'));
assert.ok(transformed.dataLicence.includes('ODbL'));

// Sacred Trust Invariant: OSM imports MUST be community_reported, NEVER certificate_reviewed
assert.strictEqual(transformed.evidence.status, 'community_reported', 'Evidence status must be community_reported');
assert.strictEqual(transformed.evidence.reviewerRole, 'OSM Importer');
assert.ok(transformed.evidence.sourceUrl.includes('12345678'));
assert.ok(Array.isArray(transformed.evidence.limitations));

// Missing name or missing coordinates returns null
assert.strictEqual(transformOsmElement({ type: 'node', id: 1, lat: 13.7, lon: 100.5, tags: {} }), null);
assert.strictEqual(transformOsmElement({ type: 'node', id: 2, tags: { name: 'Test' } }), null);

// 5. isDuplicate
const existingList = [
  {
    id: 'osm-node-12345678',
    slug: 'farida-fatornee-bangkok',
    name: 'Farida Fatornee',
    coordinates: { lat: 13.7563, lng: 100.5018 }
  }
];

// Same ID
assert.strictEqual(isDuplicate({ id: 'osm-node-12345678', name: 'Other', slug: 'other' }, existingList), true);

// Same slug
assert.strictEqual(isDuplicate({ id: 'osm-node-999', name: 'Other', slug: 'farida-fatornee-bangkok' }, existingList), true);

// Same name case-insensitive
assert.strictEqual(isDuplicate({ id: 'osm-node-999', name: 'farida fatornee', slug: 'other-slug' }, existingList), true);

// Close coordinates (~20m)
assert.strictEqual(
  isDuplicate(
    { id: 'osm-node-999', name: 'Different Name', slug: 'diff', coordinates: { lat: 13.7564, lng: 100.5019 } },
    existingList
  ),
  true
);

// Distinct item
assert.strictEqual(
  isDuplicate(
    { id: 'osm-node-888', name: 'Unique Cafe', slug: 'unique-cafe', coordinates: { lat: 13.8000, lng: 100.6000 } },
    existingList
  ),
  false
);

console.log('✓ All OpenStreetMap importer unit tests passed successfully.');
