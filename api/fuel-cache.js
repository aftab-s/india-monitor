import { list } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { blobs } = await list();
    const cacheBlob = blobs.find(b => b.pathname === 'fuel-prices.json');

    if (!cacheBlob) {
      return res.status(404).json({ error: 'Fuel-prices cache not found in Blob storage' });
    }

    const response = await fetch(cacheBlob.url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blob content: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Fuel Cache API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
