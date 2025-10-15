'use server';

/**
 * @fileOverview Extracts and normalizes data from a Uniswap LP position image or text.
 *
 * - extractLPDataFromImageOrText - A function that handles the data extraction process.
 * - ExtractLPDataInput - The input type for the extractLPDataFromImageOrText function.
 * - ExtractLPDataOutput - The return type for the extractLPDataFromImageOrText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLPDataInputSchema = z.object({
  input: z.string().describe('A screenshot (as a data URI) or text of a Uniswap LP position.'),
});
export type ExtractLPDataInput = z.infer<typeof ExtractLPDataInputSchema>;

const ExtractLPDataOutputSchema = z.object({
  pair_base: z.string().optional().describe('The base token of the LP pair.'),
  pair_quote: z.string().optional().describe('The quote token of the LP pair.'),
  version: z.string().optional().describe('The Uniswap version.'),
  fee_bps: z.number().optional().describe('The fee tier in basis points.'),
  network: z.string().optional().describe('The network the LP is on.'),
  in_range: z.boolean().optional().describe('Whether the position is in range.'),
  reward_apr_pct: z.number().optional().describe('The APR of the reward token.'),
  price_min: z.number().optional().describe('The minimum price of the range.'),
  price_max: z.number().optional().describe('The maximum price of the range.'),
  price_market: z.number().optional().describe('The current market price.'),
  position_usd: z.number().optional().describe('The total value of the position in USD.'),
  weight_tokenA_pct: z.number().optional().describe('The weight of token A in the position.'),
  weight_tokenB_pct: z.number().optional().describe('The weight of token B in the position.'),
  amount_tokenA_usd: z.number().optional().describe('The amount of token A in USD.'),
  amount_tokenA: z.number().optional().describe('The amount of token A.'),
  amount_tokenB_usd: z.number().optional().describe('The amount of token B in USD.'),
  amount_tokenB: z.number().optional().describe('The amount of token B.'),
  fees_total_usd: z.number().optional().describe('The total fees earned in USD.'),
  fees_tokenA_usd: z.number().optional().describe('The fees earned in token A USD.'),
  fees_tokenB_usd: z.number().optional().describe('The fees earned in token B USD.'),
  apr_total_pct: z.number().optional().describe('The total APR of the position.'),
  pool_apr_pct: z.number().optional().describe('The APR of the pool.'),
  captured_at: z.string().optional().describe('The timestamp of when the data was captured.'),
});
export type ExtractLPDataOutput = z.infer<typeof ExtractLPDataOutputSchema>;

export async function extractLPDataFromImageOrText(input: ExtractLPDataInput): Promise<ExtractLPDataOutput> {
  return extractLPDataFromImageOrTextFlow(input);
}

const extractLPDataFromImageOrTextPrompt = ai.definePrompt({
  name: 'extractLPDataFromImageOrTextPrompt',
  input: {schema: ExtractLPDataInputSchema},
  output: {schema: ExtractLPDataOutputSchema},
  prompt: `You are an expert in extracting data from Uniswap LP position screenshots or text.

  Extract the following fields from the input:
  - pair_base: The base token of the LP pair.
  - pair_quote: The quote token of the LP pair.
  - version: The Uniswap version.
  - fee_bps: The fee tier in basis points.
  - network: The network the LP is on.
  - in_range: Whether the position is in range.
  - reward_apr_pct: The APR of the reward token.
  - price_min: The minimum price of the range.
  - price_max: The maximum price of the range.
  - price_market: The current market price.
  - position_usd: The total value of the position in USD.
  - weight_tokenA_pct: The weight of token A in the position.
  - weight_tokenB_pct: The weight of token B in the position.
  - amount_tokenA_usd: The amount of token A in USD.
  - amount_tokenA: The amount of token A.
  - amount_tokenB_usd: The amount of token B in USD.
  - amount_tokenB: The amount of token B.
  - fees_total_usd: The total fees earned in USD.
  - fees_tokenA_usd: The fees earned in token A USD.
  - fees_tokenB_usd: The fees earned in token B USD.
  - apr_total_pct: The total APR of the position.
  - pool_apr_pct: The APR of the pool.
  - captured_at: The timestamp of when the data was captured.

  Here is the input:
  {{input}}

  Make sure to convert all numbers to floats.  Return the data as a JSON object.
`,
});

const extractLPDataFromImageOrTextFlow = ai.defineFlow(
  {
    name: 'extractLPDataFromImageOrTextFlow',
    inputSchema: ExtractLPDataInputSchema,
    outputSchema: ExtractLPDataOutputSchema,
  },
  async input => {
    const {output} = await extractLPDataFromImageOrTextPrompt(input);
    return output!;
  }
);
