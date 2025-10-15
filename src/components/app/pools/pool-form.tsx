'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ParsedPosition } from '@/lib/definitions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormState, useFormStatus } from 'react-dom';
import { savePoolAction } from '@/lib/actions';
import { useEffect } from 'react';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const FormSchema = z.object({
  pair_base: z.string().optional(),
  pair_quote: z.string().optional(),
  version: z.string().optional(),
  fee_bps: z.coerce.number().optional(),
  network: z.string().optional(),
  in_range: z.boolean().optional(),
  reward_apr_pct: z.coerce.number().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  price_market: z.coerce.number().optional(),
  position_usd: z.coerce.number().optional(),
  weight_tokenA_pct: z.coerce.number().optional(),
  weight_tokenB_pct: z.coerce.number().optional(),
  amount_tokenA_usd: z.coerce.number().optional(),
  amount_tokenA: z.coerce.number().optional(),
  amount_tokenB_usd: z.coerce.number().optional(),
  amount_tokenB: z.coerce.number().optional(),
  fees_total_usd: z.coerce.number().optional(),
  fees_tokenA_usd: z.coerce.number().optional(),
  fees_tokenB_usd: z.coerce.number().optional(),
  apr_total_pct: z.coerce.number().optional(),
  pool_apr_pct: z.coerce.number().optional(),
  captured_at: z.string().optional(),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      Save Pool
    </Button>
  );
}

const FormInput = ({ name, label, control, uncertainFields, placeholder, type = "text" }: { name: keyof ParsedPosition; label: string; control: any; uncertainFields?: string[], placeholder?: string; type?: string }) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
            <Input 
                placeholder={placeholder || `Enter ${label}`}
                {...field}
                value={field.value ?? ''}
                className={cn(uncertainFields?.includes(name) && 'ring-2 ring-offset-2 ring-yellow-400')}
                type={type}
            />
            </FormControl>
            <FormMessage />
        </FormItem>
        )}
    />
);


export function PoolForm({
  parsedData,
  onReset,
  onSaved,
}: {
  parsedData: ParsedPosition;
  onReset: () => void;
  onSaved: () => void;
}) {
  const [state, formAction] = useFormState(savePoolAction, {
    success: false,
    message: '',
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { ...parsedData, in_range: parsedData.in_range ?? false },
  });

  useEffect(() => {
    if (state.success) {
      onSaved();
    }
  }, [state, onSaved]);

  const { uncertainFields } = parsedData;

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="data" value={JSON.stringify(form.getValues())} />

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Pool Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput name="pair_base" label="Base Token" control={form.control} uncertainFields={uncertainFields} />
                <FormInput name="pair_quote" label="Quote Token" control={form.control} uncertainFields={uncertainFields} />
                <FormInput name="network" label="Network" control={form.control} uncertainFields={uncertainFields} />
                <FormInput name="version" label="Version" control={form.control} uncertainFields={uncertainFields} />
                <FormInput name="fee_bps" label="Fee (BPS)" control={form.control} uncertainFields={uncertainFields} type="number" />
                <FormField
                    control={form.control}
                    name="in_range"
                    render={({ field }) => (
                        <FormItem className="flex flex-col rounded-md border p-3">
                            <FormLabel>In Range</FormLabel>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Price Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput name="price_min" label="Min Price" control={form.control} uncertainFields={uncertainFields} type="number" />
                <FormInput name="price_max" label="Max Price" control={form.control} uncertainFields={uncertainFields} type="number" />
                <FormInput name="price_market" label="Market Price" control={form.control} uncertainFields={uncertainFields} type="number" />
            </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Position Value</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput name="position_usd" label="Total Value (USD)" control={form.control} uncertainFields={uncertainFields} type="number" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput name="amount_tokenA" label={`Amount (${parsedData.pair_base || 'Token A'})`} control={form.control} uncertainFields={uncertainFields} type="number" />
                <FormInput name="amount_tokenB" label={`Amount (${parsedData.pair_quote || 'Token B'})`} control={form.control} uncertainFields={uncertainFields} type="number" />
            </div>
        </div>
        
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Fees & APR</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput name="fees_total_usd" label="Total Fees (USD)" control={form.control} uncertainFields={uncertainFields} type="number" />
                <FormInput name="apr_total_pct" label="Total APR (%)" control={form.control} uncertainFields={uncertainFields} type="number" />
                <FormInput name="reward_apr_pct" label="Reward APR (%)" control={form.control} uncertainFields={uncertainFields} type="number" />
            </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Parse Again
          </Button>
          <SubmitButton />
        </div>
      </form>
    </Form>
  );
}
