'use client';

import type { DashboardData } from '@/lib/definitions';
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  ArrowDownUp,
  Download,
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

export default function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const { summaryMetrics, pools, monthlyPerformance } = initialData;

  const handleExport = () => {
    const headers = [
      'ID',
      'Name',
      'Network',
      'Version',
      'Fee (BPS)',
      'Status',
      'In Range',
      'Initial Value (USD)',
      'Current Value (USD)',
      'Total Fees (USD)',
      'Profit/Loss (USD)',
      'Profit/Loss (%)',
      'ROI (%)',
      'Duration (Days)',
      'Created At',
    ];
    const rows = pools.map((pool) =>
      [
        pool.id,
        pool.name,
        pool.network,
        pool.version,
        pool.fee_bps,
        pool.status,
        pool.in_range,
        pool.initial_usd,
        pool.current_usd,
        pool.total_fees_usd,
        pool.profit_loss_usd,
        pool.profit_loss_pct.toFixed(2),
        pool.roi_pct.toFixed(2),
        pool.duration_days,
        pool.created_at,
      ].join(',')
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pool_parser_pro_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Value"
          value={formatCurrency(summaryMetrics.totalValue)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Current value of all positions"
        />
        <MetricCard
          title="Profit / Loss"
          value={formatCurrency(summaryMetrics.totalProfitLoss)}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Net profit including fees"
          valueClassName={summaryMetrics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MetricCard
          title="Total Fees Collected"
          value={formatCurrency(summaryMetrics.totalFees)}
          icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
          description="Total fees earned across all pools"
        />
        <MetricCard
          title="Best ROI"
          value={formatPercent(summaryMetrics.bestRoi.value)}
          icon={<ArrowDownUp className="h-4 w-4 text-muted-foreground" />}
          description={summaryMetrics.bestRoi.name}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Active Pools</CardTitle>
            <CardDescription>
              A summary of your current liquidity positions.
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
