import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOB_KEY = "fuel-prices.json";

const BASE = "https://fuel.indianapi.in/live_fuel_price";
const FUEL_TYPES = ["petrol", "diesel"];

async function loadLocalEnv() {
  const p = join(ROOT, ".env");
  let txt;
  try {
    txt = await readFile(p, "utf8");
  } catch {
    return;
  }
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

async function fetchFuel(fuelType) {
  const key = process.env.INDIAN_API_KEY;
  if (!key?.trim()) {
    throw new Error("Missing INDIAN_API_KEY in environment");
  }
  const url = `${BASE}?location_type=state&fuel_type=${fuelType}`;
  const res = await fetch(url, {
    headers: { "X-Api-Key": key.trim() },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upstream ${fuelType} ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected ${fuelType} payload (expected array)`);
  }
  return data;
}

async function main() {
  await loadLocalEnv();

  if (!process.env.INDIAN_API_KEY?.trim()) {
    console.error(
      "Set INDIAN_API_KEY (IndianAPI key for fuel.indianapi.in).",
    );
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.error(
      "Set BLOB_READ_WRITE_TOKEN (Vercel Blob read/write token).",
    );
    process.exit(1);
  }

  const [petrol, diesel] = await Promise.all(
    FUEL_TYPES.map((t) => fetchFuel(t)),
  );

  const fetchedAt = new Date().toISOString();
  const out = {
    fetchedAt,
    source: BASE,
    counts: { petrol: petrol.length, diesel: diesel.length },
    petrol,
    diesel,
  };

  const { url } = await put(BLOB_KEY, JSON.stringify(out, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(
    `Uploaded to Vercel Blob: ${url} (petrol=${petrol.length}, diesel=${diesel.length}).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
