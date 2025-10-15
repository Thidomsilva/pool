'use client';

import { useState } from 'react';
import type { DashboardData, Pool } from '@/lib/definitions';
import {
  PlusCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import MonthlyProfit from './monthly-profit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PoolCard from './pool-card';

export default function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const router = useRouter();
  const { pools, summaryMetrics, monthlyPerformance } = initialData;
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNewPool = () => {
    router.push('/pools/new');
  };

  const activePools = pools.filter((pool) => pool.status === 'Ativa');
  const closedPools = pools.filter((pool) => pool.status === 'Fechada');

  const handleMonthChange = (amount: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + amount);
        return newDate;
    });
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);


  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={handleNewPool} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Pool
        </Button>
      </div>

      <MonthlyProfit 
        poolsCount={activePools.length}
        totalFees={summaryMetrics.totalFees}
        totalProfitLoss={summaryMetrics.totalProfitLoss}
        totalRoi={summaryMetrics.bestRoi.value}
      />

      <div>
        <h3 className="text-xl font-bold">Pools</h3>
        <Tabs defaultValue="active" className="mt-4">
          <TabsList>
            <TabsTrigger value="active">Pools Ativas ({activePools.length})</TabsTrigger>
            <TabsTrigger value="closed">Pools Fechadas ({closedPools.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4 space-y-4">
            {activePools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
             {activePools.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Nenhuma pool ativa encontrada.</p>
             )}
          </TabsContent>
          <TabsContent value="closed" className="mt-4 space-y-4">
            {closedPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
            {closedPools.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Nenhuma pool fechada encontrada.</p>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
