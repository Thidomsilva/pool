'use server';

import { getDashboardData } from '@/lib/data';
import DashboardClient from '@/components/app/dashboard/dashboard-client';

export default async function DashboardPage() {
  const dashboardData = await getDashboardData();

  return <DashboardClient initialData={dashboardData} />;
}
