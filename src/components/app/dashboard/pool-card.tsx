'use client';

import type { Pool } from '@/lib/definitions';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown, PiggyBank, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PoolCard({ pool }: { pool: Pool }) {
  return (
    <Card className={cn("relative overflow-hidden", pool.profit_loss_usd >= 0 ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500")}>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg">{pool.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={pool.in_range ? 'default' : 'destructive'} className={cn(pool.in_range ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600', 'text-white')}>
                {pool.status}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {pool.duration_days} {pool.duration_days === 1 ? 'dia' : 'dias'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{pool.network}</p>
            <p className="text-sm text-muted-foreground">{pool.exchange}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">$ Inicial</p>
            <p className="font-bold text-base">{formatCurrency(pool.initial_usd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Atual <Pencil className='w-3 h-3 text-muted-foreground/50' />
            </p>
            <p className="font-bold text-base">{formatCurrency(pool.current_usd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <PiggyBank className="w-4 h-4" /> Taxas
            </p>
            <p className="font-bold text-base">{formatCurrency(pool.total_fees_usd)}</p>
          </div>
          <div className="space-y-1">
             <p className="text-muted-foreground">Resultado</p>
            <p className={cn('font-bold text-base', pool.profit_loss_usd >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatCurrency(pool.profit_loss_usd)}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center">
            <Badge variant="outline" className={cn(pool.roi_pct >= 0 ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700', 'font-semibold')}>
                ROI: {formatPercent(pool.roi_pct)}
            </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
