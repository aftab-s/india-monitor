// Vercel serverless proxy for Petrol Pumps API (ssrinnovationlab.com)
// This is a free, keyless API — the proxy exists for:
// 1. CORS bypass (the API doesn't return CORS headers)
// 2. CDN edge caching on Vercel (shared across all users)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache on Vercel CDN for 6 hours — pump data doesn't change often
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { city, company, fuel_type, limit = '10', page = '1' } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'city parameter is required' });
  }

  try {
    const params = new URLSearchParams({
      city,
      page,
      limit,
    });
    if (company) params.set('company', company);
    if (fuel_type) params.set('fuel_type', fuel_type);

    const upstream = await fetch(
      `https://api.ssrinnovationlab.com/api/petrol-pumps/pumps/by-city/?${params.toString()}`
    );

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(`[Petrol Pumps API] Upstream error ${upstream.status}:`, text);
      return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Petrol Pumps API] Fetch failed:', err);
    return res.status(500).json({ error: 'Failed to fetch petrol pump data' });
  }
}
