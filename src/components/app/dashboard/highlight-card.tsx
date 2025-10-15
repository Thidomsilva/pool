'use client';

import type { Pool } from '@/lib/definitions';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Info, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HighlightCardProps {
  pool: Pool;
  title: string;
  icon: React.ReactNode;
  metricLabel: string;
  metricValue: number;
  variant: 'yellow' | 'purple' | 'blue';
  isCurrency?: boolean;
}

export default function HighlightCard({ pool, title, icon, metricLabel, metricValue, variant, isCurrency = false }: HighlightCardProps) {
  const isPositive = metricValue >= 0;

  const variantClasses = {
    yellow: 'border-l-yellow-400',
    purple: 'border-l-purple-400',
    blue: 'border-l-blue-400',
  };
  
  const metricColorClasses = {
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      blue: 'text-blue-600',
  }

  const negativeColorClass = 'text-red-600';


  return (
    <Card className={cn("relative overflow-hidden border-l-4", variantClasses[variant])}>
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div>
            <p className="font-bold text-md">{pool.name}</p>
            <p className="text-xs text-muted-foreground">{pool.exchange} &bull; {pool.network}</p>
        </div>

        <div className="flex items-center gap-2">
            <p className={cn('font-bold text-md', isPositive ? metricColorClasses[variant] : negativeColorClass)}>
                {isCurrency ? formatCurrency(metricValue) : formatPercent(metricValue)}
            </p>
            <p className="text-xs text-muted-foreground">{metricLabel}</p>
        </div>

      </CardContent>
    </Card>
  );
}
