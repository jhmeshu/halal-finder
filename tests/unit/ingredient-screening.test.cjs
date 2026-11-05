#!/usr/bin/env node
const assert = require('assert');

// The standard cautionary screening terms defined in Halal Finder PRD & MVP
const RISK_TERMS = [
  ['gelatin', 'Source can vary; verify animal origin and certification.'],
  ['gelatine', 'Source can vary; verify animal origin and certification.'],
  ['lard', 'Animal-derived fat is indicated; verify product details.'],
  ['pork', 'Pork-derived ingredient indicated; check the product.'],
  ['rennet', 'Source can vary; verify the origin.'],
  ['enzymes', 'Source can vary; ask the manufacturer.'],
  ['e471', 'Source can vary; ask the manufacturer.'],
  ['mono- and diglycerides', 'Source can vary; ask the manufacturer.'],
  ['natural flavour', 'Source or carrier may be unclear.'],
  ['alcohol', 'Context and source matter; verify with a trusted authority.']
];

function screenIngredients(rawText) {
  if (!rawText || !rawText.trim()) {
    return { hits: [], disclaimer: 'Provide ingredient list to screen.' };
  }
  const low = rawText.toLowerCase();
  const hits = RISK_TERMS.filter(([term]) => low.includes(term));
  return {
    hits,
    hasHits: hits.length > 0,
    cautionNotice: 'Keyword screening is an informational aid, NOT a halal ruling. Absence of flagged keywords does not prove halal status.'
  };
}

console.log('Running ingredient screening unit tests...');

// Test 1: Flagged ingredients detected
const result1 = screenIngredients('Water, Sugar, Gelatin, Natural Flavour, Citric Acid');
assert.strictEqual(result1.hits.length, 2);
assert.ok(result1.hits.some(([t]) => t === 'gelatin'));
assert.ok(result1.hits.some(([t]) => t === 'natural flavour'));
console.log('  PASS: Flagged ingredients detected');

// Test 2: Clean text does not false-flag, but disclaimer is still returned
const result2 = screenIngredients('Wheat flour, vegetable oil, sea salt');
assert.strictEqual(result2.hits.length, 0);
assert.ok(result2.cautionNotice.includes('NOT a halal ruling'));
console.log('  PASS: Unflagged text returns 0 hits and preserves cautionary disclaimer');

// Test 3: Case-insensitivity & E-number detection
const result3 = screenIngredients('Emulsifier (E471), Enzymes');
assert.strictEqual(result3.hits.length, 2);
console.log('  PASS: Case-insensitivity and E-numbers detected');

console.log('All ingredient screening tests passed!\n');
