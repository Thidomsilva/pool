'use server';

import type { ParsedPosition } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import { savePool as mockSavePool } from '@/lib/data';

// This is a simplified parser, you can enhance it with more complex regex or logic
function parseRawText(rawText: string): ParsedPosition {
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line);
    const data: Partial<ParsedPosition> = {};

    // Example parsing logic, this can be greatly improved
    const pairMatch = lines.find(l => l.includes('/'))?.match(/(\S+)\s*\/\s*(\S+)/);
    if(pairMatch) {
        data.pair_base = pairMatch[1];
        data.pair_quote = pairMatch[2];
    }
    
    // This is a very basic example. A real implementation would need more robust parsing.
    // For now, we'll just pass what we have.
    
    return {
        ...data,
        uncertainFields: [],
        captured_at: new Date().toISOString()
    } as ParsedPosition;
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


export async function savePoolAction(prevState: any, formData: FormData) {
    try {
        const data = JSON.parse(formData.get('data') as string);
        await mockSavePool(data);
        revalidatePath('/dashboard');
        return { success: true, message: 'Pool saved successfully!' };
    } catch (e) {
        return { success: false, message: 'Failed to save pool.' };
    }
}
