'use server';

import { revalidatePath } from 'next/cache';
import { savePool } from '@/lib/data';
import { z } from 'zod';

const FormSchema = z
  .object({
    name: z.string().min(1, { message: 'Pool Name is required.' }),
    exchange: z.string().min(1, { message: 'Exchange is required.' }),
    network: z.string().min(1, { message: 'Network is required.' }),
    entry_date: z.coerce.date({ required_error: 'Entry Date is required.' }),
    exit_date: z.coerce.date().optional(),
    status: z.enum(['Ativa', 'Fechada']).default('Ativa'),
    tokens: z.array(
      z.object({
        symbol: z.string().min(1, 'Symbol is required.'),
        qty: z.coerce.number().positive('Quantity must be positive.'),
        usd_value: z.coerce.number().positive('Value must be positive.'),
      })
    ).min(1, 'At least one token is required.'),
    initial_usd: z.coerce.number().positive('Initial Value must be positive.'),
    current_usd: z.coerce.number().nonnegative('Current Value must be non-negative.'),
    range_min: z.coerce.number().optional(),
    range_max: z.coerce.number().optional(),
    total_fees_usd: z.coerce.number().nonnegative('Total Fees must be non-negative.').default(0),
  })
  .refine(
    (data) => {
      if (data.status === 'Fechada') {
        return !!data.exit_date;
      }
      return true;
    },
    {
      message: 'Exit Date is required when status is "Fechada".',
      path: ['exit_date'],
    }
  );


export async function savePoolAction(prevState: any, formData: FormData): Promise<{success: boolean; message: string}> {
    try {
        const rawData = JSON.parse(formData.get('data') as string);
        
        const validationResult = FormSchema.safeParse(rawData);
        
        if (!validationResult.success) {
            return { success: false, message: validationResult.error.flatten().fieldErrors.toString() };
        }

        const poolData = validationResult.data;

        await savePool(poolData);

        revalidatePath('/dashboard');
        return { success: true, message: 'Pool saved successfully!' };
    } catch (e: any) {
        console.error(e);
        return { success: false, message: e.message || 'Failed to save pool.' };
    }
}
