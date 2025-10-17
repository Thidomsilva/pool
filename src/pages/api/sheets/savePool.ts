import type { NextApiRequest, NextApiResponse } from 'next';
import { appendPoolToSheet } from '@/lib/sheets';
import { db } from '@/firebase/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return res.status(400).json({ error: 'GOOGLE_SHEETS_ID not set' });

  const pool = req.body;
  try {
    const ok = await appendPoolToSheet(sheetId, pool);

    // Also attempt to write to Firestore if initialized so dashboard (which may read Firestore)
    // stays in sync with the sheet.
    if (db) {
      try {
        const now = Timestamp.now();
        const doc = {
          name: pool.name,
          exchange: pool.exchange || 'Sheets',
          network: pool.network || 'Unknown',
          status: pool.status || 'Ativa',
          entry_date: pool.entry_date ? Timestamp.fromDate(new Date(pool.entry_date)) : now,
          exit_date: pool.exit_date ? Timestamp.fromDate(new Date(pool.exit_date)) : null,
          initial_usd: pool.initial_usd || 0,
          current_usd: pool.current_usd || 0,
          range_min: pool.range_min || null,
          range_max: pool.range_max || null,
          total_fees_usd: pool.total_fees_usd || 0,
          created_at: now,
          tokens: pool.tokens || [],
          fee_events: (pool.fee_events || []).map((e: any) => ({ ...e, occurred_at: e.occurred_at ? Timestamp.fromDate(new Date(e.occurred_at)) : now })),
        };
        await addDoc(collection(db, 'pools'), doc as any);
      } catch (err) {
        console.warn('Failed to write to Firestore after appending to sheet', err);
      }
    }

    if (ok) return res.status(200).json({ success: true });
    return res.status(500).json({ success: false });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
