import type { NextApiRequest, NextApiResponse } from 'next';
import { updatePoolInSheet } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return res.status(400).json({ error: 'GOOGLE_SHEETS_ID not set' });

  const { id, updates } = req.body || {};
  if (!id || !updates) return res.status(400).json({ error: 'Missing id or updates' });

  try {
    const ok = await updatePoolInSheet(sheetId, id, updates);
    if (ok) return res.status(200).json({ success: true });
    return res.status(500).json({ success: false, error: 'Failed to update row' });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
