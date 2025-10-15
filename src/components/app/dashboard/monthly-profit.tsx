'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Info, Download, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface MonthlyProfitProps {
    poolsCount: number;
    totalFees: number;
    totalProfitLoss: number;
}

export default function MonthlyProfit({ poolsCount, totalFees, totalProfitLoss }: MonthlyProfitProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleMonthChange = (amount: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + amount);
        return newDate;
    });
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

  const isProfit = totalProfitLoss >= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-bold text-md">Rentabilidade Mensal</h3>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Info className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="h-7 w-7"><ChevronLeft className="w-4 h-4" /></Button>
                <span className="text-sm font-medium w-32 text-center capitalize">{formattedDate}</span>
                <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="h-7 w-7"><ChevronRight className="w-4 h-4" /></Button>
            </div>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="border-none">
            <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-sm text-muted-foreground">Pools Montadas</p>
                    <p className="font-bold text-lg">{poolsCount}</p>
                </div>
                 <AccordionTrigger className="p-0">
                    <div className="h-10 w-10 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                        <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                    </div>
                </AccordionTrigger>
            </div>
            
            <AccordionContent>
                 <div className="mt-2 space-y-2">
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Taxas Coletadas</span>
                            <Info className="w-3 h-3"/>
                        </div>
                        <p className="font-bold text-lg">{formatCurrency(totalFees)}</p>
                    </div>
                    <div className={cn("p-3 rounded-lg space-y-1", isProfit ? "bg-green-100/50" : "bg-red-100/50")}>
                        <div className={cn("flex items-center justify-between text-sm", isProfit ? "text-green-800/80" : "text-red-800/80")} >
                            <span>Lucro no Período</span>
                            <Info className="w-3 h-3"/>
                        </div>
                        <p className={cn("font-bold text-lg", isProfit ? "text-green-700" : "text-red-700")}>{formatCurrency(totalProfitLoss)}</p>
                    </div>
                 </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
