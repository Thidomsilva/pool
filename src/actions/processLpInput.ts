'use server';

import type { ParsedPosition } from '@/lib/definitions';

// Arquivo removido para evitar conflito de server action duplicada. Utilize apenas /src/app/actions/processLpInput.ts
function parseRawText(rawText: string): ParsedPosition {
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
    const pairMatch = t.match(/([A-Z0-9]+)\s*\/\s*([A-Z0-9]+)/);
    if (pairMatch) {
        out.pair_base = pairMatch[1];
        out.pair_quote = pairMatch[2];
    }
    out.version = grab(/v(\d+)/) ? `v${grab(/v(\d+)/)}` : undefined;
    out.fee_bps = toNum(grab(/([0-9.]+)\s*$/m));
    out.network = grab(/(Arbitrum|Base|Ethereum|Optimism|Polygon|Unichain)/);
    out.in_range = /Dentro do intervalo/i.test(t);
    out.reward_apr_pct = toNum(grab(/APR da recompensa de ([0-9.]+)/i));
    out.price_min = toNum(grab(/Preço mínimo\s*([0-9.]+)/i));
    out.price_max = toNum(grab(/Preço máximo\s*([0-9.]+)/i));
    out.price_market = toNum(grab(/Preço de mercado\s*([0-9.]+)/i));
    out.fees_total_usd = toNum(grab(/Tarifas recebidas\s*([0-9.]+)/i));
    out.apr_total_pct = toNum(grab(/APR total\s*([0-9.]+)/i));
    out.pool_apr_pct = toNum(grab(/Rentabilidade anual do pool\s*([0-9.]+)/i));
    out.position_usd = toNum(grab(/Posição\s*([0-9.]+)/i));

    out.uncertainFields = Object.keys(out).filter(k => out[k] === undefined || out[k] === null);
    out.captured_at = new Date().toISOString();
    return out as ParsedPosition;
}

export async function processLpInput(prevState: any, formData: FormData): Promise<{data: ParsedPosition | null; error: string | null}> {
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File;

    let rawText = '';

    try {
        if (text) {
            rawText = text;
        } else if (imageFile && imageFile.size > 0) {
           return { data: null, error: 'A extração de imagem foi desativada. Por favor, cole o texto manualmente.' };
        } else {
            return { data: null, error: 'Nenhuma entrada fornecida. Por favor, cole o texto.' };
        }
        const parsedData = parseRawText(rawText);
        parsedData.uncertainFields = Object.keys(parsedData).filter(k => !parsedData[k]);
        return { data: parsedData, error: null };
    } catch (error) {
        console.error(error);
        return { data: null, error: 'Ocorreu um erro inesperado durante o processamento. Por favor, tente novamente.'};
    }
}
