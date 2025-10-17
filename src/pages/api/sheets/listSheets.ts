import type { NextApiRequest, NextApiResponse } from 'next';
import { getSheetsClient } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return res.status(400).json({ error: 'GOOGLE_SHEETS_ID not set' });

  const client = getSheetsClient();
  if (!client) return res.status(500).json({ error: 'Sheets client not initialized' });

  try {
    const meta = await client.spreadsheets.get({ spreadsheetId: sheetId });
    const sheets = (meta.data.sheets || []).map(s => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId,
      index: s.properties?.index,
    }));
    return res.status(200).json({ sheets });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
