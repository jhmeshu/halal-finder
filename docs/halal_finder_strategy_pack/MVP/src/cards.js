// Halal Finder — place card rendering (pure HTML builders).
//
// Cards never embed inline event handlers; interactive elements carry
// data-action attributes and callers bind delegation. Every interpolated
// value passes through escapeHtml. Saved state is injected so this module
// has no store dependency.

import { escapeHtml } from './dom.js';
import { getEvidenceDisplay } from './evidence.js';
import { listingKey, typeLabel } from './listings.js';

export function findListingById(items, id) {
  const key = listingKey(id);
  return (Array.isArray(items) ? items : []).find((item) => listingKey(item.id) === key) || null;
}

const DEFAULT_EMOJI = '🍽️';

export function cardHtml(item, { isSaved = () => false } = {}) {
  const evidence = getEvidenceDisplay(item.evidence);
  const saved = Boolean(isSaved(item.id));
  const key = escapeHtml(listingKey(item.id));

  const headerBadges = [];
  if (item.isSponsored) {
    // Sponsored is a placement label only — it never touches evidence styling.
    headerBadges.push('<span class="featured sponsored-flag">Sponsored</span>');
  }
  if (item.featured) {
    headerBadges.push('<span class="featured">Example promotion</span>');
  }
  if (item.isSample) {
    headerBadges.push('<span class="sample-flag">Sample · fictional</span>');
  }

  const art = item.art ? ` ${escapeHtml(item.art)}` : '';

  const tags = item.tags.length
    ? item.tags
    : item.isSample
      ? ['Sample data', 'Not a real verification']
      : [];
  const tagHtml = tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

  const downgradeNote = evidence.isDowngraded
    ? `<p class="downgrade-note">${escapeHtml(evidence.downgradeReason)} — treated as Not verified until re-checked.</p>`
    : '';

  const typeLine = [item.cuisine, typeLabel(item.type)].filter(Boolean).join(' · ');
  const cityLine = item.cityLine || [item.city, item.country].filter(Boolean).join(', ');
  const saveLabel = saved ? '♥ Saved' : '♡ Save place';

  return `<article class="card"${item.isSample ? ' data-sample="true"' : ''}>
  <div class="card-head${art}"><span class="emoji" aria-hidden="true">${escapeHtml(item.emoji || DEFAULT_EMOJI)}</span>${headerBadges.length ? `<span class="card-head-badges">${headerBadges.join('')}</span>` : ''}</div>
  <div class="card-body">
    <div class="title-row"><div><h3>${escapeHtml(item.name)}</h3><div class="small muted">${escapeHtml(cityLine)}</div></div>${item.price ? `<span class="rating">${escapeHtml(item.price)}</span>` : ''}</div>
    <div class="evidence ${escapeHtml(evidence.className)}"><span class="evidence-marker" aria-hidden="true">${evidence.marker}</span><span>${escapeHtml(evidence.label)}</span></div>
    ${downgradeNote}
    <div class="small muted">${escapeHtml(typeLine)}</div>
    ${item.desc ? `<p class="small">${escapeHtml(item.desc)}</p>` : ''}
    <div class="tags">${tagHtml}</div>
    <div class="actions"><button class="btn primary" type="button" data-action="toggle-save" data-id="${key}" aria-pressed="${saved}">${saveLabel}</button><button class="btn outline" type="button" data-action="details" data-id="${key}">Details</button></div>
  </div>
</article>`;
}

// Details opens the real listing detail dialog (HF-04, see detail.js),
// wired through the data-action="details" delegation in discover.js and
// saved.js.
