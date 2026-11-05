// Halal Finder — application entry point.
// Boot order: hydrate saved state → wire chrome/navigation → wire pages
// → start listing load (renders its own loading/error/sample states).

import { initRouter } from './router.js';
import { initDiscover, getDiscoverItems, renderDiscover } from './discover.js';
import { initListingDetail } from './detail.js';
import { initReport } from './report.js';
import {
  hydrateSaved,
  updateSavedCount,
  setSavedCascade,
  initSavedPage,
  renderSavedPlaces,
} from './saved.js';
import { initScreening } from './screening.js';
import { initBarcode } from './barcode.js';
import { initBusinessForm } from './business.js';
import { initInstall, registerServiceWorker } from './install.js';
import { initPrivacy } from './privacy.js';
import { initMap } from './map.js';

function boot() {
  hydrateSaved();
  updateSavedCount();

  initRouter();
  initListingDetail();
  initReport();
  initPrivacy();
  initMap();
  registerServiceWorker();
  initInstall();
  initScreening();
  initBarcode();
  initBusinessForm();

  // After any save/unsave, re-render the directory and the saved page.
  setSavedCascade(() => {
    renderDiscover();
    renderSavedPlaces(getDiscoverItems());
  });

  initSavedPage(getDiscoverItems);

  // Starts async; renders loading → real/sample/error into #places.
  initDiscover();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
