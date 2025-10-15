'use client';

import type { DashboardData } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import MonthlyProfit from './monthly-profit';
import { PlusCircle, Trophy, TrendingUp, Gem } from 'lucide-react';
import MetricCards from './metric-cards';
import HighlightCard from './highlight-card';

export default function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const router = useRouter();
  const { pools, summaryMetrics, monthlyPerformance, bestPool, highestRoiPool, highestFeesPool } = initialData;

  const handleNewPool = () => {
    router.push('/pools/new');
  };

  const activePools = pools.filter((pool) => pool.status === 'Ativa');

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <MetricCards 
            activePoolsCount={activePools.length}
            totalValue={summaryMetrics.totalValue}
            totalProfitLoss={summaryMetrics.totalProfitLoss}
            totalProfitLossPct={summaryMetrics.totalProfitLossPct}
        />

        {bestPool && (
            <HighlightCard 
                pool={bestPool}
                title="Melhor Pool"
                icon={<Trophy className="w-5 h-5 text-yellow-500"/>}
                metricLabel="Rendimento"
                metricValue={bestPool.profit_loss_pct}
                variant="yellow"
            />
        )}

        {highestRoiPool && (
            <HighlightCard 
                pool={highestRoiPool}
                title="Maior ROI"
                icon={<TrendingUp className="w-5 h-5 text-purple-500"/>}
                metricLabel="ROI"
                metricValue={highestRoiPool.roi_pct}
                variant="purple"
            />
        )}

        {highestFeesPool && (
             <HighlightCard 
                pool={highestFeesPool}
                title="Maiores Taxas"
                icon={<Gem className="w-5 h-5 text-blue-500"/>}
                metricLabel="Taxas Coletadas"
                metricValue={highestFeesPool.total_fees_usd}
                variant="blue"
                isCurrency
            />
        )}
        
        <MonthlyProfit 
            poolsCount={activePools.length}
            totalFees={summaryMetrics.totalFees}
            totalProfitLoss={summaryMetrics.totalProfitLoss}
        />

        <div className="fixed bottom-6 right-6">
            <Button onClick={handleNewPool} size="lg" className="rounded-full w-16 h-16 shadow-lg">
                <PlusCircle className="h-8 w-8" />
                <span className="sr-only">Nova Pool</span>
            </Button>
        </div>
    </div>
  );
}
