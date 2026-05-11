import { fetchJSON, fetchWithCache, delay } from './fetcher';
import { WEATHER_CITIES, WEATHER_CODES } from '../data/constants';

// ─── Weather (Open-Meteo — free, no key) ─────────────────────
export async function fetchWeather(cities = WEATHER_CITIES) {
  return fetchWithCache('india:weather:cities', async () => {
    try {
      const lats = cities.map(c => c.lat).join(',');
      const lngs = cities.map(c => c.lng).join(',');
      const data = await fetchJSON(
        `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Kolkata`
      );

      // Open-Meteo returns an array of objects if multiple lat/lng are provided
      const results = (Array.isArray(data) ? data : [data]).map((item, i) => ({
        city: cities[i].name,
        temp: item.current?.temperature_2m,
        humidity: item.current?.relative_humidity_2m,
        condition: WEATHER_CODES[item.current?.weather_code] || 'Unknown',
      }));
      return results;
    } catch (err) {
      console.error('[Weather API Error]', err);
      return cities.map(c => ({ city: c.name, error: true }));
    }
  }, 10 * 60 * 1000);
}

export async function fetchStateWeather(locationName, fallbackLat, fallbackLng) {
  return fetchWithCache(`india:weather:${locationName}`, async () => {
    let lat = fallbackLat;
    let lng = fallbackLng;

    // Only geocode if we don't have valid coordinates or if it's a generic request
    if (!lat || !lng) {
      try {
        const geo = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName + ' India')}&count=1&language=en&format=json`);
        if (geo.results && geo.results.length > 0) {
          lat = geo.results[0].latitude;
          lng = geo.results[0].longitude;
        }
      } catch(e) {
        console.warn(`[Weather API] Geocoding failed for ${locationName}, using fallbacks.`);
      }
    }


    const data = await fetchJSON(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Kolkata&forecast_days=5`
    );
    return {
      current: {
        temp: data.current?.temperature_2m,
        feelsLike: data.current?.apparent_temperature,
        humidity: data.current?.relative_humidity_2m,
        windSpeed: data.current?.wind_speed_10m,
        condition: WEATHER_CODES[data.current?.weather_code] || 'Unknown',
      },
      forecast: data.daily?.time?.map((d, i) => ({
        date: d,
        maxTemp: data.daily.temperature_2m_max[i],
        minTemp: data.daily.temperature_2m_min[i],
        condition: WEATHER_CODES[data.daily.weather_code[i]] || 'Unknown',
      })) || [],
    };
  }, 10 * 60 * 1000);
}

// ─── Earthquakes (USGS — free, no key) ───────────────────────
export async function fetchEarthquakes() {
  return fetchWithCache('india:earthquakes', async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    
    const data = await fetchJSON(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&minlatitude=6.5&maxlatitude=37.1&minlongitude=68.1&maxlongitude=97.4&minmagnitude=3&orderby=time&limit=20`
    );

    return (data.features || []).map(f => ({
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: new Date(f.properties.time).toISOString(),
      depth: f.geometry.coordinates[2],
      url: f.properties.url,
    }));
  }, 15 * 60 * 1000);
}

// ─── World Bank (free, no key) ────────────────────────────────
export async function fetchWorldBankIndicator(indicator, years = 5) {
  return fetchWithCache(`india:wb:${indicator}`, async () => {
    const data = await fetchJSON(
      `https://api.worldbank.org/v2/country/IND/indicator/${indicator}?format=json&per_page=${years}&mrv=${years}`
    );
    if (!data || !data[1]) return [];
    return data[1].map(d => ({
      year: d.date,
      value: d.value,
    })).filter(d => d.value !== null);
  }, 6 * 60 * 60 * 1000);
}

export async function fetchMacroData() {
  const [gdp, cpi, fdi, debt] = await Promise.allSettled([
    fetchWorldBankIndicator('NY.GDP.MKTP.KD.ZG', 5), // GDP growth
    fetchWorldBankIndicator('FP.CPI.TOTL.ZG', 5),    // CPI inflation
    fetchWorldBankIndicator('BX.KLT.DINV.CD.WD', 5), // FDI
    fetchWorldBankIndicator('GC.DOD.TOTL.GD.ZS', 5), // Debt-to-GDP
  ]);

  return {
    gdp: gdp.status === 'fulfilled' ? gdp.value : [],
    cpi: cpi.status === 'fulfilled' ? cpi.value : [],
    fdi: fdi.status === 'fulfilled' ? fdi.value : [],
    debtToGdp: debt.status === 'fulfilled' ? debt.value : [],
  };
}

export async function fetchTradeData() {
  const [exports, imports] = await Promise.allSettled([
    fetchWorldBankIndicator('BX.GSR.GNFS.CD', 5), // Exports
    fetchWorldBankIndicator('BM.GSR.GNFS.CD', 5), // Imports
  ]);

  return {
    exports: exports.status === 'fulfilled' ? exports.value : [],
    imports: imports.status === 'fulfilled' ? imports.value : [],
  };
}

// ─── Exchange Rates (free, no key) ────────────────────────────
export async function fetchExchangeRates() {
  return fetchWithCache('india:currency', async () => {
    const data = await fetchJSON('https://open.er-api.com/v6/latest/INR');
    if (!data.rates) return {};
    return {
      USD: 1 / data.rates.USD,
      EUR: 1 / data.rates.EUR,
      GBP: 1 / data.rates.GBP,
      JPY: data.rates.JPY,
      fetchedAt: data.time_last_update_utc,
    };
  }, 12 * 60 * 1000);
}

// ─── News (RSS via proxy) ─────────────────────────────────────
import { relativeTime } from './fetcher';

export async function fetchNews(category = 'general') {
  return fetchWithCache(`india:news:${category}`, async () => {
    try {
      const res = await fetch(`/api/news?category=${category}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.items || []);
    } catch (err) {
      console.warn(`[News] /api/news failed for category=${category}:`, err.message);
      return [];
    }
  }, 20 * 60 * 1000);
}


export async function fetchStateNews(stateCode, stateName, district) {
  const cacheKey = `india:news:state:${stateCode}`;

  return fetchWithCache(cacheKey, async () => {
    try {
      const res = await fetch(`/api/news?state=${stateCode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data.items || []);
    } catch (err) {
      console.warn(`[StateNews] /api/news failed for ${stateCode}:`, err.message);
      return [];
    }
  }, 20 * 60 * 1000);
}

export async function fetchDistrictNews(district) {
  const newsDataKey = import.meta.env.VITE_NEWSDATA_API_KEY;
  const newsApiKey = import.meta.env.VITE_NEWSAPI_KEY;

  return fetchWithCache(`india:news:district:${district}`, async () => {
    // 1. Try NewsData.io
    if (newsDataKey) {
      try {
        const query = encodeURIComponent(`"${district}" AND India`);
        const data = await fetchJSON(`https://newsdata.io/api/1/latest?apikey=${newsDataKey}&q=${query}&country=in&language=en`);
        if (data.results && data.results.length > 0) {
          return data.results.map(item => ({
            title: item.title,
            url: item.link,
            source: item.source_id?.toUpperCase() || 'NewsData',
            timeAgo: relativeTime(item.pubDate),
          }));
        }
      } catch (err) {}
    }

    // 2. Try NewsAPI
    if (newsApiKey) {
      try {
        const query = encodeURIComponent(`"${district}"`);
        const data = await fetchJSON(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=${newsApiKey}`);
        if (data.articles && data.articles.length > 0) {
          return data.articles.map(item => ({
            title: item.title,
            url: item.url,
            source: item.source?.name || 'NewsAPI',
            timeAgo: relativeTime(item.publishedAt),
          }));
        }
      } catch (err) {}
    }

    // 3. Fallback: GDELT
    try {
      const data = await fetchJSON(
        `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(district + ' India')}&mode=artlist&maxrecords=10&format=json&sort=datedesc`
      );
      return (data.articles || []).map(a => ({
        title: a.title,
        url: a.url,
        source: a.domain,
        timeAgo: relativeTime(a.seendate),
      }));
    } catch {
      return [];
    }
  }, 30 * 60 * 1000);
}

export async function fetchStateInfraNews(stateName) {
  const newsDataKey = import.meta.env.VITE_NEWSDATA_API_KEY;
  const newsApiKey = import.meta.env.VITE_NEWSAPI_KEY;

  return fetchWithCache(`india:infra:${stateName}`, async () => {
    // 1. Try NewsData.io
    if (newsDataKey) {
      try {
        const query = encodeURIComponent(`"${stateName}" AND (infrastructure OR development OR projects)`);
        const data = await fetchJSON(`https://newsdata.io/api/1/latest?apikey=${newsDataKey}&q=${query}&country=in&language=en`);
        if (data.results && data.results.length > 0) {
          return data.results.slice(0, 3).map(item => ({
            title: item.title,
            url: item.link,
            source: item.source_id?.toUpperCase() || 'NewsData',
            timeAgo: relativeTime(item.pubDate),
          }));
        }
      } catch (err) {}
    }

    // 2. Try NewsAPI
    if (newsApiKey) {
      try {
        const query = encodeURIComponent(`"${stateName}" AND (infrastructure OR development)`);
        const data = await fetchJSON(`https://newsapi.org/v2/everything?q=${query}&sortBy=relevancy&apiKey=${newsApiKey}`);
        if (data.articles && data.articles.length > 0) {
          return data.articles.slice(0, 3).map(item => ({
            title: item.title,
            url: item.url,
            source: item.source?.name || 'NewsAPI',
            timeAgo: relativeTime(item.publishedAt),
          }));
        }
      } catch (err) {}
    }

    return [];
  }, 60 * 60 * 1000);
}

// ─── GDELT Intelligence (free, no key) ────────────────────────
export async function fetchGdeltIntel() {
  return fetchWithCache('india:gdelt', async () => {
    try {
      const data = await fetchJSON(
        'https://api.gdeltproject.org/api/v2/doc/doc?query=india&mode=artlist&maxrecords=15&format=json&sort=datedesc'
      );
      return (data.articles || []).map(a => ({
        title: a.title,
        url: a.url,
        source: a.domain,
        date: a.seendate,
        tone: a.tone,
        language: a.language,
      }));
    } catch {
      return [];
    }
  }, 15 * 60 * 1000);
}

// ─── Financial Markets (Yahoo via Proxy) ────────────────────────
export async function fetchMarketIndices() {
  return fetchWithCache('india:markets', async () => {
    try {
      // Free Yahoo Finance endpoint via allorigins proxy to bypass CORS
      const proxies = ['^NSEI', '^BSESN', '^NSEBANK'];
      const results = {};
      
      for (const symbol of proxies) {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
        const res = await fetchJSON(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        
        const meta = res?.chart?.result?.[0]?.meta;
        if (meta) {
          results[symbol] = {
            price: meta.regularMarketPrice,
            prevClose: meta.previousClose,
            changePct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
          };
        }
      }
      return [
        { name: 'NIFTY 50', value: results['^NSEI']?.price || 24328, change: results['^NSEI']?.changePct || 1.2 },
        { name: 'SENSEX', value: results['^BSESN']?.price || 80218, change: results['^BSESN']?.changePct || 1.1 },
        { name: 'NIFTY Bank', value: results['^NSEBANK']?.price || 52847, change: results['^NSEBANK']?.changePct || 0.8 },
      ];
    } catch {
      // Fallback if proxy fails
      return [
        { name: 'NIFTY 50', value: 24328, change: 1.2 },
        { name: 'SENSEX', value: 80218, change: 1.1 },
        { name: 'NIFTY Bank', value: 52847, change: 0.8 },
      ];
    }
  }, 10 * 60 * 1000); // 10 min cache
}

// ─── Air Quality (Open-Meteo AQI — free) ──────────────────────
export async function fetchAirQuality(locationName, fallbackLat, fallbackLng) {
  return fetchWithCache(`india:aqi:${locationName}`, async () => {
    let lat = fallbackLat;
    let lng = fallbackLng;

    if (!lat || !lng) {
      try {
        const geo = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName + ' India')}&count=1&language=en&format=json`);
        if (geo.results && geo.results.length > 0) {
          lat = geo.results[0].latitude;
          lng = geo.results[0].longitude;
        }
      } catch(e) {}
    }


    try {
      const data = await fetchJSON(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,european_aqi`
      );
      return {
        aqi: data.current?.european_aqi || 50,
        pm25: data.current?.pm2_5 || 15,
        pm10: data.current?.pm10 || 30
      };
    } catch {
      return { aqi: 50, pm25: 15, pm10: 30 };
    }
  }, 30 * 60 * 1000); // 30 min cache
}

// ─── Wikipedia Intelligence Briefing ──────────────────────────
export async function fetchWikipediaSummary(query) {
  return fetchWithCache(`wiki:summary:${query}`, async () => {
    try {
      const formattedQuery = query.replace(/ /g, '_');
      const data = await fetchJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${formattedQuery}`);
      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail?.source || null,
        url: data.content_urls?.desktop?.page || '#'
      };
    } catch {
      return null;
    }
  }, 24 * 60 * 60 * 1000); // 24h cache stringency
}

// ─── Groq AI Intelligence Briefing ────────────────────────────
export async function fetchGroqIntelligence(district, state) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!groqKey) return null;

  return fetchWithCache(`india:groq:${district}:${state}`, async () => {
    try {
      const prompt = `Provide a concise, 3-sentence intelligence brief on the district of ${district} in ${state}, India. Focus on its strategic importance, major industries, and recent developments. Keep it highly professional and factual.`;
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.2
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      
      return {
        title: `${district} Intelligence Overview`,
        extract: data.choices[0].message.content.trim(),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(district)}`,
        thumbnail: null
      };
    } catch (e) {
      console.warn('[Groq API Error]', e);
      return null;
    }
  }, 24 * 60 * 60 * 1000);
}

// ─── Re-exports from Static Intelligence Database ─────────────
import { 
  STATE_ECONOMY, CROP_PRICES, WATER_RESERVOIRS, 
  CYBER_THREATS, BORDER_STATUS, INFRA_TARGETS,
  ELECTION_DATA, UNICORN_DATA, STATE_DEMOGRAPHICS, STATE_AGRICULTURE,
  SAFE_REGIONS
} from '../data/intelligence';

export { 
  STATE_ECONOMY, CROP_PRICES, WATER_RESERVOIRS, 
  CYBER_THREATS, BORDER_STATUS, INFRA_TARGETS,
  ELECTION_DATA, UNICORN_DATA, STATE_DEMOGRAPHICS, STATE_AGRICULTURE,
  SAFE_REGIONS
};

// ─── Fuel Prices (via backend proxy → /api/fuel) ──────────────
// In production (Vercel): calls /api/fuel serverless function — API key stays
// hidden server-side, CDN caches for 24 h across all users.
// In local dev (without dev:api running): falls back to calling IndianAPI
// directly using the VITE_ key so you can still develop without two terminals.
export async function fetchFuelPrices(stateName) {
  // 1. Fetch ALL states once and cache the whole payload for 24 hours
  const allFuelData = await fetchWithCache('india:fuel:all_states', async () => {
    async function fetchFuelType(fuelType) {
      // ── Try the backend proxy first (works in prod + when dev:api is running)
      try {
        const proxyRes = await fetch(`/api/fuel?fuel_type=${fuelType}`);
        if (proxyRes.ok) return await proxyRes.json();
      } catch { /* proxy not available locally */ }

      // ── Fallback: call IndianAPI directly (local dev only)
      const apiKey = import.meta.env.VITE_INDIAN_API_KEY;
      if (!apiKey) return [];
      try {
        const directRes = await fetch(
          `https://fuel.indianapi.in/live_fuel_price?location_type=state&fuel_type=${fuelType}`,
          { headers: { 'X-Api-Key': apiKey } }
        );
        if (directRes.ok) {
          console.warn(`[Fuel] Using direct API call for ${fuelType} (start dev:api to use proxy)`);
          return await directRes.json();
        }
      } catch (err) {
        console.warn('[Fuel] Direct API fallback also failed:', err.message);
      }
      return [];
    }

    try {
      const [petrol, diesel] = await Promise.all([
        fetchFuelType('petrol'),
        fetchFuelType('diesel'),
      ]);
      return { petrol, diesel };
    } catch (err) {
      console.warn('[Fuel Error]', err);
      return { petrol: [], diesel: [] };
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  // 2. Filter locally — no extra network call when switching states
  const normalize = (s) => s.toLowerCase().replace(/ and /g, ' & ').replace(/[^a-z]/g, '');
  const targetState = normalize(stateName);

  const petrolMatch = allFuelData.petrol.find(item => normalize(item.city || item.state || '') === targetState);
  const dieselMatch = allFuelData.diesel.find(item => normalize(item.city || item.state || '') === targetState);

  return {
    petrol: petrolMatch ? { price: petrolMatch.price, change: petrolMatch.change } : null,
    diesel: dieselMatch ? { price: dieselMatch.price, change: dieselMatch.change } : null,
  };
}


// ─── Petrol Pumps (via backend proxy → /api/pumps) ────────────
// Uses ssrinnovationlab.com API (free, no key). Proxy handles CORS
// and CDN caching. Falls back to direct call in local dev.
export async function fetchPetrolPumps(city, limit = 10) {
  return fetchWithCache(`india:pumps:${city}:${limit}`, async () => {
    async function tryFetch() {
      // ── Try backend proxy first
      try {
        const proxyRes = await fetch(`/api/pumps?city=${encodeURIComponent(city)}&limit=${limit}`);
        if (proxyRes.ok) return await proxyRes.json();
      } catch { /* proxy not available */ }

      // ── Fallback: direct call (local dev)
      try {
        const directRes = await fetch(
          `https://api.ssrinnovationlab.com/api/petrol-pumps/pumps/by-city/?city=${encodeURIComponent(city)}&limit=${limit}`
        );
        if (directRes.ok) {
          console.warn(`[Pumps] Using direct API call (start dev:api to use proxy)`);
          return await directRes.json();
        }
      } catch (err) {
        console.warn('[Pumps] Direct fallback failed:', err.message);
      }
      return { count: 0, results: [] };
    }

    try {
      return await tryFetch();
    } catch (err) {
      console.warn('[Pumps Error]', err);
      return { count: 0, results: [] };
    }
  }, 6 * 60 * 60 * 1000); // 6 hours cache
}

// ─── EV Charging Stations (via backend proxy → /api/ev) ───────
// Uses OpenStreetMap Overpass API (free, no key). Proxy handles CORS
// and CDN caching. Falls back to direct call in local dev.
export async function fetchEVStations(city) {
  return fetchWithCache(`india:ev:${city}`, async () => {
    const query = `
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

    async function tryFetch() {
      // ── Try backend proxy first
      try {
        const proxyRes = await fetch(`/api/ev?city=${encodeURIComponent(city)}`);
        if (proxyRes.ok) return await proxyRes.json();
      } catch { /* proxy not available */ }

      // ── Fallback: direct call (local dev)
      try {
        const endpoint = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const directRes = await fetch(endpoint);
        if (directRes.ok) {
          console.warn(`[EV] Using direct API call (start dev:api to use proxy)`);
          const data = await directRes.json();
          const results = data.elements
            .filter(el => el.tags && el.tags.amenity === 'charging_station')
            .map(el => {
              const lat = el.lat || (el.center && el.center.lat);
              const lng = el.lon || (el.center && el.center.lon);
              return {
                id: el.id,
                name: el.tags.name || 'EV Charging Station',
                operator: el.tags.operator || 'Unknown Operator',
                network: el.tags.network || el.tags.brand || 'Unknown Network',
                capacity: el.tags.capacity || 'N/A',
                socket: el.tags['socket:type2'] ? 'Type 2' : (el.tags.socket ? el.tags.socket : 'Standard'),
                lat,
                lng,
                address: el.tags['addr:full'] || el.tags['addr:street'] || 'Address not available',
                direction_link: lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null
              };
            });
          return { count: results.length, results };
        }
      } catch (err) {
        console.warn('[EV] Direct fallback failed:', err.message);
      }
      return { count: 0, results: [] };
    }

    try {
      return await tryFetch();
    } catch (err) {
      console.warn('[EV Error]', err);
      return { count: 0, results: [] };
    }
  }, 12 * 60 * 60 * 1000); // 12 hours cache
}


// Simplified static data retainers
export function getRbiPolicyRates() {
  return { repoRate: 6.50, reverseRepoRate: 3.35, crr: 4.50, slr: 18.00, inflationTarget: '4% ± 2%', lastUpdated: 'Apr 2025' };
}
export function getEnergyData() {
  return {
    powerMix: [
      { source: 'Coal', percentage: 49.1, color: '#6b7280' }, { source: 'Solar', percentage: 18.5, color: '#f59e0b' },
      { source: 'Wind', percentage: 10.6, color: '#06b6d4' }, { source: 'Hydro', percentage: 11.0, color: '#3b82f6' }
    ], totalCapacity: 425.4, renewableTarget: 500, renewableCurrent: 135.2
  };
}
