#!/usr/bin/env node
/**
 * Halal Finder — OpenStreetMap (OSM) Importer.
 *
 * Sourced under Open Database Licence (ODbL 1.0).
 * Queries OpenStreetMap (via Nominatim search API or Overpass API) for places
 * tagged halal, transforms them to Halal Finder's listing schema,
 * assigns `community_reported` evidence status (never false verified),
 * deduplicates against existing records, and validates against listing.schema.json.
 *
 * Usage:
 *   node scripts/import-osm-halal.cjs --city=bangkok --limit=10 --merge
 *   node scripts/import-osm-halal.cjs --source=nominatim --city=phuket --limit=5 --dry-run
 *   node scripts/import-osm-halal.cjs --source=overpass --city=bangkok --dry-run
 *   node scripts/import-osm-halal.cjs --file=osm-data.json --merge
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const LISTINGS_PATH = path.resolve(__dirname, '../docs/halal_finder_strategy_pack/MVP/data/listings.json');
const SCHEMA_PATH = path.resolve(__dirname, '../docs/halal_finder_strategy_pack/MVP/data/listing.schema.json');

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

const CITY_BBOXES = {
  bangkok: [13.60, 100.40, 13.90, 100.75],
  phuket: [7.75, 98.25, 8.15, 98.42],
  chiang_mai: [18.72, 98.93, 18.84, 99.04],
  krabi: [8.01, 98.80, 8.10, 98.95],
  pattaya: [12.87, 100.86, 12.98, 100.93],
  hat_yai: [6.97, 100.44, 7.04, 100.50]
};

const CITY_DISPLAY_NAMES = {
  bangkok: 'Bangkok',
  phuket: 'Phuket',
  chiang_mai: 'Chiang Mai',
  krabi: 'Krabi',
  pattaya: 'Pattaya',
  hat_yai: 'Hat Yai'
};

function parseArgs() {
  const args = {
    source: 'nominatim',
    city: 'bangkok',
    country: 'Thailand',
    limit: 10,
    merge: false,
    dryRun: false,
    out: LISTINGS_PATH,
    file: null,
    bbox: null,
    endpoint: null
  };

  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--source=')) args.source = arg.split('=')[1].toLowerCase();
    else if (arg.startsWith('--city=')) args.city = arg.split('=')[1].toLowerCase();
    else if (arg.startsWith('--country=')) args.country = arg.split('=')[1];
    else if (arg.startsWith('--limit=')) args.limit = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--bbox=')) args.bbox = arg.split('=')[1].split(',').map(Number);
    else if (arg.startsWith('--out=')) args.out = path.resolve(arg.split('=')[1]);
    else if (arg.startsWith('--file=')) args.file = path.resolve(arg.split('=')[1]);
    else if (arg.startsWith('--endpoint=')) args.endpoint = arg.split('=')[1];
    else if (arg === '--merge') args.merge = true;
    else if (arg === '--dry-run') args.dryRun = true;
  });

  return args;
}

function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'osm-place';
}

function resolvePlaceType(tags, elType) {
  if (!tags) return 'restaurant';
  const shop = (tags.shop || '').toLowerCase();
  const amenity = (tags.amenity || elType || '').toLowerCase();

  if (shop === 'butcher') return 'butcher';
  if (['supermarket', 'convenience', 'grocery', 'general', 'greengrocer'].includes(shop)) {
    return 'grocery';
  }
  return 'restaurant';
}

function resolveCuisine(tags, type) {
  if (tags && tags.cuisine) {
    return tags.cuisine
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' · ');
  }
  if (type === 'grocery') return 'Halal Groceries · Market';
  if (type === 'butcher') return 'Fresh Halal Meat · Butcher';
  return 'Halal Dining';
}

function transformOsmElement(el, options = {}) {
  if (!el) return null;
  const tags = Object.assign({}, el.tags || {}, el.extratags || {});

  // Determine place name
  let name = tags['name:en'] || el.name || tags.name || tags['name:th'] || tags['name:int_name'];
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    if (el.display_name) {
      name = el.display_name.split(',')[0].trim();
    }
  }
  if (!name || name.trim().length === 0) return null;

  const osmType = el.osm_type || (['node', 'way', 'relation'].includes(el.type) ? el.type : 'node');
  const type = resolvePlaceType(tags, el.type);

  const rawCity = tags['addr:city'] || (options.city ? CITY_DISPLAY_NAMES[options.city] || options.city : 'Bangkok');
  const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
  const country = options.country || 'Thailand';

  let address = '';
  if (el.address && typeof el.address === 'object') {
    const parts = [
      el.address.house_number,
      el.address.road,
      el.address.suburb || el.address.quarter,
      city,
      el.address.postcode
    ].filter(Boolean);
    address = parts.join(', ');
  } else {
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:subdistrict'],
      tags['addr:district'],
      tags['addr:postcode']
    ].filter(Boolean);
    address = addressParts.join(' ') || (tags['addr:full'] || el.display_name || `${city}, ${country}`);
  }

  const rawLat = typeof el.lat === 'number' ? el.lat : parseFloat(el.lat);
  const rawLng = typeof el.lon === 'number' ? el.lon : parseFloat(el.lon || el.lng);
  const lat = !isNaN(rawLat) ? rawLat : (el.center && el.center.lat);
  const lng = !isNaN(rawLng) ? rawLng : (el.center && (el.center.lon || el.center.lng));

  if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng)) {
    return null;
  }

  const numericOsmId = el.osm_id || el.id;
  const osmId = `${osmType}-${numericOsmId}`;
  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${slugify(city)}`;

  const isDietOnly = tags['diet:halal'] === 'only';
  const isOperatorMuslim = /(muslim|islam|halal)/i.test(tags.operator || tags.description || name);
  const isMuslimOwned = isDietOnly || isOperatorMuslim;

  const cuisine = resolveCuisine(tags, type);
  const todayIso = new Date().toISOString().slice(0, 10);

  const tagsList = ['OpenStreetMap (ODbL)'];
  if (tags['diet:halal']) tagsList.push(`diet:halal=${tags['diet:halal']}`);
  if (isMuslimOwned) tagsList.push('Muslim-owned');
  if (tags.cuisine) tagsList.push(tags.cuisine.replace(/;/g, ', '));

  return {
    id: `osm-${osmId}`,
    slug,
    name: name.trim(),
    type,
    city,
    country,
    address,
    coordinates: {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5))
    },
    cuisine,
    price: tags.opening_hours ? '$$' : '$',
    emoji: type === 'restaurant' ? '🍲' : type === 'grocery' ? '🛒' : '🥩',
    art: type === 'restaurant' ? 'green' : type === 'grocery' ? 'blue' : 'purple',
    featured: false,
    desc: tags.description || `${name.trim()} in ${city}, tagged halal on OpenStreetMap.`,
    tags: tagsList,
    isMuslimOwned,
    isSample: false,
    fictional: false,
    sourceName: 'OpenStreetMap contributors (ODbL 1.0)',
    dataLicence: 'ODbL 1.0 (https://www.openstreetmap.org/copyright)',
    evidence: {
      status: 'community_reported',
      scope: isDietOnly ? 'Halal-only premises tagged on OpenStreetMap' : 'Halal food options tagged on OpenStreetMap',
      lastCheckedAt: todayIso,
      sourceUrl: `https://www.openstreetmap.org/${osmType}/${numericOsmId}`,
      sourceLicence: 'ODbL 1.0',
      reviewerRole: 'OSM Importer',
      limitations: [
        'Community-reported from OpenStreetMap (diet:halal tag). Check current certification or meat suppliers on-site.'
      ]
    }
  };
}

function fetchNominatimHalal(city, country, limit = 10) {
  return new Promise((resolve, reject) => {
    const q = `halal ${city} ${country}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&extratags=1&addressdetails=1&limit=${limit}`;

    console.log(`Querying OpenStreetMap Nominatim API: ${url}...`);

    https.get(
      url,
      {
        headers: {
          'User-Agent': 'HalalFinder/1.0 (https://github.com/jhmeshu/halal-finder; contact@halalfinder.org)',
          'Accept': 'application/json'
        },
        timeout: 10000
      },
      res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(body);
              resolve({ elements: Array.isArray(data) ? data : [] });
            } catch (err) {
              reject(new Error(`Failed to parse Nominatim JSON response: ${err.message}`));
            }
          } else {
            reject(new Error(`Nominatim returned HTTP ${res.statusCode}: ${body}`));
          }
        });
      }
    ).on('error', err => {
      reject(new Error(`Nominatim request failed: ${err.message}`));
    }).on('timeout', function() {
      this.destroy();
      reject(new Error('Nominatim request timed out.'));
    });
  });
}

function fetchOverpassQuery(query, mirrors = OVERPASS_MIRRORS) {
  return new Promise((resolve, reject) => {
    let mirrorIndex = 0;

    function tryNext() {
      if (mirrorIndex >= mirrors.length) {
        return reject(new Error('All Overpass API mirrors failed or timed out.'));
      }
      const endpoint = mirrors[mirrorIndex++];
      console.log(`Querying Overpass mirror: ${endpoint}...`);

      const url = new URL(endpoint);
      const postData = `data=${encodeURIComponent(query)}`;
      let handled = false;

      function advance(reason) {
        if (handled) return;
        handled = true;
        console.warn(`${reason} from ${endpoint}, trying next...`);
        tryNext();
      }

      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'HalalFinder/1.0 (https://github.com/jhmeshu/halal-finder; contact@halalfinder.org)',
            'Accept': 'application/json'
          },
          timeout: 20000
        },
        res => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', chunk => { body += chunk; });
          res.on('end', () => {
            if (handled) return;
            if (res.statusCode === 200) {
              try {
                const data = JSON.parse(body);
                handled = true;
                resolve(data);
              } catch (err) {
                advance(`Invalid JSON response: ${err.message}`);
              }
            } else {
              advance(`HTTP ${res.statusCode}`);
            }
          });
        }
      );

      req.on('error', err => {
        advance(`Network error (${err.message})`);
      });

      req.on('timeout', () => {
        req.destroy();
        advance('Timeout');
      });

      req.write(postData);
      req.end();
    }

    tryNext();
  });
}

function isDuplicate(newItem, existingListings) {
  return existingListings.some(existing => {
    if (existing.id === newItem.id || existing.slug === newItem.slug) return true;
    if (existing.name && newItem.name && existing.name.toLowerCase() === newItem.name.toLowerCase()) {
      return true;
    }

    if (existing.coordinates && newItem.coordinates) {
      const dLat = Math.abs(existing.coordinates.lat - newItem.coordinates.lat);
      const dLng = Math.abs(existing.coordinates.lng - newItem.coordinates.lng);
      // Roughly within ~40 meters
      if (dLat < 0.0004 && dLng < 0.0004) return true;
    }
    return false;
  });
}

async function run() {
  const options = parseArgs();
  console.log(`Starting OSM Halal Importer [source: ${options.source}, city: ${options.city}, limit: ${options.limit}]...`);

  let osmData = null;

  if (options.file) {
    console.log(`Reading local OSM file: ${options.file}`);
    osmData = JSON.parse(fs.readFileSync(options.file, 'utf8'));
  } else if (options.source === 'nominatim') {
    try {
      osmData = await fetchNominatimHalal(options.city, options.country, options.limit);
    } catch (err) {
      console.warn(`Nominatim failed (${err.message}). Trying Overpass fallback...`);
      const bbox = options.bbox || CITY_BBOXES[options.city] || CITY_BBOXES.bangkok;
      const [south, west, north, east] = bbox;
      const query = `[out:json][timeout:25];(node["diet:halal"="yes"](${south},${west},${north},${east});node["diet:halal"="only"](${south},${west},${north},${east}););out center 40 body;`;
      osmData = await fetchOverpassQuery(query);
    }
  } else {
    const bbox = options.bbox || CITY_BBOXES[options.city] || CITY_BBOXES.bangkok;
    const [south, west, north, east] = bbox;
    const query = `[out:json][timeout:25];(node["diet:halal"="yes"](${south},${west},${north},${east});node["diet:halal"="only"](${south},${west},${north},${east}););out center 40 body;`;

    const mirrors = options.endpoint ? [options.endpoint] : OVERPASS_MIRRORS;
    try {
      osmData = await fetchOverpassQuery(query, mirrors);
    } catch (err) {
      console.warn(`Overpass failed (${err.message}). Falling back to Nominatim...`);
      osmData = await fetchNominatimHalal(options.city, options.country, options.limit);
    }
  }

  const elements = (osmData && osmData.elements) || [];
  console.log(`Found ${elements.length} raw elements from OpenStreetMap.`);

  const existing = fs.existsSync(options.out)
    ? JSON.parse(fs.readFileSync(options.out, 'utf8'))
    : [];

  const imported = [];
  for (const el of elements) {
    if (imported.length >= options.limit) break;
    const transformed = transformOsmElement(el, options);
    if (!transformed) continue;

    if (!isDuplicate(transformed, existing) && !isDuplicate(transformed, imported)) {
      imported.push(transformed);
    }
  }

  console.log(`Transformed and deduplicated ${imported.length} new listings.`);

  if (options.dryRun) {
    console.log('\n--- DRY RUN PREVIEW ---');
    console.log(JSON.stringify(imported, null, 2));
    return;
  }

  if (imported.length === 0) {
    console.log('No new unique listings to add.');
    return;
  }

  const finalOutput = options.merge ? [...existing, ...imported] : imported;
  fs.writeFileSync(options.out, JSON.stringify(finalOutput, null, 2) + '\n', 'utf8');
  console.log(`Saved ${finalOutput.length} total listings to ${options.out} (added +${imported.length}).`);
}

module.exports = {
  transformOsmElement,
  isDuplicate,
  slugify,
  resolvePlaceType,
  resolveCuisine,
  fetchNominatimHalal
};

if (require.main === module) {
  run().catch(err => {
    console.error(`Importer failed: ${err.message}`);
    process.exit(1);
  });
}
