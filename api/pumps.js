// Vercel serverless proxy for OpenStreetMap Overpass API (Petrol Pumps)
// This is a free, keyless API — the proxy exists for:
// 1. CORS bypass
// 2. CDN edge caching on Vercel (shared across all users)
// 3. Simplifying the query for the frontend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache on Vercel CDN for 12 hours — pump locations don't change often
  res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { city, lat, lng } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'city parameter is required' });
  }

  // Construct Overpass QL query
  let query;
  if (lat && lng) {
    // 20km radius search (fast, prevents timeouts)
    query = `
      [out:json][timeout:15];
      (
        node["amenity"="fuel"](around:20000,${lat},${lng});
        way["amenity"="fuel"](around:20000,${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;
  } else {
    // Fallback area search (slower)
    query = `
      [out:json][timeout:25];
      area["name"="${city}"]->.searchArea;
      (
        node["amenity"="fuel"](area.searchArea);
        way["amenity"="fuel"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `;
  }

  try {
    const endpoint = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    const upstream = await fetch(endpoint);

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(`[Pumps API] Upstream error ${upstream.status}:`, text);
      return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
    }

    const data = await upstream.json();
    
    // Process the data
    const results = data.elements
      .filter(el => el.tags && el.tags.amenity === 'fuel')
      .map(el => {
        const stationLat = el.lat || (el.center && el.center.lat);
        const stationLng = el.lon || (el.center && el.center.lon);
        
        // Extract brand/company
        let company = 'Unknown';
        const brand = el.tags.brand || el.tags.operator || '';
        const brandLower = brand.toLowerCase();
        
        if (brandLower.includes('iocl') || brandLower.includes('indian oil')) company = 'IOCL';
        else if (brandLower.includes('hpcl') || brandLower.includes('hindustan petroleum')) company = 'HPCL';
        else if (brandLower.includes('bpcl') || brandLower.includes('bharat petroleum')) company = 'BPCL';
        else if (brandLower.includes('shell')) company = 'Shell';
        else if (brandLower.includes('jio') || brandLower.includes('reliance')) company = 'Jio-bp';
        else if (brandLower.includes('nayara')) company = 'Nayara';
        
        // Build address
        let addressParts = [];
        if (el.tags['addr:street']) addressParts.push(el.tags['addr:street']);
        if (el.tags['addr:suburb']) addressParts.push(el.tags['addr:suburb']);
        if (el.tags['addr:neighbourhood']) addressParts.push(el.tags['addr:neighbourhood']);
        if (el.tags['addr:city']) addressParts.push(el.tags['addr:city']);
        
        const address = el.tags['addr:full'] || (addressParts.length > 0 ? addressParts.join(', ') : `${city} Region`);

        return {
          id: el.id,
          name: el.tags.name || 'Petrol Pump',
          pump_name: el.tags.name || 'Petrol Pump',
          company: company,
          address: address,
          station_timing: el.tags.opening_hours || 'N/A',
          lat: stationLat,
          lng: stationLng,
          direction_link: stationLat && stationLng ? `https://www.google.com/maps/dir/?api=1&destination=${stationLat},${stationLng}` : null
        };
      });

    return res.status(200).json({
      count: results.length,
      results: results
    });
  } catch (err) {
    console.error('[Pumps API] Fetch failed:', err);
    return res.status(500).json({ error: 'Failed to fetch petrol pump data' });
  }
}
