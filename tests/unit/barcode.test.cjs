#!/usr/bin/env node
const assert = require('assert');

// Ported/tested logic matching MVP src/barcode.js & src/config.js

const BARCODE_PATTERN = /^\d{8,14}$/;
const OFF_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function isValidBarcode(code) {
  return typeof code === 'string' && BARCODE_PATTERN.test(code.trim());
}

function sanitiseProduct(product) {
  const p = product && typeof product === 'object' ? product : {};
  const asText = (v) => (typeof v === 'string' ? v.trim() : '');
  return {
    name: asText(p.product_name) || asText(p.product_name_en) || 'Product record found',
    brands: asText(p.brands),
    ingredients: asText(p.ingredients_text) || asText(p.ingredients_text_en),
  };
}

function isCacheFresh(savedAt, now = Date.now()) {
  const age = now - Number(savedAt || 0);
  return age >= 0 && age <= OFF_CACHE_TTL_MS;
}

console.log('Running barcode lookup and Open Food Facts unit tests...');

// Test 1: Barcode format validation (8 to 14 numeric digits)
assert.strictEqual(isValidBarcode('3017620422003'), true, 'EAN-13 should pass');
assert.strictEqual(isValidBarcode('01234567'), true, '8-digit EAN-8 should pass');
assert.strictEqual(isValidBarcode('01234567890123'), true, '14-digit ITF-14 should pass');
assert.strictEqual(isValidBarcode('1234567'), false, '7-digit barcode should fail');
assert.strictEqual(isValidBarcode('123456789012345'), false, '15-digit barcode should fail');
assert.strictEqual(isValidBarcode('301762042200A'), false, 'Non-numeric barcode should fail');
assert.strictEqual(isValidBarcode(''), false, 'Empty string barcode should fail');
console.log('  PASS: Barcode format validation (8-14 numeric digits strictly enforced)');

// Test 2: Product payload sanitization
const rawPayload = {
  product_name: ' Organic Almond Milk ',
  brands: ' EcoBrand ',
  ingredients_text: 'Water, Organic Almonds, Sea Salt'
};
const clean = sanitiseProduct(rawPayload);
assert.strictEqual(clean.name, 'Organic Almond Milk');
assert.strictEqual(clean.brands, 'EcoBrand');
assert.strictEqual(clean.ingredients, 'Water, Organic Almonds, Sea Salt');
console.log('  PASS: Open Food Facts payload sanitization strips whitespace and extracts fields');

// Test 3: Fallback to English fields if default missing
const englishFallbackPayload = {
  product_name_en: 'Hazelnut Spread',
  ingredients_text_en: 'Sugar, Palm oil, Hazelnuts'
};
const cleanFallback = sanitiseProduct(englishFallbackPayload);
assert.strictEqual(cleanFallback.name, 'Hazelnut Spread');
assert.strictEqual(cleanFallback.ingredients, 'Sugar, Palm oil, Hazelnuts');
console.log('  PASS: Open Food Facts English fields fallback correctly');

// Test 4: Cache TTL evaluation
const now = 1700000000000;
assert.strictEqual(isCacheFresh(now - 1000 * 60, now), true, '1 minute ago is fresh');
assert.strictEqual(isCacheFresh(now - OFF_CACHE_TTL_MS + 1000, now), true, 'Just within 30 days is fresh');
assert.strictEqual(isCacheFresh(now - OFF_CACHE_TTL_MS - 1000, now), false, 'Past 30 days is stale');
console.log('  PASS: Cache TTL accurately distinguishes fresh vs stale records');

console.log('All barcode unit tests passed!\n');
