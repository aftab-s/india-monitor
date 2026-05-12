// Vercel serverless proxy for OpenStreetMap Overpass API
// This is a free, keyless API — the proxy exists for:
// 1. CORS bypass (though Overpass usually supports it, keeping pattern consistent)
// 2. CDN edge caching on Vercel (shared across all users)
// 3. Simplifying the query for the frontend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache on Vercel CDN for 12 hours — EV station locations don't change often
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
    query = `
      [out:json][timeout:15];
      (
        node["amenity"="charging_station"](around:20000,${lat},${lng});
        way["amenity"="charging_station"](around:20000,${lat},${lng});
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

  try {
    const endpoint = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    const upstream = await fetch(endpoint);

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(`[EV API] Upstream error ${upstream.status}:`, text);
      return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
    }

    const data = await upstream.json();
    
    // Process the data to make it simpler for the frontend
    const results = data.elements
      .filter(el => el.tags && el.tags.amenity === 'charging_station')
      .map(el => {
        const stationLat = el.lat || (el.center && el.center.lat);
        const stationLng = el.lon || (el.center && el.center.lon);
        
        // Build address
        let addressParts = [];
        if (el.tags['addr:street']) addressParts.push(el.tags['addr:street']);
        if (el.tags['addr:suburb']) addressParts.push(el.tags['addr:suburb']);
        if (el.tags['addr:neighbourhood']) addressParts.push(el.tags['addr:neighbourhood']);
        if (el.tags['addr:city']) addressParts.push(el.tags['addr:city']);
        
        const address = el.tags['addr:full'] || (addressParts.length > 0 ? addressParts.join(', ') : `${city} Region`);

        return {
          id: el.id,
          name: el.tags.name || 'EV Charging Station',
          operator: el.tags.operator || 'Unknown Operator',
          network: el.tags.network || el.tags.brand || 'Unknown Network',
          capacity: el.tags.capacity || 'N/A',
          socket: el.tags['socket:type2'] ? 'Type 2' : (el.tags.socket ? el.tags.socket : 'Standard'),
          lat: stationLat,
          lng: stationLng,
          address: address,
          direction_link: stationLat && stationLng ? `https://www.google.com/maps/dir/?api=1&destination=${stationLat},${stationLng}` : null
        };
      });

    return res.status(200).json({
      count: results.length,
      results: results
    });
  } catch (err) {
    console.error('[EV API] Fetch failed:', err);
    return res.status(500).json({ error: 'Failed to fetch EV station data' });
  }
}
