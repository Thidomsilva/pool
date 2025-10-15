'use server';

import { revalidatePath } from 'next/cache';
import { savePool } from '@/lib/data';
import { z } from 'zod';

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
