'use server';

import { db } from '@/firebase/server';
import type { DashboardData, Pool, PoolForm, PoolSnapshot } from './definitions';
import { differenceInDays, parseISO } from 'date-fns';
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';

function calculatePoolMetrics(pool: Pool): Pool {
    const initial_usd = pool.initial_usd;
    const current_usd = pool.current_usd;
    const total_fees_usd = pool.total_fees_usd;

    const profit_loss_usd = (current_usd + total_fees_usd) - initial_usd;
    const profit_loss_pct = initial_usd > 0 ? (profit_loss_usd / initial_usd) * 100 : 0;
    const roi_pct = initial_usd > 0 ? (total_fees_usd / initial_usd) * 100 : 0;

    const endDate = pool.exit_date ? parseISO(pool.exit_date.toString()) : new Date();
    const duration_days = differenceInDays(endDate, parseISO(pool.entry_date.toString()));
    
    const in_range = pool.status === 'Ativa';
    
    return {
        ...pool,
        profit_loss_usd,
        profit_loss_pct,
        roi_pct,
        duration_days,
        in_range
    };
}

export async function getDashboardData(): Promise<DashboardData> {
  const pools = await getPools();

  const summaryMetrics = pools.reduce(
    (acc, pool) => {
      acc.totalValue += pool.current_usd;
      acc.totalProfitLoss += pool.profit_loss_usd;
      acc.totalFees += pool.total_fees_usd;
      if (pool.roi_pct > acc.bestRoi.value) {
        acc.bestRoi = { name: pool.name, value: pool.roi_pct };
      }
      return acc;
    },
    { totalValue: 0, totalProfitLoss: 0, bestRoi: { name: '', value: -Infinity }, totalFees: 0 }
  );

  // Mock monthly performance until we have snapshots
  const monthlyPerformance = [
    { month: 'Aug 2023', profit: 0, fees: 0 },
    { month: 'Sep 2023', profit: 0, fees: 0 },
    { month: 'Oct 2023', profit: 0, fees: 0 },
    { month: 'Nov 2023', profit: 0, fees: 0 },
  ];

  return {
    pools,
    summaryMetrics,
    monthlyPerformance,
  };
}

export async function getPools(): Promise<Pool[]> {
    if (!db) {
        console.warn("Firestore is not initialized. Returning empty array.");
        return [];
    }
    const poolsCol = collection(db, 'pools');
    const q = query(poolsCol, orderBy('created_at', 'desc'));
    const poolSnapshot = await getDocs(q);
    const poolList = poolSnapshot.docs.map(doc => {
        const data = doc.data();
        const pool: Pool = {
            id: doc.id,
            ...data,
            entry_date: (data.entry_date as Timestamp).toDate(),
            exit_date: data.exit_date ? (data.exit_date as Timestamp).toDate() : undefined,
            created_at: (data.created_at as Timestamp).toDate(),
            snapshots: data.snapshots || [],
        } as Pool;
        return calculatePoolMetrics(pool);
    });
    return poolList;
}


export async function savePool(poolData: PoolForm) {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    console.log("Saving new pool to Firestore:", poolData);
    
    const now = Timestamp.now();

    const newPoolDoc = {
        name: poolData.name,
        exchange: poolData.exchange,
        network: poolData.network,
        status: poolData.status,
        entry_date: Timestamp.fromDate(new Date(poolData.entry_date)),
        exit_date: poolData.exit_date ? Timestamp.fromDate(new Date(poolData.exit_date)) : null,
        initial_usd: poolData.initial_usd,
        current_usd: poolData.current_usd,
        range_min: poolData.range_min,
        range_max: poolData.range_max,
        total_fees_usd: poolData.total_fees_usd,
        created_at: now,
        // In a real app, pool_tokens would be saved to a separate subcollection.
        tokens: poolData.tokens, 
    };

    const docRef = await addDoc(collection(db, 'pools'), newPoolDoc);
    
    const initialSnapshot: PoolSnapshot = {
        captured_at: now,
        position_usd: poolData.current_usd,
        fees_total_usd: poolData.total_fees_usd,
        in_range: poolData.status === 'Ativa',
        price_min: poolData.range_min,
        price_max: poolData.range_max,
    };

    // Add snapshot to a subcollection
    await addDoc(collection(db, 'pools', docRef.id, 'snapshots'), initialSnapshot);

    return { id: docRef.id, ...newPoolDoc };
}
