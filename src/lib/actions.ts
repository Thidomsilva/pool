'use server';

import { revalidatePath } from 'next/cache';
import { savePool } from '@/lib/data';
import { z } from 'zod';

<<<<<<< HEAD
const FeeEventSchema = z.object({
    amount_usd: z.coerce.number().positive('O valor da taxa deve ser positivo.'),
    description: z.string().optional(),
    occurred_at: z.coerce.date(),
});


const FormSchema = z
  .object({
    name: z.string().min(1, { message: 'O nome da pool é obrigatório.' }),
    exchange: z.string().min(1, { message: 'A exchange é obrigatória.' }),
    network: z.string().min(1, { message: 'A rede é obrigatória.' }),
    entry_date: z.coerce.date({ required_error: 'A data de entrada é obrigatória.' }),
    exit_date: z.coerce.date().optional(),
    status: z.enum(['Ativa', 'Fechada']).default('Ativa'),
    tokens: z.array(
      z.object({
        symbol: z.string().min(1, 'O símbolo é obrigatório.'),
        qty: z.coerce.number().positive('A quantidade deve ser positiva.'),
        usd_value: z.coerce.number().positive('O valor deve ser positivo.'),
      })
    ).min(1, 'Pelo menos um token é obrigatório.'),
    initial_usd: z.coerce.number().positive('O valor inicial deve ser positivo.'),
    current_usd: z.coerce.number().nonnegative('O valor atual deve ser não-negativo.'),
    range_min: z.coerce.number().optional(),
    range_max: z.coerce.number().optional(),
    total_fees_usd: z.coerce.number().nonnegative('As taxas totais devem ser não-negativas.').default(0),
    fee_events: z.array(FeeEventSchema).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.status === 'Fechada') {
        return !!data.exit_date;
      }
      return true;
    },
    {
      message: 'A data de saída é obrigatória quando o status é "Fechada".',
      path: ['exit_date'],
    }
  );
=======
// This is a simplified parser, you can enhance it with more complex regex or logic
function parseRawText(rawText: string): ParsedPosition {
    // Normalização básica
    let t = rawText.replace(/\r/g, '\n');
    t = t.replace(/\n{2,}/g, '\n');
    t = t.replace(/mil/g, '000');
    t = t.replace(/,/g, '.');
    t = t.replace(/US\$/g, '');
    t = t.replace(/%/g, '');
    t = t.replace(/UNI/g, '');
    t = t.replace(/ETH/g, '');
    t = t.replace(/USDC/g, '');
    t = t.replace(/\s+/g, ' ');

    const grab = (re: RegExp) => (t.match(re)?.[1] ?? '').trim();
    const toNum = (str: string | undefined) => {
        if (!str) return undefined;
        const num = parseFloat(str);
        return isNaN(num) ? undefined : num;
    };

    const out: any = {};
    // Par de tokens
    const pairMatch = t.match(/([A-Z0-9]+)\s*\/\s*([A-Z0-9]+)/);
    if (pairMatch) {
        out.pair_base = pairMatch[1];
        out.pair_quote = pairMatch[2];
    }
    // Versão
    out.version = grab(/v(\d+)/) ? `v${grab(/v(\d+)/)}` : undefined;
    // Fee
    out.fee_bps = toNum(grab(/([0-9.]+)\s*$/m));
    // Rede
    out.network = grab(/(Arbitrum|Base|Ethereum|Optimism|Polygon|Unichain)/);
    // Dentro do intervalo
    out.in_range = /Dentro do intervalo/i.test(t);
    // APR recompensa
    out.reward_apr_pct = toNum(grab(/APR da recompensa de ([0-9.]+)/i));
    // Preço mínimo
    out.price_min = toNum(grab(/Preço mínimo\s*([0-9.]+)/i));
    // Preço máximo
    out.price_max = toNum(grab(/Preço máximo\s*([0-9.]+)/i));
    // Preço de mercado
    out.price_market = toNum(grab(/Preço de mercado\s*([0-9.]+)/i));
    // Tarifas recebidas
    out.fees_total_usd = toNum(grab(/Tarifas recebidas\s*([0-9.]+)/i));
    // APR total
    out.apr_total_pct = toNum(grab(/APR total\s*([0-9.]+)/i));
    // Rentabilidade anual do pool
    out.pool_apr_pct = toNum(grab(/Rentabilidade anual do pool\s*([0-9.]+)/i));
    // Valor da posição (se disponível)
    out.position_usd = toNum(grab(/Posição\s*([0-9.]+)/i));

    // Marcar campos não preenchidos como "uncertain"
    out.uncertainFields = Object.keys(out).filter(k => out[k] === undefined || out[k] === null);
    out.captured_at = new Date().toISOString();
    return out as ParsedPosition;
}
>>>>>>> acefa534c9bbbfe0f81d1da78714b4c22e3937c8


export async function savePoolAction(prevState: any, formData: FormData): Promise<{success: boolean; message: string}> {
    try {
        const rawData = JSON.parse(formData.get('data') as string);
        
        const validationResult = FormSchema.safeParse(rawData);
        
        if (!validationResult.success) {
            console.error(validationResult.error.flatten());
            return { success: false, message: "Verifique os erros no formulário." };
        }

        const poolData = validationResult.data;

        await savePool(poolData);

        revalidatePath('/dashboard');
        return { success: true, message: 'Pool salva com sucesso!' };
    } catch (e: any) {
        console.error(e);
        return { success: false, message: e.message || 'Falha ao salvar a pool.' };
    }
}
