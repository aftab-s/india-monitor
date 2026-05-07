// Simple test endpoint to verify Vercel serverless functions work
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    message: 'Vercel serverless function is working!',
    timestamp: new Date().toISOString(),
    query: req.query,
    method: req.method
  });
}
