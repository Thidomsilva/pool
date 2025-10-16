'use client';

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardsProps {
    activePoolsCount: number;
    totalValue: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
}

export default function MetricCards({ activePoolsCount, totalValue, totalProfitLoss, totalProfitLossPct }: MetricCardsProps) {
    const isProfit = totalProfitLoss >= 0;
    const isProfitPct = totalProfitLossPct >= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Pools Ativas</p>
                    <p className="text-2xl font-bold">{activePoolsCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Lucro Total</span>
                        <Info className="w-4 h-4"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className={cn("text-2xl font-bold", isProfit ? "text-green-600" : "text-red-600")}>{formatCurrency(totalProfitLoss)}</p>
                        {isProfit ? <TrendingUp className="w-5 h-5 text-green-600"/> : <TrendingDown className="w-5 h-5 text-red-600"/>}
                    </div>
                </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4">
                     <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Percentual de Lucro</span>
                        <Info className="w-4 h-4"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className={cn("text-2xl font-bold", isProfitPct ? "text-green-600" : "text-red-600")}>{formatPercent(totalProfitLossPct)}</p>
                         {isProfitPct ? <TrendingUp className="w-5 h-5 text-green-600"/> : <TrendingDown className="w-5 h-5 text-red-600"/>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
