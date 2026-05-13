import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { put } from "@vercel/blob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// We'll import data files directly
const distPath = join(ROOT, "src", "data", "districts.js");
const constPath = join(ROOT, "src", "data", "constants.js");

async function loadLocalEnv() {
  const p = join(ROOT, ".env");
  try {
    const txt = await readFile(p, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOverpass(query, retries = 3) {
  const endpoint = `https://overpass-api.de/api/interpreter`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        headers: { "User-Agent": "IndiaMonitor/1.0" }
      });
      if (res.ok) {
        return await res.json();
      } else if (res.status === 429) {
        console.warn(`[Overpass] 429 Too Many Requests. Sleeping 10s...`);
        await sleep(10000);
      } else {
        console.warn(`[Overpass] Error ${res.status}: ${await res.text()}`);
        await sleep(3000);
      }
    } catch (err) {
      console.warn(`[Overpass] Exception: ${err.message}. Retrying...`);
      await sleep(3000);
    }
  }
  return null;
}

async function fetchEVStationsForCity(city, coords) {
  let query;
  if (coords && coords.lat && coords.lng) {
    query = `
      [out:json][timeout:25];
      (
        node["amenity"="charging_station"](around:20000,${coords.lat},${coords.lng});
        way["amenity"="charging_station"](around:20000,${coords.lat},${coords.lng});
      );
      out body;
      >;
      out skel qt;
    `;
  } else {
    query = `
      [out:json][timeout:25];
      area["name"="${city}"]->.searchArea;
      (
        node["amenity"="charging_station"](area.searchArea);
        way["amenity"="charging_station"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `;
  }

  const data = await fetchOverpass(query);
  if (!data || !data.elements) return [];

  const results = data.elements
    .filter((el) => el.tags && el.tags.amenity === "charging_station")
    .map((el) => {
      const stationLat = el.lat || (el.center && el.center.lat);
      const stationLng = el.lon || (el.center && el.center.lon);
      
      let addressParts = [];
      if (el.tags["addr:street"]) addressParts.push(el.tags["addr:street"]);
      if (el.tags["addr:suburb"]) addressParts.push(el.tags["addr:suburb"]);
      if (el.tags["addr:neighbourhood"]) addressParts.push(el.tags["addr:neighbourhood"]);
      if (el.tags["addr:city"]) addressParts.push(el.tags["addr:city"]);
      const address = el.tags["addr:full"] || (addressParts.length > 0 ? addressParts.join(", ") : `${city} Region`);

      return {
        id: el.id,
        name: el.tags.name || "EV Charging Station",
        operator: el.tags.operator || "Unknown Operator",
        network: el.tags.network || el.tags.brand || "Unknown Network",
        capacity: el.tags.capacity || "N/A",
        socket: el.tags["socket:type2"] ? "Type 2" : (el.tags.socket ? el.tags.socket : "Standard"),
        lat: stationLat,
        lng: stationLng,
        address: address,
        direction_link: stationLat && stationLng ? `https://www.google.com/maps/dir/?api=1&destination=${stationLat},${stationLng}` : null,
      };
    });
    
  return results;
}

async function main() {
  await loadLocalEnv();

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.error("Set BLOB_READ_WRITE_TOKEN (Vercel Blob read/write token).");
    process.exit(1);
  }

  // Load districts
  const { STATE_DISTRICTS, DISTRICT_COORDS } = await import(pathToFileURL(distPath).href);
  const { STATES } = await import(pathToFileURL(constPath).href);

  const allCities = [];
  for (const [stateCode, districts] of Object.entries(STATE_DISTRICTS)) {
    const stateObj = STATES.find((s) => s.code === stateCode);
    const fallbackCoords = stateObj ? { lat: stateObj.lat, lng: stateObj.lng } : null;
    for (const district of districts) {
      allCities.push({
        city: district,
        coords: DISTRICT_COORDS[district] || fallbackCoords
      });
    }
  }

  // Also add capitals
  for (const state of STATES) {
    if (state.capital && !allCities.find(c => c.city === state.capital)) {
      allCities.push({
        city: state.capital,
        coords: DISTRICT_COORDS[state.capital] || { lat: state.lat, lng: state.lng }
      });
    }
  }

  console.log(`Starting EV stations sync for ${allCities.length} locations...`);

  const cache = {};
  let processed = 0;

  for (const { city, coords } of allCities) {
    if (cache[city]) continue;
    
    console.log(`[${processed + 1}/${allCities.length}] Fetching EV stations for ${city}...`);
    const results = await fetchEVStationsForCity(city, coords);
    cache[city] = { count: results.length, results };
    processed++;
    
    // Sleep to respect Overpass rate limits (2 seconds between requests)
    await sleep(2000);
  }

  const out = {
    fetchedAt: new Date().toISOString(),
    data: cache,
  };

  const { url } = await put("ev-cache.json", JSON.stringify(out, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  console.log(`Uploaded to Vercel Blob: ${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
