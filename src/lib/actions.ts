'use server';

import { revalidatePath } from 'next/cache';
import { savePool as mockSavePool } from '@/lib/data';

// This is a simplified parser, you can enhance it with more complex regex or logic
function normalizeNumber(input: string | number | undefined | null): number {
    if (input === undefined || input === null) return 0;
    if (typeof input === 'number') return input;
    
    // Remove thousand separators, then replace comma with dot for decimal
    const normalized = input.replace(/\./g, '').replace(',', '.');
    const number = parseFloat(normalized);
    return isNaN(number) ? 0 : number;
}


export async function savePoolAction(prevState: any, formData: FormData): Promise<{success: boolean; message: string}> {
    try {
        const rawData = JSON.parse(formData.get('data') as string);

        // Here you would perform validation with Zod, but for now we trust the client-side validation
        // In a real app, always re-validate on the server.
        // const validationResult = FormSchema.safeParse(rawData);
        // if (!validationResult.success) {
        //     return { success: false, message: 'Invalid data.' };
        // }
        // const poolData = validationResult.data;
        
        // For now, let's just use the raw data and assume it's correct
        const poolData = rawData;

        // Normalize numbers from form
        const processedData = {
            ...poolData,
            initial_usd: normalizeNumber(poolData.initial_usd),
            current_usd: normalizeNumber(poolData.current_usd),
            range_min: normalizeNumber(poolData.range_min),
            range_max: normalizeNumber(poolData.range_max),
            total_fees_usd: normalizeNumber(poolData.total_fees_usd),
            tokens: poolData.tokens.map(token => ({
                ...token,
                qty: normalizeNumber(token.qty),
                usd_value: normalizeNumber(token.usd_value)
            }))
        };


        await mockSavePool(processedData);

        revalidatePath('/dashboard');
        return { success: true, message: 'Pool saved successfully!' };
    } catch (e: any) {
        console.error(e);
        return { success: false, message: e.message || 'Failed to save pool.' };
    }
}
