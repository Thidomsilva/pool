"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

export function PerformanceChart({ data }: { data: { month: string; profit: number, fees: number }[] }) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
        <CardDescription>Profit and Fees Collected</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          profit: { label: "Profit", color: "hsl(var(--chart-1))" },
          fees: { label: "Fees", color: "hsl(var(--chart-2))" },
        }} className="min-h-[150px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
            />
            <Bar dataKey="profit" fill="var(--color-profit)" radius={4} />
            <Bar dataKey="fees" fill="var(--color-fees)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
