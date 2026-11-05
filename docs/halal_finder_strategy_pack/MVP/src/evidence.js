// Halal Finder — evidence status mapping and expiry downgrade.
//
// The five sanctioned statuses only. A generic "Verified" badge never
// exists here. Expired certificate_reviewed records resolve to
// not_verified until re-reviewed (see docs/.../data/README.md,
// "Expiry-downgrade rule"); the UI must tolerate all five statuses.

export const EVIDENCE_STATUS = Object.freeze({
  certificate_reviewed: {
    label: 'Certificate reviewed',
    marker: '✓',
    className: 'certificate',
  },
  business_declared: {
    label: 'Business-declared halal',
    marker: '◆',
    className: 'declared',
  },
  community_reported: {
    label: 'Community-reported',
    marker: '◉',
    className: 'community',
  },
  muslim_friendly: {
    label: 'Muslim-friendly',
    marker: '◍',
    className: 'friendly',
  },
  not_verified: {
    label: 'Not verified / needs checking',
    marker: '!',
    className: 'unknown',
  },
});

export const VALID_EVIDENCE_STATUSES = Object.freeze(Object.keys(EVIDENCE_STATUS));
export const DEFAULT_EVIDENCE_STATUS = 'not_verified';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function isIsoDate(value) {
  return typeof value === 'string' && ISO_DATE.test(value);
}

// Resolve the effective status for an evidence object, applying the
// expiry-downgrade rule. Unknown or missing statuses resolve to
// not_verified — never silently upgraded.
export function resolveEvidenceStatus(evidence, today = todayIso()) {
  const record = evidence && typeof evidence === 'object' ? evidence : {};
  const base = VALID_EVIDENCE_STATUSES.includes(record.status)
    ? record.status
    : DEFAULT_EVIDENCE_STATUS;

  if (
    base === 'certificate_reviewed' &&
    isIsoDate(record.expiryDate) &&
    record.expiryDate < today
  ) {
    return {
      status: 'not_verified',
      baseStatus: base,
      isExpired: true,
      reason: `Certificate expired on ${record.expiryDate}`,
    };
  }

  return { status: base, baseStatus: base, isExpired: false, reason: '' };
}

// Display-ready view of an evidence object: label, marker glyph, the
// matching .evidence modifier class, and downgrade context if any.
export function getEvidenceDisplay(evidence, today = todayIso()) {
  const resolution = resolveEvidenceStatus(evidence, today);
  const status = EVIDENCE_STATUS[resolution.status];
  const record = evidence && typeof evidence === 'object' ? evidence : {};
  return {
    status: resolution.status,
    baseStatus: resolution.baseStatus,
    label: status.label,
    marker: status.marker,
    className: status.className,
    isDowngraded: resolution.isExpired,
    downgradeReason: resolution.isExpired ? resolution.reason : '',
    lastCheckedAt: isIsoDate(record.lastCheckedAt) ? record.lastCheckedAt : null,
  };
}
