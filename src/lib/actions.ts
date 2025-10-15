'use server';

import { ai } from '@/ai/genkit';
import { parseAndHighlightUncertainFields, type ParsedPosition } from '@/ai/flows/highlight-uncertain-fields-in-preview';
import { revalidatePath } from 'next/cache';
import { savePool as mockSavePool } from '@/lib/data';

async function ocrWithGenAI(imageDataUri: string): Promise<string> {
    const model = ai.getModel('googleai/gemini-2.5-flash');
    const result = await model.generate({
        input: [
            { text: 'Extract all text content from the following image. Only return the extracted text, preserving line breaks and structure as much as possible.' },
            { media: { url: imageDataUri } }
        ]
    });
    const textPart = result.candidates[0].message.parts.find(p => !!p.text);
    return textPart?.text ?? '';
}

export async function processLpInput(prevState: any, formData: FormData): Promise<{data: ParsedPosition | null; error: string | null}> {
    const text = formData.get('text') as string;
    const imageFile = formData.get('image') as File;

    let rawText = '';

    try {
        if (text) {
            rawText = text;
        } else if (imageFile && imageFile.size > 0) {
            const imageBuffer = await imageFile.arrayBuffer();
            const imageBase64 = Buffer.from(imageBuffer).toString('base64');
            const imageDataUri = `data:${imageFile.type};base64,${imageBase64}`;
            rawText = await ocrWithGenAI(imageDataUri);

            if (!rawText) {
                return { data: null, error: 'Could not extract text from image. The image might be unclear or empty.' };
            }
        } else {
            return { data: null, error: 'No input provided. Please paste text or upload an image.' };
        }
        
        const parsedData = await parseAndHighlightUncertainFields({ rawText });
        return { data: parsedData, error: null };

    } catch (error) {
        console.error(error);
        return { data: null, error: 'An unexpected error occurred during processing. Please try again.'};
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
