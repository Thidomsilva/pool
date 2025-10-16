import type { NextApiRequest, NextApiResponse } from 'next';
import { appendPoolToSheet } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return res.status(400).json({ error: 'GOOGLE_SHEETS_ID not set' });

  const pool = req.body;
  try {
    const ok = await appendPoolToSheet(sheetId, pool);
    if (ok) return res.status(200).json({ success: true });
    return res.status(500).json({ success: false });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
