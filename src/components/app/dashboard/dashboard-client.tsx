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
<<<<<<< HEAD
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-1 xl:col-span-1">
            <MetricCards 
                activePoolsCount={activePools.length}
                totalValue={summaryMetrics.totalValue}
                totalProfitLoss={summaryMetrics.totalProfitLoss}
                totalProfitLossPct={summaryMetrics.totalProfitLossPct}
            />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-1 xl:col-span-1">
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
=======
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>
>>>>>>> acefa534c9bbbfe0f81d1da78714b4c22e3937c8

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
        </div>
        <div className="lg:col-span-2 xl:col-span-1">
            <MonthlyProfit 
                poolsCount={activePools.length}
                totalFees={summaryMetrics.totalFees}
                totalProfitLoss={summaryMetrics.totalProfitLoss}
            />
        </div>
      </div>


        <div className="fixed bottom-6 right-6">
            <Button onClick={handleNewPool} size="lg" className="rounded-full w-16 h-16 shadow-lg">
                <PlusCircle className="h-8 w-8" />
                <span className="sr-only">Nova Pool</span>
            </Button>
        </div>
    </div>
  );
}
