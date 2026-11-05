#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../../docs/halal_finder_strategy_pack/MVP/data/listing.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRICE_PATTERN = /^[£$¥₩€]{1,4}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\//;

const VALID_TYPES = ['restaurant', 'grocery', 'butcher'];
const VALID_STATUSES = [
  'certificate_reviewed',
  'business_declared',
  'community_reported',
  'muslim_friendly',
  'not_verified'
];

function validateListing(item, index, filename) {
  const prefix = `${filename}[${index}] (${item.name || 'unnamed'}):`;

  // Required core properties
  schema.required.forEach(field => {
    assert.ok(item[field] !== undefined, `${prefix} missing required field '${field}'`);
  });

  // Type checks
  assert.ok(typeof item.id === 'string' || (typeof item.id === 'number' && item.id >= 1), `${prefix} invalid id`);
  assert.ok(typeof item.slug === 'string' && SLUG_PATTERN.test(item.slug), `${prefix} invalid slug '${item.slug}'`);
  assert.ok(typeof item.name === 'string' && item.name.length >= 1, `${prefix} invalid name`);
  assert.ok(VALID_TYPES.includes(item.type), `${prefix} invalid type '${item.type}'`);
  assert.ok(typeof item.city === 'string' && item.city.length >= 1, `${prefix} invalid city`);
  assert.ok(typeof item.country === 'string' && item.country.length >= 2, `${prefix} invalid country`);
  assert.ok(typeof item.sourceName === 'string' && item.sourceName.length >= 1, `${prefix} invalid sourceName`);
  assert.ok(typeof item.dataLicence === 'string' && item.dataLicence.length >= 1, `${prefix} invalid dataLicence`);
  assert.strictEqual(typeof item.fictional, 'boolean', `${prefix} fictional must be boolean`);

  // Evidence checks
  assert.ok(item.evidence && typeof item.evidence === 'object', `${prefix} evidence must be object`);
  assert.ok(VALID_STATUSES.includes(item.evidence.status), `${prefix} invalid evidence.status '${item.evidence.status}'`);

  if (item.price) {
    assert.ok(PRICE_PATTERN.test(item.price), `${prefix} invalid price pattern '${item.price}'`);
  }
  if (item.evidence.lastCheckedAt) {
    assert.ok(DATE_PATTERN.test(item.evidence.lastCheckedAt), `${prefix} invalid lastCheckedAt date format`);
  }
  if (item.evidence.sourceUrl) {
    assert.ok(URL_PATTERN.test(item.evidence.sourceUrl), `${prefix} sourceUrl must start with http:// or https://`);
  }
}

function validateFile(relPath) {
  const fullPath = path.resolve(__dirname, relPath);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  assert.ok(Array.isArray(data), `${relPath} must be an array`);
  data.forEach((item, idx) => validateListing(item, idx, path.basename(relPath)));
  console.log(`  PASS: ${path.basename(relPath)} (${data.length} records verified)`);
}

console.log('Running listing schema validation unit tests...');
validateFile('../../docs/halal_finder_strategy_pack/MVP/data/sample-listings.json');
validateFile('../../docs/halal_finder_strategy_pack/MVP/data/listings.json');
console.log('All listing schema tests passed!\n');
