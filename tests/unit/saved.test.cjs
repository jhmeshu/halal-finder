#!/usr/bin/env node
const assert = require('assert');

// Ported/tested logic matching MVP src/saved.js & src/config.js

const HF_SAVED_KEY = 'hf_saved_v2';
const HF_SAVED_CORRUPT_KEY = 'hf_saved_v2_corrupt';

function createMockStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

function parseSaved(storage) {
  try {
    const raw = storage.getItem(HF_SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Not an array');
    return parsed.map(String).filter((id) => id.length > 0);
  } catch (err) {
    // Preserve corrupted string and reset store to avoid crash
    const corrupt = storage.getItem(HF_SAVED_KEY);
    if (corrupt) {
      storage.setItem(HF_SAVED_CORRUPT_KEY, corrupt);
    }
    storage.setItem(HF_SAVED_KEY, '[]');
    return [];
  }
}

function toggleSaved(storage, id) {
  const current = parseSaved(storage);
  const targetId = String(id);
  const exists = current.includes(targetId);
  const next = exists ? current.filter((x) => x !== targetId) : [...current, targetId];
  storage.setItem(HF_SAVED_KEY, JSON.stringify(next));
  return { saved: !exists, count: next.length };
}

console.log('Running saved places local storage unit tests...');

// Test 1: Empty storage initialization
const storage = createMockStorage();
const initial = parseSaved(storage);
assert.deepStrictEqual(initial, []);
console.log('  PASS: Empty storage returns empty array');

// Test 2: Toggle save place
const res1 = toggleSaved(storage, '101');
assert.strictEqual(res1.saved, true);
assert.strictEqual(res1.count, 1);
assert.deepStrictEqual(parseSaved(storage), ['101']);
console.log('  PASS: Place saved to storage correctly');

// Test 3: Toggle unsave place
const res2 = toggleSaved(storage, '101');
assert.strictEqual(res2.saved, false);
assert.strictEqual(res2.count, 0);
assert.deepStrictEqual(parseSaved(storage), []);
console.log('  PASS: Place removed from storage on toggle');

// Test 4: Corruption recovery preserves bad payload in backup key and resets cleanly
storage.setItem(HF_SAVED_KEY, '{invalid-json:::');
const recovered = parseSaved(storage);
assert.deepStrictEqual(recovered, []);
assert.strictEqual(storage.getItem(HF_SAVED_CORRUPT_KEY), '{invalid-json:::');
assert.strictEqual(storage.getItem(HF_SAVED_KEY), '[]');
console.log('  PASS: Corrupted storage recovered safely without unhandled exception');

console.log('All saved places unit tests passed!\n');
