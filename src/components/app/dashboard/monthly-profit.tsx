'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Info, Download, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';


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

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Info className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-medium w-40 text-center capitalize">{formattedDate}</span>
            <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/20 border border-muted/20">
            <p className="text-sm text-muted-foreground">Pools Montadas</p>
            <p className="font-bold text-xl mt-2">{poolsCount}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-muted/20">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Taxas Coletadas</p>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="font-bold text-xl mt-2">{formatCurrency(totalFees)}</p>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden">
          <div className={cn("w-full p-8 rounded-lg min-h-[180px]", isProfit ? "bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 text-white" : "bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white")}>
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm opacity-90">Lucro no Período</p>
                  <Info className="w-4 h-4 opacity-80" />
                </div>
                <p className="font-extrabold text-4xl lg:text-5xl leading-tight mt-3">{formatCurrency(totalProfitLoss)}</p>
              </div>

              <div className="text-right w-48">
                <p className="text-sm opacity-90">Rendimento</p>
                <p className={cn("font-bold text-3xl mt-2", isProfit ? "text-green-300" : "text-red-300")}>{formatPercent((totalProfitLoss !== 0 ? (totalProfitLoss / Math.max(1, totalFees)) * 100 : 0))}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
