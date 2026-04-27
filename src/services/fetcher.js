// In-memory cache
const cache = new Map();

export async function fetchWithCache(key, fetcher, ttlMs = 5 * 60 * 1000) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.time < ttlMs) {
    return cached.data;
  }

  try {
    const data = await fetcher();
    cache.set(key, { data, time: Date.now() });
    return data;
  } catch (err) {
    // Return stale cache if available
    if (cached) {
      console.warn(`[Cache] Returning stale data for ${key}:`, err.message);
      return cached.data;
    }
    throw err;
  }
}

export async function fetchJSON(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Stagger delay for Yahoo Finance
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// RSS feed parser via rss2json
export async function fetchRSS(feedUrl) {
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const data = await res.json();
    return (data.items || []).slice(0, 15).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: '', // Source is assigned and overwritten in api.js
    }));
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${feedUrl}:`, err.message);
    return [];
  }
}

// Format relative time
export function relativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
