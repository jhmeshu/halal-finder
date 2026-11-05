// Halal Finder — ingredient keyword screening (triage aid, NOT a ruling).
//
// riskTerms / screenIngredients are exported for reuse and testing.
// Output wording deliberately matches the MVP: it flags cautionary terms
// and says plainly that absence of hits is not proof of halal status.

import { $, escapeHtml, toast } from './dom.js';

// [term, why it needs checking] — keep wording plain and non-absolute.
export const RISK_TERMS = Object.freeze([
  ['gelatin', 'Source can vary; verify animal origin and certification.'],
  ['gelatine', 'Source can vary; verify animal origin and certification.'],
  ['lard', 'Animal-derived fat is indicated; verify product details.'],
  ['pork', 'Pork-derived ingredient indicated; check the product.'],
  ['rennet', 'Source can vary; verify the origin.'],
  ['enzymes', 'Source can vary; ask the manufacturer.'],
  ['e471', 'Source can vary; ask the manufacturer.'],
  ['mono- and diglycerides', 'Source can vary; ask the manufacturer.'],
  ['natural flavour', 'Source or carrier may be unclear.'],
  ['alcohol', 'Context and source matter; verify with a trusted authority.'],
]);

export const SCREENING_DISCLAIMER =
  'Keyword screening is an informational triage aid, NOT a halal ruling or religious certificate. ' +
  'Absence of flagged terms does not prove a product is halal. ' +
  'Always verify uncertain items with the manufacturer or a trusted certifier.';

// Pure screen: lowercases input, returns matched risk terms.
export function screenIngredients(rawText) {
  const text = String(rawText || '');
  const low = text.toLowerCase();
  const hits = RISK_TERMS.filter(([term]) => low.includes(term));
  return { hits, hasHits: hits.length > 0 };
}

const CERTIFICATION_TEXT = Object.freeze({
  mark: 'A halal mark is reported, but it has not been authenticated.',
  claim: 'A brand claim is reported, but it has not been independently verified.',
  unknown: 'No certification information was provided.',
});

function runScreen() {
  const ingredientsField = $('ingredients');
  const raw = ingredientsField.value.trim();
  if (!raw) {
    toast('Paste an ingredient list first');
    ingredientsField.focus();
    return;
  }

  const { hits } = screenIngredients(raw);
  const productName = $('productName').value.trim() || 'Ingredient screen';
  const cert = $('certification').value;
  const certText = CERTIFICATION_TEXT[cert] || CERTIFICATION_TEXT.unknown;

  const hitsHtml = hits.length
    ? hits
        .map(
          ([term, why]) => `<div class="result-row"><span><strong>${escapeHtml(term)}</strong><br><span class="small muted">${escapeHtml(why)}</span></span><strong>Check</strong></div>`,
        )
        .join('')
    : '<div class="result-row"><span>No listed keyword matched.</span><strong>Not proof</strong></div>';

  $('scanResult').innerHTML = `<div class="result"><strong>${escapeHtml(productName)}</strong><p class="small">${escapeHtml(certText)}</p><div class="result-row"><span>Potential items to verify</span><strong>${hits.length}</strong></div>${hitsHtml}<p class="small muted">Keyword screening can miss synonyms, hidden sources, cross-contamination and manufacturing details. It cannot establish halal status.</p></div>`;
}

export function initScreening() {
  const analyseBtn = $('analyseBtn');
  if (!analyseBtn) return;
  analyseBtn.addEventListener('click', runScreen);
}
