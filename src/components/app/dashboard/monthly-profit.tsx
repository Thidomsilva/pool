'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Info, Download, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonthlyProfitProps {
    poolsCount: number;
    totalFees: number;
    totalProfitLoss: number;
    totalRoi: number;
}

export default function MonthlyProfit({ poolsCount, totalFees, totalProfitLoss, totalRoi }: MonthlyProfitProps) {
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
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
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

        <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <p className="text-sm text-muted-foreground">Pools Montadas</p>
            <p className="font-bold text-lg">{poolsCount}</p>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Taxas Coletadas</span>
                <Info className="w-3 h-3"/>
            </div>
            <p className="font-bold text-lg">{formatCurrency(totalFees)}</p>
        </div>
        <div className={cn("p-3 rounded-lg space-y-1", isProfit ? "bg-green-100/50" : "bg-red-100/50")}>
             <div className="flex items-center justify-between text-sm", isProfit ? "text-green-800/80" : "text-red-800/80" >
                <span>Lucro no Período</span>
                <Info className="w-3 h-3"/>
            </div>
             <p className={cn("font-bold text-lg", isProfit ? "text-green-700" : "text-red-700")}>{formatCurrency(totalProfitLoss)}</p>
             <div className="flex items-center justify-between text-sm", isProfit ? "text-green-800/80" : "text-red-800/80" >
                <span>Rendimento</span>
                <Info className="w-3 h-3"/>
            </div>
            <div className={cn("flex items-center gap-1 font-semibold", isProfit ? "text-green-700" : "text-red-700")}>
                {isProfit ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                <span>{formatPercent(totalRoi === -Infinity ? 0 : totalRoi)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
