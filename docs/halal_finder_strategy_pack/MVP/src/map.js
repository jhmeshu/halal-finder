// Halal Finder — Interactive Map integration (Leaflet + OpenStreetMap ODbL).
//
// Shares the exact canonical listing records with the directory list.
// Displays pins for places with valid coordinates, updates on search/filters,
// and wires popups directly to open the listing evidence detail dialog.

import { $, escapeHtml } from './dom.js';
import { openListingDetail } from './detail.js';
import { getEvidenceDisplay } from './evidence.js';

let mapInstance = null;
let markerLayer = null;
const markerMap = new Map(); // id -> L.marker

// Thailand default center & zoom
const DEFAULT_CENTER = [13.736717, 100.523186];
const DEFAULT_ZOOM = 6;

// Custom SVG Pin Icon for Halal Finder
function createCustomPin(item) {
  const isReviewed = item.evidence && item.evidence.status === 'certificate_reviewed';
  const pinColor = isReviewed ? '#176b45' : '#0284c7'; // dark green or strong blue
  const symbol = item.type === 'restaurant' ? '🍴' : item.type === 'grocery' ? '🛒' : '🥩';

  const svgHtml = `
    <div class="custom-map-pin" style="background-color:${pinColor};">
      <span class="pin-symbol">${symbol}</span>
    </div>
  `;

  return window.L.divIcon({
    className: 'custom-pin-wrapper',
    html: svgHtml,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -36],
  });
}

function popupHtml(item) {
  const display = getEvidenceDisplay(item);
  const badgeHtml = `<span class="badge ${display.badgeClass}">${escapeHtml(display.badgeLabel)}</span>`;

  return `
    <div class="map-popup-card">
      <div class="map-popup-header">
        <h4 class="map-popup-title">${escapeHtml(item.name)}</h4>
        <div class="map-popup-meta">${escapeHtml(item.cityLine || item.city || '')} · ${escapeHtml(item.cuisine || '')}</div>
      </div>
      <div class="map-popup-badge-row">${badgeHtml}</div>
      <div class="map-popup-actions">
        <button type="button" class="btn primary small map-popup-btn" data-detail-id="${escapeHtml(item.id)}">View details</button>
      </div>
    </div>
  `;
}

export function initMap() {
  const container = $('map');
  if (!container || !window.L) return;

  // Initialize Leaflet map
  mapInstance = window.L.map(container, {
    zoomControl: true,
    attributionControl: false, // Attribution is cleanly rendered in .map-legend
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  // Standard OpenStreetMap tile layer (ODbL)
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapInstance);

  markerLayer = window.L.layerGroup().addTo(mapInstance);

  // Delegate popup button clicks to open the real detail dialog
  container.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-detail-id]');
    if (!btn) return;
    const placeId = btn.getAttribute('data-detail-id');
    const marker = markerMap.get(placeId);
    if (marker && marker._listingData) {
      openListingDetail(marker._listingData, btn);
    }
  });
}

export function updateMapMarkers(items = []) {
  if (!mapInstance || !markerLayer || !window.L) return;

  markerLayer.clearLayers();
  markerMap.clear();

  const validItems = items.filter(
    (item) =>
      item.coordinates &&
      typeof item.coordinates.lat === 'number' &&
      typeof item.coordinates.lng === 'number',
  );

  const countEl = $('mapCount');
  if (countEl) {
    countEl.textContent = `${validItems.length} place${validItems.length === 1 ? '' : 's'}`;
  }

  if (validItems.length === 0) return;

  const latLngs = [];

  validItems.forEach((item) => {
    const icon = createCustomPin(item);
    const marker = window.L.marker([item.coordinates.lat, item.coordinates.lng], { icon });

    marker._listingData = item;
    marker.bindPopup(popupHtml(item), { maxWidth: 280, className: 'hf-map-popup' });

    markerLayer.addLayer(marker);
    markerMap.set(String(item.id), marker);
    latLngs.push([item.coordinates.lat, item.coordinates.lng]);
  });

  if (latLngs.length > 0) {
    const bounds = window.L.latLngBounds(latLngs);
    mapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }
}

export function focusMapPlace(item) {
  if (!mapInstance || !item || !item.coordinates) return;
  const marker = markerMap.get(String(item.id));

  mapInstance.setView([item.coordinates.lat, item.coordinates.lng], 15, { animate: true });
  if (marker) {
    marker.openPopup();
  }
}
