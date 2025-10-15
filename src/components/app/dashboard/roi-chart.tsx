'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Pool } from '@/lib/definitions';
import { formatPercent } from '@/lib/utils';

export function RoiChart({ data }: { data: Pool[] }) {
  const chartData = data.map((pool) => ({
    name: pool.name,
    roi: pool.roi_pct,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI by Pool</CardTitle>
        <CardDescription>
          Return on investment from collected fees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ roi: { label: 'ROI', color: 'hsl(var(--primary))' } }}
          className="min-h-[150px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <XAxis
              dataKey="roi"
              type="number"
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent formatter={(value) => formatPercent(value as number)} />}
            />
            <Bar dataKey="roi" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
