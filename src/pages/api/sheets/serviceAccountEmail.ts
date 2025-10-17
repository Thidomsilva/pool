import type { NextApiRequest, NextApiResponse } from 'next';

function loadKeyFromEnv() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || null;
  const rawB64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 || null;
  if (raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  if (rawB64) {
    try { return JSON.parse(Buffer.from(rawB64, 'base64').toString('utf8')); } catch { return null; }
  }
  return null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = loadKeyFromEnv();
  if (!key) return res.status(404).json({ error: 'Service account key not configured in env' });
  if (!key.client_email) return res.status(500).json({ error: 'service account missing client_email' });
  return res.status(200).json({ client_email: key.client_email });
}
