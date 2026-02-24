export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://edifyedu.in');
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

    if (!name || !phone || !program || !qualification) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const SHEET_URL = process.env.SHEET_URL;

    if (!SHEET_URL) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, program, qualification })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
