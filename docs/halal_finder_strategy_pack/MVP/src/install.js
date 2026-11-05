// Halal Finder — PWA install prompt and service-worker registration.

import { $, toast } from './dom.js';

const INSTALL_FALLBACK_MESSAGE =
  'Install becomes available when this app is hosted securely. Use your browser menu → Add to Home Screen when available.';

let deferredPrompt = null;

export function initInstall() {
  const button = $('installBtn');
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (button) button.textContent = 'Install app';
  });

  if (!button) return;
  button.addEventListener('click', async () => {
    if (!deferredPrompt) {
      toast(INSTALL_FALLBACK_MESSAGE);
      return;
    }
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    try {
      // prompt() may throw synchronously or return a rejected promise,
      // depending on browser and gesture trust — handle both.
      const maybePromise = promptEvent.prompt();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => toast(INSTALL_FALLBACK_MESSAGE));
      }
    } catch {
      // Not a trusted user gesture (or prompt not allowed here) — guide instead.
      toast(INSTALL_FALLBACK_MESSAGE);
      return;
    }
    try {
      await promptEvent.userChoice;
    } catch {
      // User dismissed the prompt; nothing to do.
    }
  });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!location.protocol.startsWith('http')) return; // file:// can't register SWs
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline shell is best-effort in the preview; never surface a crash.
    });
  });
}
