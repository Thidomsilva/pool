'use client';

import type { DashboardData } from '@/lib/definitions';
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  ArrowDownUp,
  PlusCircle,
} from 'lucide-react';
import MetricCard from './metric-card';
import { PoolsTable } from './pools-table';
import { RoiChart } from './roi-chart';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PerformanceChart } from './performance-chart';
import { useRouter } from 'next/navigation';

export default function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const router = useRouter();
  const { summaryMetrics, pools, monthlyPerformance } = initialData;

  const handleNewPool = () => {
    router.push('/pools/new');
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={handleNewPool}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Pool
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Valor Total"
          value={formatCurrency(summaryMetrics.totalValue)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Valor atual de todas as posições"
        />
        <MetricCard
          title="Lucro / Prejuízo"
          value={formatCurrency(summaryMetrics.totalProfitLoss)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Lucro líquido incluindo taxas"
          valueClassName={summaryMetrics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MetricCard
          title="Total de Taxas"
          value={formatCurrency(summaryMetrics.totalFees)}
          icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
          description="Total de taxas ganhas em todas as pools"
        />
        <MetricCard
          title="Melhor ROI"
          value={formatPercent(summaryMetrics.bestRoi.value)}
          icon={<ArrowDownUp className="h-4 w-4 text-muted-foreground" />}
          description={summaryMetrics.bestRoi.name || 'N/A'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Pools Ativas</CardTitle>
            <CardDescription>
              Um resumo de suas posições de liquidez atuais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PoolsTable pools={pools} />
          </CardContent>
        </Card>
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
            <RoiChart data={pools} />
            <PerformanceChart data={monthlyPerformance} />
        </div>
      </div>
    </div>
  );
}
