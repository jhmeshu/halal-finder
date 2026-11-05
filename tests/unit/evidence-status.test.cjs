#!/usr/bin/env node
const assert = require('assert');

const VALID_STATUSES = [
  'certificate_reviewed',
  'business_declared',
  'community_reported',
  'muslim_friendly',
  'not_verified'
];

function resolveEvidenceStatus(record, todayIso = new Date().toISOString().slice(0, 10)) {
  // Sacred Rule: Payment or sponsorship status NEVER changes evidence status
  const baseStatus = record.status;
  assert.ok(VALID_STATUSES.includes(baseStatus), `Unknown status: ${baseStatus}`);

  // Expiry check: if certified but past expiry date, downgrade to not_verified
  if (baseStatus === 'certificate_reviewed' && record.expiryDate && record.expiryDate < todayIso) {
    return {
      status: 'not_verified',
      reason: 'Certificate expired on ' + record.expiryDate,
      isExpired: true
    };
  }

  return {
    status: baseStatus,
    reason: 'Active status',
    isExpired: false
  };
}

console.log('Running evidence status unit tests...');

// Test 1: Active certificate remains reviewed
const activeCert = {
  status: 'certificate_reviewed',
  expiryDate: '2028-12-31',
  isSponsored: true
};
const res1 = resolveEvidenceStatus(activeCert, '2026-11-05');
assert.strictEqual(res1.status, 'certificate_reviewed');
assert.strictEqual(res1.isExpired, false);
console.log('  PASS: Active certificate resolves correctly');

// Test 2: Expired certificate downgrades to not_verified
const expiredCert = {
  status: 'certificate_reviewed',
  expiryDate: '2025-01-01',
  isSponsored: true
};
const res2 = resolveEvidenceStatus(expiredCert, '2026-11-05');
assert.strictEqual(res2.status, 'not_verified');
assert.strictEqual(res2.isExpired, true);
console.log('  PASS: Expired certificate automatically downgrades to not_verified');

// Test 3: No Pay-To-Verify invariant: sponsorship does not upgrade unverified
const sponsoredUnverified = {
  status: 'not_verified',
  expiryDate: null,
  isSponsored: true
};
const res3 = resolveEvidenceStatus(sponsoredUnverified, '2026-11-05');
assert.strictEqual(res3.status, 'not_verified');
console.log('  PASS: Sponsorship does not alter unverified status');

console.log('All evidence status tests passed!\n');
