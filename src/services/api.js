import { fetchJSON, fetchWithCache, delay } from './fetcher';
import { WEATHER_CITIES, WEATHER_CODES } from '../data/constants';

// ─── Weather (Open-Meteo — free, no key) ─────────────────────
export async function fetchWeather(cities = WEATHER_CITIES) {
  return fetchWithCache('india:weather:cities', async () => {
    const results = [];
    for (const city of cities) {
      try {
        const data = await fetchJSON(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Asia/Kolkata`
        );
        results.push({
          city: city.name,
          temp: data.current?.temperature_2m,
          humidity: data.current?.relative_humidity_2m,
          windSpeed: data.current?.wind_speed_10m,
          weatherCode: data.current?.weather_code,
          condition: WEATHER_CODES[data.current?.weather_code] || 'Unknown',
        });
      } catch (err) {
        results.push({ city: city.name, error: true });
      }
      await delay(100);
    }
    return results;
  }, 10 * 60 * 1000);
}

export async function fetchStateWeather(lat, lng) {
  return fetchWithCache(`india:weather:${lat}:${lng}`, async () => {
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
import { fetchRSS, relativeTime } from './fetcher';

const NEWS_FEEDS = {
  'The Hindu': 'https://www.thehindu.com/news/national/feeder/default.rss',
  'Indian Express': 'https://indianexpress.com/section/india/feed/',
  'NDTV': 'https://feeds.feedburner.com/ndtvnews-top-stories',
  'Times of India': 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
  'Hindustan Times': 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
};

const TECH_FEEDS = {
  'Inc42': 'https://inc42.com/feed/',
  'YourStory': 'https://yourstory.com/feed',
};

const POLITICS_FEEDS = {
  'PIB': 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
  'The Hindu Politics': 'https://www.thehindu.com/news/national/feeder/default.rss',
};

export async function fetchNews(category = 'general') {
  const feeds = category === 'tech' ? TECH_FEEDS : 
                category === 'politics' ? POLITICS_FEEDS : NEWS_FEEDS;
  
  return fetchWithCache(`india:news:${category}`, async () => {
    const allItems = [];
    const feedEntries = Object.entries(feeds);
    
    const results = await Promise.allSettled(
      feedEntries.map(([source, url]) => fetchRSS(url).then(items => 
        items.map(item => ({ ...item, source }))
      ))
    );

    results.forEach(r => {
      if (r.status === 'fulfilled') allItems.push(...r.value);
    });

    return allItems
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 20)
      .map(item => ({
        ...item,
        timeAgo: relativeTime(item.pubDate),
      }));
  }, 20 * 60 * 1000);
}

export async function fetchDistrictNews(district) {
  return fetchWithCache(`india:news:district:${district}`, async () => {
    try {
      // Use GDELT for hyper-local search
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
export async function fetchAirQuality(lat, lng) {
  return fetchWithCache(`india:aqi:${lat}:${lng}`, async () => {
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

// ─── Re-exports from Static Intelligence Database ─────────────
import { 
  STATE_ECONOMY, CROP_PRICES, WATER_RESERVOIRS, 
  CYBER_THREATS, BORDER_STATUS, INFRA_TARGETS,
  ELECTION_DATA, UNICORN_DATA
} from '../data/intelligence';

export { 
  STATE_ECONOMY, CROP_PRICES, WATER_RESERVOIRS, 
  CYBER_THREATS, BORDER_STATUS, INFRA_TARGETS,
  ELECTION_DATA, UNICORN_DATA
};

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
