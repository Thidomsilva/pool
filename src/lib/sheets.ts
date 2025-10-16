import { google } from 'googleapis';

type SheetsClient = ReturnType<typeof google.sheets>;

function loadServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || null;
  const rawB64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 || null;

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON', e);
      return null;
    }
  }

  if (rawB64) {
    try {
      const decoded = Buffer.from(rawB64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e) {
      console.warn('Failed to decode/parse GOOGLE_SERVICE_ACCOUNT_KEY_B64', e);
      return null;
    }
  }

  return null;
}

let sheetsClient: SheetsClient | null = null;

export function getSheetsClient(): SheetsClient | null {
  if (sheetsClient) return sheetsClient;

  const key = loadServiceAccount();
  if (!key) {
    console.warn('Google service account key not found. Sheets client will not be initialized.');
    return null;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (e) {
    console.error('Failed to initialize Google Sheets client', e);
    return null;
  }
}

export type SheetPoolRow = {
  id: string;
  name: string;
  initial_usd: number;
  current_usd: number;
  total_fees_usd: number;
  status: string;
};

export async function readPoolsFromSheet(spreadsheetId: string, range = 'Pools!A:F'): Promise<SheetPoolRow[]> {
  const client = getSheetsClient();
  if (client) {
    try {
      const res = await client.spreadsheets.values.get({ spreadsheetId, range });
      const rows = res.data.values || [];
      // Expect header row: id, name, initial_usd, current_usd, total_fees_usd, status
      const out: SheetPoolRow[] = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        out.push({
          id: r[0] || `row-${i}`,
          name: r[1] || '',
          initial_usd: parseFloat(r[2] || '0') || 0,
          current_usd: parseFloat(r[3] || '0') || 0,
          total_fees_usd: parseFloat(r[4] || '0') || 0,
          status: r[5] || 'Ativa',
        });
      }
      return out;
    } catch (e) {
      console.error('Error reading sheet via API client', e);
      // fallthrough to public fetch
    }
  }

  // Fallback: try to read public CSV export (no credentials)
  try {
    const sheetName = range.split('!')[1] || 'Pools';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('Public sheet fetch failed with status', resp.status);
      return [];
    }
    const text = await resp.text();
    const rows = parseCsv(text);
    if (rows.length <= 1) return [];
    const headers = rows[0].map(h => String(h).trim().toLowerCase());
    const out: SheetPoolRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const get = (name: string) => {
        const idx = headers.indexOf(name);
        return idx >= 0 ? (r[idx] ?? '') : '';
      };
      out.push({
        id: get('id') || `row-${i}`,
        name: String(get('name') || ''),
        initial_usd: parseFloat(String(get('initial_usd') || '0')) || 0,
        current_usd: parseFloat(String(get('current_usd') || '0')) || 0,
        total_fees_usd: parseFloat(String(get('total_fees_usd') || '0')) || 0,
        status: String(get('status') || 'Ativa'),
      });
    }
    return out;
  } catch (e) {
    console.error('Error reading public sheet CSV', e);
    return [];
  }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let curField = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { curField += '"'; i++; }
        else { inQuotes = false; }
      } else {
        curField += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { cur.push(curField); curField = ''; }
      else if (ch === '\r') { continue; }
      else if (ch === '\n') { cur.push(curField); rows.push(cur); cur = []; curField = ''; }
      else { curField += ch; }
    }
  }
  // push last
  if (curField !== '' || cur.length > 0) { cur.push(curField); rows.push(cur); }
  return rows;
}

export async function appendPoolToSheet(spreadsheetId: string, pool: Partial<SheetPoolRow>) {
  const client = getSheetsClient();
  if (!client) throw new Error('Sheets client not initialized');

  const values = [[
    pool.id || '',
    pool.name || '',
    pool.initial_usd?.toString() || '0',
    pool.current_usd?.toString() || '0',
    pool.total_fees_usd?.toString() || '0',
    pool.status || 'Ativa'
  ]];

  try {
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: 'Pools!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return true;
  } catch (e) {
    console.error('Error appending to sheet', e);
    return false;
  }
}
