import type { NextApiRequest, NextApiResponse } from 'next';
import { readPoolsFromSheet } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return res.status(400).json({ error: 'GOOGLE_SHEETS_ID not set' });

  try {
    const pools = await readPoolsFromSheet(sheetId);
    res.status(200).json({ data: pools });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
