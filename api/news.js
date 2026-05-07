const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['dc:creator', 'creator']],
  },
});

async function fetchRssXml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.thehindu.com/',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

const STATE_FEEDS = {
  KL: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/kerala/feeder/default.rss' }],
  TN: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss' }],
  AP: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss' }],
  TS: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/telangana/feeder/default.rss' }],
  KA: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/karnataka/feeder/default.rss' }],
  MH: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/maharashtra/feeder/default.rss' },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss' },
    { source: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms' },
  ],
  WB: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/west-bengal/feeder/default.rss' }],
  GJ: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/gujarat/feeder/default.rss' }],
  RJ: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/rajasthan/feeder/default.rss' }],
  MP: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/madhya-pradesh/feeder/default.rss' }],
  CT: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/chhattisgarh/feeder/default.rss' }],
  UP: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/uttar-pradesh/feeder/default.rss' }],
  BR: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/bihar/feeder/default.rss' }],
  JH: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/jharkhand/feeder/default.rss' }],
  OR: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/odisha/feeder/default.rss' }],
  PB: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/punjab/feeder/default.rss' }],
  HR: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/haryana/feeder/default.rss' }],
  DL: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/delhi/feeder/default.rss' }],
  AS: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/assam/feeder/default.rss' }],
  MN: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/manipur/feeder/default.rss' }],
  ML: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/meghalaya/feeder/default.rss' }],
  MZ: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/mizoram/feeder/default.rss' }],
  NL: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/nagaland/feeder/default.rss' }],
  TR: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/tripura/feeder/default.rss' }],
  AR: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/arunachal-pradesh/feeder/default.rss' }],
  SK: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/sikkim/feeder/default.rss' }],
  HP: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/himachal-pradesh/feeder/default.rss' }],
  UK: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/uttarakhand/feeder/default.rss' }],
  GA: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/goa/feeder/default.rss' }],
  JK: [{ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/jammu-and-kashmir/feeder/default.rss' }],
  AN: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss', keywords: ['andaman', 'nicobar', 'port blair'] },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss',              keywords: ['andaman', 'nicobar', 'port blair'] },
  ],
  LA: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss', keywords: ['ladakh', 'leh', 'kargil', 'siachen'] },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss',              keywords: ['ladakh', 'leh', 'kargil', 'siachen'] },
  ],
  CH: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss', keywords: ['chandigarh'] },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss',              keywords: ['chandigarh'] },
  ],
  DD: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss', keywords: ['daman', 'diu', 'dadra', 'nagar haveli'] },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss',              keywords: ['daman', 'diu', 'dadra', 'nagar haveli'] },
  ],
  LD: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss', keywords: ['lakshadweep', 'kavaratti'] },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss',              keywords: ['lakshadweep', 'kavaratti'] },
  ],
  PY: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/other-states/feeder/default.rss', keywords: ['puducherry', 'pondicherry'] },
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss',              keywords: ['puducherry', 'pondicherry'] },
  ],
};

const NATIONAL_FEEDS = {
  general: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  ],
  politics: [
    { source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  ],
  tech: [
    { source: 'The Hindu Tech', url: 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss' },
  ],
};

function relativeTime(dateStr) {
  if (!dateStr) return 'Unknown date';
  const date = new Date(dateStr);
  if (isNaN(date)) return 'Invalid date';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr  < 24) return `${diffHr}h ago`;
  if (diffDay < 7)  return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

async function fetchFeed({ source, url, keywords }) {
  try {
    const xml = await fetchRssXml(url);
    const feed = await parser.parseString(xml);
    let items = (feed.items || []).map(item => ({
      title:   item.title?.trim() || '',
      url:     item.link  || item.guid || '',
      source,
      pubDate: item.pubDate || item.isoDate || '',
      timeAgo: relativeTime(item.pubDate || item.isoDate),
    }));

    if (keywords && keywords.length > 0) {
      const kw = keywords.map(k => k.toLowerCase());
      items = items.filter(item =>
        kw.some(k => item.title.toLowerCase().includes(k))
      );
    }

    return items;
  } catch (err) {
    console.warn(`[RSS] Failed: ${source} (${url}) — ${err.message}`);
    return [];
  }
}

function dedup(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.title.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=1200, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });

  const { state, category = 'general' } = req.query;

  const feeds = state
    ? (STATE_FEEDS[state.toUpperCase()] || [])
    : (NATIONAL_FEEDS[category] || NATIONAL_FEEDS.general);

  if (!feeds.length) {
    return res.status(400).json({ error: `No feeds configured for state="${state}" category="${category}"` });
  }

  const results = await Promise.allSettled(feeds.map(fetchFeed));
  let allItems = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  if (!allItems.length && state) {
    console.warn(`[News] No keyword matches for state=${state}, falling back to national feed`);
    try {
      const fallback = await fetchFeed({ source: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss' });
      allItems = fallback;
    } catch { /* ignore */ }
  }

  if (!allItems.length) {
    return res.status(200).json({ items: [], source: 'empty' });
  }

  const items = dedup(allItems)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 20);

  return res.status(200).json({ items, source: state ? `state:${state}` : `national:${category}` });
}

module.exports = handler;
module.exports.default = handler;
