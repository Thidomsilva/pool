'use server';
/**
 * @fileOverview This file defines a Genkit flow for parsing Uniswap LP position data from text or image, and highlighting fields with low confidence scores.
 *
 * - parseAndHighlightUncertainFields - A function that parses the input and highlights uncertain fields.
 * - ParsedPosition - The output type for the parsed position data.
 * - ParseAndHighlightUncertainFieldsInput - The input type for the parseAndHighlightUncertainFields function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParsedPositionSchema = z.object({
  pair_base: z.string().optional().describe('The base token of the trading pair.'),
  pair_quote: z.string().optional().describe('The quote token of the trading pair.'),
  version: z.string().optional().describe('The Uniswap version.'),
  fee_bps: z.number().optional().describe('The fee tier in basis points.'),
  network: z.string().optional().describe('The network the pool is deployed on.'),
  in_range: z.boolean().optional().describe('Whether the position is within the price range.'),
  reward_apr_pct: z.number().optional().describe('The APR of the reward token.'),
  price_min: z.number().optional().describe('The minimum price of the range.'),
  price_max: z.number().optional().describe('The maximum price of the range.'),
  price_market: z.number().optional().describe('The current market price.'),
  position_usd: z.number().optional().describe('The total value of the position in USD.'),
  weight_tokenA_pct: z.number().optional().describe('The percentage weight of token A.'),
  weight_tokenB_pct: z.number().optional().describe('The percentage weight of token B.'),
  amount_tokenA_usd: z.number().optional().describe('The amount of token A in USD.'),
  amount_tokenA: z.number().optional().describe('The amount of token A.'),
  amount_tokenB_usd: z.number().optional().describe('The amount of token B in USD.'),
  amount_tokenB: z.number().optional().describe('The amount of token B.'),
  fees_total_usd: z.number().optional().describe('The total fees collected in USD.'),
  fees_tokenA_usd: z.number().optional().describe('The fees collected in token A in USD.'),
  fees_tokenB_usd: z.number().optional().describe('The fees collected in token B in USD.'),
  apr_total_pct: z.number().optional().describe('The total APR.'),
  pool_apr_pct: z.number().optional().describe('The pool APR.'),
  captured_at: z.string().optional().describe('The timestamp of when the data was captured.'),
  confidence: z.number().optional().describe('The confidence score of the extracted data.'),
  uncertainFields: z.array(z.string()).optional().describe('Fields with low confidence scores that should be highlighted.'),
});
export type ParsedPosition = z.infer<typeof ParsedPositionSchema>;

const ParseAndHighlightUncertainFieldsInputSchema = z.object({
  rawText: z.string().describe('The raw text extracted from the Uniswap LP position.'),
});
export type ParseAndHighlightUncertainFieldsInput = z.infer<typeof ParseAndHighlightUncertainFieldsInputSchema>;

async function normalize(raw: string): Promise<string> {
  let t = raw;
    // limpa quebras, troca vírgula por ponto, remove US$, %, UNI, etc.
    t = t.replace(/\s+/g, ' '); // remove múltiplos espaços/linhas;
    t = t.replace(/\n\n/g, '\n'); // substitui \n\n por \n;
    t = t.replace(/mil/g, '000'); // mil → 000;
    t = t.replace(/,/g, '.'); // troca ,→. (somente na parte numérica);
    t = t.replace(/US\$/g, ''); // remove símbolos: US$, %, UNI, ETH, USDC quando forem sufixos.
    t = t.replace(/%/g, '');
    t = t.replace(/UNI/g, '');
    t = t.replace(/ETH/g, '');
    t = t.replace(/USDC/g, '');
  return t;
}

function toNum(str: string | undefined): number | undefined {
  if (!str) {
    return undefined;
  }
  const num = parseFloat(str);
  return isNaN(num) ? undefined : num;
}

function computeConfidence(parsedData: any): number {
    let validFields = 0;
    let totalFields = 0;

    for (const key in parsedData) {
        if (parsedData.hasOwnProperty(key)) {
            totalFields++;
            if (parsedData[key] !== undefined && parsedData[key] !== null) {
                validFields++;
            }
        }
    }

    return totalFields > 0 ? validFields / totalFields : 0;
}

export async function parseAndHighlightUncertainFields(input: ParseAndHighlightUncertainFieldsInput): Promise<ParsedPosition> {
  return parseAndHighlightUncertainFieldsFlow(input);
}

const parseAndHighlightUncertainFieldsFlow = ai.defineFlow(
  {
    name: 'parseAndHighlightUncertainFieldsFlow',
    inputSchema: ParseAndHighlightUncertainFieldsInputSchema,
    outputSchema: ParsedPositionSchema,
  },
  async input => {
    const { rawText } = input;

    async function parse(raw: string): Promise<ParsedPosition> {
      const t = await normalize(raw); // limpa quebras, troca vírgula por ponto, remove US$, %, UNI, etc.
      const grab = (re: RegExp) => (t.match(re)?.[1] ?? '').trim();

      const out: any = {};
      out.pair_base = grab(/^([A-Z0-9]+)\s*\/\s*([A-Z0-9]+)/m) || undefined;
      out.pair_quote = grab(/^([A-Z0-9]+)\s*\/\s*([A-Z0-9]+)/m) || undefined;
      out.version = grab(/^v(\d+)/m) ? `v${grab(/^v(\d+)/m)}` : undefined;
      out.fee_bps = toNum(grab(/^([0-9.]+)\%$/m));
      out.network = grab(/^(Arbitrum|Base|Ethereum|Optimism|Polygon|Unichain)/m);
      out.in_range = /Dentro do intervalo/i.test(t);

      out.reward_apr_pct = toNum(grab(/APR da recompensa de ([0-9.]+)\%/i));
      out.price_min = toNum(grab(/Preço mínimo\s+([0-9.]+)/i));
      out.price_max = toNum(grab(/Preço máximo\s+([0-9.]+)/i));
      out.price_market = toNum(grab(/Preço de mercado\s+([0-9.]+)/i));
      out.position_usd = toNum(grab(/Posição\s+([0-9.]+)\s*US\$/i));

      const weights = t.match(/([0-9.]+)\%\s*\n\s*([0-9.]+)\%/m);
      if (weights) { out.weight_tokenA_pct = toNum(weights[1]); out.weight_tokenB_pct = toNum(weights[2]); }

      const a = t.match(/([0-9.]+)\s*US\$\s*[\r\n ]+([0-9<>.]+)\s*ETH/i);
      if (a) { out.amount_tokenA_usd = toNum(a[1]); out.amount_tokenA = toNum(a[2]); }

      const b = t.match(/([0-9.]+)\s*US\$\s*[\r\n ]+([0-9.]+)\s*USDC/i);
      if (b) { out.amount_tokenB_usd = toNum(b[1]); out.amount_tokenB = toNum(b[2]); }

      out.fees_total_usd = toNum(grab(/Tarifas recebidas\s+([0-9.]+)\s*US\$/i));
      out.fees_tokenA_usd = toNum(grab(/Tarifas[\s\S]*?([0-9.]+)\s*US\$\s*[\r\n ]+<?0?.?[0-9]*\s*ETH/i));
      out.fees_tokenB_usd = toNum(grab(/Tarifas[\s\S]*?([0-9.]+)\s*US\$\s*[\r\n ]+[0-9.]+\s*USDC/i));

      out.apr_total_pct = toNum(grab(/APR total\s+([0-9.]+)\%/i));
      out.pool_apr_pct = toNum(grab(/Rentabilidade anual do pool\s+([0-9.]+)\%/i));

      out.captured_at = new Date().toISOString();
      out.confidence = computeConfidence(out);

      return out as ParsedPosition;
    }

    const parsedPosition = await parse(rawText);
    const uncertainFields: string[] = [];
    const confidenceThreshold = 0.7; // Define a threshold for considering a field uncertain

    for (const key in parsedPosition) {
      if (parsedPosition.hasOwnProperty(key) && typeof parsedPosition[key] !== 'undefined' && parsedPosition[key] !== null) {
        // Add more specific checks if needed, e.g., check if a string is empty
      } else {
          if (key !== 'uncertainFields' && key !== 'confidence' && key !== 'captured_at') {
              uncertainFields.push(key);
          }
      }
    }

    parsedPosition.uncertainFields = uncertainFields;

    return parsedPosition;
  }
);
