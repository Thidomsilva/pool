import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // no-op: revalidation should be triggered client-side with router.refresh()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  return res.status(204).end();
}
