'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { savePoolAction } from '@/lib/actions';
import { useEffect } from 'react';
import { Loader2, Save, PlusCircle, Trash2, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const FormSchema = z
  .object({
    name: z.string().min(1, { message: 'Pool Name is required.' }),
    exchange: z.string().min(1, { message: 'Exchange is required.' }),
    network: z.string().min(1, { message: 'Network is required.' }),
    entry_date: z.date({ required_error: 'Entry Date is required.' }),
    exit_date: z.date().optional(),
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
  ).refine(data => {
    if (data.range_min !== undefined && data.range_max !== undefined && data.range_min > data.range_max) {
        // This is where we could auto-swap, but for validation, we'll just flag it.
        // The form can handle the user warning.
    }
    return true;
  });

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      Save Pool
    </Button>
  );
}

export function PoolForm() {
  const [state, formAction] = useActionState(savePoolAction, {
    success: false,
    message: '',
  });

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      exchange: 'Uniswap v4',
      network: 'Unichain',
      status: 'Ativa',
      tokens: [
        { symbol: '', qty: 0, usd_value: 0 },
        { symbol: '', qty: 0, usd_value: 0 },
      ],
      initial_usd: 0,
      current_usd: 0,
      total_fees_usd: 0,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tokens",
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Pool Saved!',
        description: 'Your new pool has been added to the dashboard.',
      });
      router.push('/dashboard');
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  const handleCalculateInitialValue = () => {
    const total = form.getValues('tokens').reduce((acc, token) => acc + (token.usd_value || 0), 0);
    form.setValue('initial_usd', total, { shouldValidate: true });
  }

  const watchStatus = form.watch('status');
  
  useEffect(() => {
    if(watchStatus === 'Ativa') {
        form.setValue('exit_date', undefined);
    }
  }, [watchStatus, form]);

  return (
    <Form {...form}>
      <form
        action={(formData) => {
          formData.append('data', JSON.stringify(form.getValues()));
          formAction(formData);
        }}
        className="space-y-8"
      >
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-lg font-medium">Identification</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pool Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ETH/USDC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="exchange"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Exchange</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an exchange" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Uniswap v3">Uniswap v3</SelectItem>
                            <SelectItem value="Uniswap v4">Uniswap v4</SelectItem>
                            <SelectItem value="Sushi">Sushi</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a network" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Unichain">Unichain</SelectItem>
                            <SelectItem value="Ethereum">Ethereum</SelectItem>
                            <SelectItem value="Base">Base</SelectItem>
                            <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                            <SelectItem value="Optimism">Optimism</SelectItem>
                             <SelectItem value="Polygon">Polygon</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Pool Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Ativa" />
                        </FormControl>
                        <FormLabel className="font-normal">Active</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Fechada" />
                        </FormControl>
                        <FormLabel className="font-normal">Closed</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="entry_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Entry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            { watchStatus === 'Fechada' && (
                 <FormField
                 control={form.control}
                 name="exit_date"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel>Exit Date</FormLabel>
                     <Popover>
                       <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant={'outline'}
                             className={cn(
                               'w-full pl-3 text-left font-normal',
                               !field.value && 'text-muted-foreground'
                             )}
                           >
                             {field.value ? (
                               format(field.value, 'PPP')
                             ) : (
                               <span>Pick a date</span>
                             )}
                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value}
                           onSelect={field.onChange}
                           disabled={(date) =>
                             date > new Date() || date < new Date('1900-01-01')
                           }
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Initial Tokens</h3>
            {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                <div className="md:col-span-2">
                    <FormField
                        control={form.control}
                        name={`tokens.${index}.symbol`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Token</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. ETH" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="md:col-span-2">
                    <FormField
                        control={form.control}
                        name={`tokens.${index}.qty`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="md:col-span-2">
                     <FormField
                        control={form.control}
                        name={`tokens.${index}.usd_value`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Value (USD)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    className="self-center mb-1"
                    >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            ))}
            <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ symbol: '', qty: 0, usd_value: 0 })}
            >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Token
            </Button>
        </div>


        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Pool Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="initial_usd"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Initial Total Value (USD)</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <Input type="number" placeholder="0.00" {...field} />
                                <Button type="button" variant="outline" size="icon" onClick={handleCalculateInitialValue} title="Calculate from tokens">
                                    <Calculator className="h-4 w-4" />
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="current_usd"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Current Total Value (USD)</FormLabel>
                        <FormControl>
                             <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                    control={form.control}
                    name="range_min"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Range Min</FormLabel>
                        <FormControl>
                             <Input type="number" placeholder="e.g. 3800.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="range_max"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Range Max</FormLabel>
                        <FormControl>
                             <Input type="number" placeholder="e.g. 4367.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
        
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Pool Fees</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="total_fees_usd"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Fees Collected (USD)</FormLabel>
                        <FormControl>
                             <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>


        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </Form>
  );
}
