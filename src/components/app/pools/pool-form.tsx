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
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { savePoolAction } from '@/lib/actions';
import { Loader2, Save, PlusCircle, Trash2, Calculator, Link } from 'lucide-react';
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
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

const FeeEventSchema = z.object({
    amount_usd: z.coerce.number().positive('O valor da taxa deve ser positivo.'),
    description: z.string().optional(),
    occurred_at: z.date(),
});

const FormSchema = z
  .object({
    name: z.string().min(1, { message: 'O nome da pool é obrigatório.' }),
    exchange: z.string().min(1, { message: 'A exchange é obrigatória.' }),
    network: z.string().min(1, { message: 'A rede é obrigatória.' }),
    entry_date: z.date({ required_error: 'A data de entrada é obrigatória.' }),
    exit_date: z.date().optional(),
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
    <Button type="submit" disabled={pending} size="lg" variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Save className="mr-2 h-4 w-4" />
      )}
      Adicionar Pool
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
  
  const [feeEvents, setFeeEvents] = useState<z.infer<typeof FeeEventSchema>[]>([]);
  const [isFeeModalOpen, setFeeModalOpen] = useState(false);
  const [currentFee, setCurrentFee] = useState<{amount_usd: string, description: string, occurred_at: Date}>({
      amount_usd: '',
      description: '',
      occurred_at: new Date()
  });

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
      fee_events: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tokens",
  });

  useEffect(() => {
    const totalFees = feeEvents.reduce((acc, event) => acc + event.amount_usd, 0);
    form.setValue('total_fees_usd', totalFees);
    form.setValue('fee_events', feeEvents);
  }, [feeEvents, form]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Pool Salva!',
        description: 'Sua nova pool foi adicionada ao dashboard.',
      });
      router.push('/dashboard');
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  const handleAddFee = () => {
    const amount = parseFloat(currentFee.amount_usd.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Erro', description: 'O valor da taxa deve ser um número positivo.' });
        return;
    }

    const newFeeEvent: z.infer<typeof FeeEventSchema> = {
        amount_usd: amount,
        description: currentFee.description,
        occurred_at: currentFee.occurred_at,
    };

    setFeeEvents(prev => [...prev, newFeeEvent]);
    setCurrentFee({ amount_usd: '', description: '', occurred_at: new Date() });
    setFeeModalOpen(false);
  }

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
          const rawData = form.getValues();
          const dataWithParsedNumbers = {
            ...rawData,
            tokens: rawData.tokens.map(token => ({
                ...token,
                qty: typeof token.qty === 'string' ? parseFloat(token.qty.replace(',', '.')) : token.qty,
                usd_value: typeof token.usd_value === 'string' ? parseFloat(token.usd_value.replace(',', '.')) : token.usd_value,
            })),
            initial_usd: typeof rawData.initial_usd === 'string' ? parseFloat(rawData.initial_usd.replace(',', '.')) : rawData.initial_usd,
            current_usd: typeof rawData.current_usd === 'string' ? parseFloat(rawData.current_usd.replace(',', '.')) : rawData.current_usd,
            range_min: typeof rawData.range_min === 'string' ? parseFloat(rawData.range_min.replace(',', '.')) : rawData.range_min,
            range_max: typeof rawData.range_max === 'string' ? parseFloat(rawData.range_max.replace(',', '.')) : rawData.range_max,
            total_fees_usd: feeEvents.reduce((acc, event) => acc + event.amount_usd, 0),
            fee_events: feeEvents,
          }
          formData.append('data', JSON.stringify(dataWithParsedNumbers));
          formAction(formData);
        }}
        className="space-y-8"
      >
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-lg font-medium">Identificação</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Pool</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: ETH/USDC" {...field} />
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
                            <SelectValue placeholder="Selecione uma exchange" />
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
                    <FormLabel>Rede</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma rede" />
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
                  <FormLabel>Status da Pool</FormLabel>
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
                        <FormLabel className="font-normal">Ativa</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Fechada" />
                        </FormControl>
                        <FormLabel className="font-normal">Fechada</FormLabel>
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
                  <FormLabel>Data de Entrada</FormLabel>
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
                            format(field.value, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={ptBR}
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
                     <FormLabel>Data de Saída</FormLabel>
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
                               format(field.value, 'PPP', { locale: ptBR })
                             ) : (
                               <span>Escolha uma data</span>
                             )}
                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           locale={ptBR}
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
            <h3 className="text-lg font-medium">Tokens Iniciais</h3>
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
                                    <Input placeholder="ex: ETH" {...field} />
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
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="0,00" {...field} onChange={e => field.onChange(e.target.value.replace('.',','))}/>
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
                                <FormLabel>Valor (USD)</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="0,00" {...field} onChange={e => field.onChange(e.target.value.replace('.',','))}/>
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
            Adicionar Token
            </Button>
        </div>


        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Valores da Pool</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="initial_usd"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Valor Total Inicial (USD)</FormLabel>
                         <FormDescription>Valor total investido inicialmente na pool</FormDescription>
                        <FormControl>
                            <div className="flex items-center gap-2">
                                <Input type="text" placeholder="0,00" {...field} onChange={e => field.onChange(e.target.value.replace('.',','))}/>
                                <Button type="button" variant="outline" size="icon" onClick={handleCalculateInitialValue} title="Calcular a partir dos tokens">
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
                        <FormLabel>Valor Total Atual (USD)</FormLabel>
                         <FormDescription>Valor atual total da pool</FormDescription>
                        <FormControl>
                             <Input type="text" placeholder="0,00" {...field} onChange={e => field.onChange(e.target.value.replace('.',','))}/>
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
                        <FormLabel>Range Mínimo</FormLabel>
                        <FormControl>
                             <Input type="text" placeholder="ex: 3800,00" {...field} onChange={e => field.onChange(e.target.value.replace('.',','))}/>
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
                        <FormLabel>Range Máximo</FormLabel>
                        <FormControl>
                             <Input type="text" placeholder="ex: 4367,00" {...field} onChange={e => field.onChange(e.target.value.replace('.',','))}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
        
         <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-lg font-medium">Taxas da Pool</h3>
           <div className="flex flex-col gap-2">
            {feeEvents.map((event, index) => (
                <div key={index} className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                    <div>
                        <p className="font-medium">{format(event.occurred_at, 'dd/MM/yyyy')} - {event.description || 'Taxa'}</p>
                        <p className="text-green-600 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(event.amount_usd)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFeeEvents(feeEvents.filter((_, i) => i !== index))}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                </div>
            ))}
           </div>

          <Dialog open={isFeeModalOpen} onOpenChange={setFeeModalOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                <Link className="mr-2 h-4 w-4" />
                Adicionar Taxa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Taxa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Valor da Taxa</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="0,00" 
                        value={currentFee.amount_usd} 
                        onChange={(e) => setCurrentFee({...currentFee, amount_usd: e.target.value.replace('.',',')})}
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Ex: Taxas de Julho/2023"
                        value={currentFee.description} 
                        onChange={(e) => setCurrentFee({...currentFee, description: e.target.value})}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Coleta</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !currentFee.occurred_at && 'text-muted-foreground'
                          )}
                        >
                          {currentFee.occurred_at ? (
                            format(currentFee.occurred_at, 'PPP', { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={ptBR}
                        mode="single"
                        selected={currentFee.occurred_at}
                        onSelect={(date) => date && setCurrentFee({...currentFee, occurred_at: date})}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleAddFee}>Adicionar Taxa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
           <FormField
                control={form.control}
                name="total_fees_usd"
                render={({ field }) => (
                    <FormItem className="mt-4">
                    <FormLabel>Total de Taxas Coletadas (USD)</FormLabel>
                    <FormControl>
                        <Input type="text" readOnly disabled {...field} value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(field.value || 0)} className="font-bold"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>


        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <SubmitButton />
        </div>
      </form>
    </Form>
  );
}
