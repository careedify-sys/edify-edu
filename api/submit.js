export default async function handler(req, res) {
  // Allow CORS from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, program, qualification } = req.body;

    // Validate required fields
    if (!name || !phone || !program || !qualification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // SHEET_URL is stored safely in Vercel Environment Variables
    const SHEET_URL = process.env.SHEET_URL;

    if (!SHEET_URL) {
      console.error('SHEET_URL environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const response = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, program, qualification }),
      redirect: 'follow', // Important: Google Scripts redirect after POST
    });

    console.log('Sheet response status:', response.status);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
