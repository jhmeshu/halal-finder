// Halal Finder — business listing preview form.
// Local preview only: nothing is sent, saved or transmitted anywhere.
// A real submission flow needs a backend and a moderation queue.

import { $, escapeHtml, toast } from './dom.js';

export function initBusinessForm() {
  const form = $('businessForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('bizName').value.trim();
    const type = $('bizType').value;
    const city = $('bizCity').value.trim();
    const evidence = $('bizEvidence').value;

    const feedback = $('bizFeedback');
    feedback.classList.remove('hide');
    feedback.setAttribute('role', 'status');
    feedback.innerHTML = `<strong>Request preview</strong><p class="small">${escapeHtml(name)} · ${escapeHtml(type)}<br>${escapeHtml(city)}<br>${escapeHtml(evidence)}</p><p class="small">Nothing was sent or saved to a server. Live submissions need a backend.</p>`;
    toast('Preview only — nothing submitted');
  });
}
