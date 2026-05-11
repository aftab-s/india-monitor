export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache on Vercel CDN edge for 24 hours — all visitors share this cached response
  // so IndianAPI is only hit once per day regardless of how many users visit
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.INDIAN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'INDIAN_API_KEY not configured on server' });
  }

  const { fuel_type = 'petrol' } = req.query;
  if (!['petrol', 'diesel'].includes(fuel_type)) {
    return res.status(400).json({ error: 'Invalid fuel_type. Use petrol or diesel.' });
  }

  try {
    const upstream = await fetch(
      `https://fuel.indianapi.in/live_fuel_price?location_type=state&fuel_type=${fuel_type}`,
      {
        headers: { 'X-Api-Key': apiKey },
      }
    );

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(`[Fuel API] Upstream error ${upstream.status}:`, text);
      return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[Fuel API] Fetch failed:', err);
    return res.status(500).json({ error: 'Failed to fetch fuel prices' });
  }
}
