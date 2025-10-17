'use server';

import { db } from '@/firebase/server';
import type { DashboardData, Pool, PoolForm, PoolSnapshot } from './definitions';
import { differenceInDays } from 'date-fns';
import { collection, addDoc, getDocs, Timestamp, query, orderBy, DocumentData } from 'firebase/firestore';

function docToPool(doc: DocumentData): Pool {
    const data = doc.data();
    const pool: Pool = {
        id: doc.id,
        ...data,
        entry_date: data.entry_date,
        exit_date: data.exit_date,
        created_at: data.created_at,
        snapshots: data.snapshots || [],
        fee_events: data.fee_events || [],
    } as Pool;
    return calculatePoolMetrics(pool);
}

function calculatePoolMetrics(pool: Pool): Pool {
    const initial_usd = pool.initial_usd;
    const current_usd = pool.current_usd;
    const total_fees_usd = pool.total_fees_usd;

    const profit_loss_usd = (current_usd + total_fees_usd) - initial_usd;
    const profit_loss_pct = initial_usd > 0 ? (profit_loss_usd / initial_usd) * 100 : 0;
    const roi_pct = initial_usd > 0 ? (total_fees_usd / initial_usd) * 100 : 0;

    const endDate = pool.exit_date ? (pool.exit_date as Timestamp).toDate() : new Date();
    const entryDate = (pool.entry_date as Timestamp).toDate();
    const duration_days = differenceInDays(endDate, entryDate);
    
    // This is a simplistic check. Real logic may differ.
    // A better check would be if current price is between range_min and range_max
    const in_range = pool.status === 'Ativa'; 
    
    return {
        ...pool,
        profit_loss_usd,
        profit_loss_pct,
        roi_pct,
        duration_days,
        in_range,
        resultado: profit_loss_usd
    };
}

export async function getDashboardData(): Promise<DashboardData> {
  const pools = await getPools();

  let bestPool: Pool | undefined = undefined;
  let highestRoiPool: Pool | undefined = undefined;
  let highestFeesPool: Pool | undefined = undefined;

  const summaryMetrics = pools.reduce(
    (acc, pool) => {
      acc.totalValue += pool.current_usd;
      acc.totalProfitLoss += pool.profit_loss_usd;
      acc.totalFees += pool.total_fees_usd;
      
      if (!bestPool || pool.profit_loss_pct > bestPool.profit_loss_pct) {
        bestPool = pool;
      }
      if (!highestRoiPool || pool.roi_pct > highestRoiPool.roi_pct) {
        highestRoiPool = pool;
      }
      if (!highestFeesPool || pool.total_fees_usd > highestFeesPool.total_fees_usd) {
        highestFeesPool = pool;
      }

      return acc;
    },
    { totalValue: 0, totalProfitLoss: 0, totalFees: 0 }
  );

  const totalInitialValue = pools.reduce((acc, p) => acc + p.initial_usd, 0);
  const totalProfitLossPct = totalInitialValue > 0 ? (summaryMetrics.totalProfitLoss / totalInitialValue) * 100 : 0;


  const monthlyPerformance = [
    { month: 'Aug 2023', profit: 0, fees: 0 },
    { month: 'Sep 2023', profit: 0, fees: 0 },
    { month: 'Oct 2023', profit: 0, fees: 0 },
    { month: 'Nov 2023', profit: 0, fees: 0 },
  ];

  return {
    pools,
    summaryMetrics: {
        ...summaryMetrics,
        totalProfitLossPct,
        bestRoi: { name: 'Deprecated', value: 0} // to be removed
    },
    monthlyPerformance,
    bestPool,
    highestRoiPool,
    highestFeesPool
  };
}

export async function getPools(): Promise<Pool[]> {
  if (!db) {
    // Try Google Sheets fallback
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (sheetId) {
      try {
        const { readPoolsFromSheet } = await import('./sheets');
        const rows = await readPoolsFromSheet(sheetId);
        // Convert Sheet rows to Pool shape (minimal)
        const pools: Pool[] = rows.map(r => ({
          id: r.id,
          name: r.name,
          exchange: 'Sheets',
          network: 'Unknown',
          status: r.status || 'Ativa',
          entry_date: Timestamp.now(),
          exit_date: null,
          created_at: Timestamp.now(),
          tokens: [],
          initial_usd: r.initial_usd || 0,
          current_usd: r.current_usd || 0,
          total_fees_usd: r.total_fees_usd || 0,
          fee_events: [],
          snapshots: [],
        } as Pool));
        // docToPool expects a Firestore Document with .data(); for sheet-derived plain objects
        // call calculatePoolMetrics directly to compute derived fields.
        return pools.map(p => calculatePoolMetrics(p));
      } catch (e) {
        console.warn("Sheets fallback failed:", e);
        return [];
      }
    }

    console.warn("Firestore is not initialized. Returning empty array.");
    return [];
  }
  const poolsCol = collection(db, 'pools');
  const q = query(poolsCol, orderBy('created_at', 'desc'));
  const poolSnapshot = await getDocs(q);
  const poolList = poolSnapshot.docs.map(doc => docToPool(doc));
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
        tokens: poolData.tokens, 
        fee_events: poolData.fee_events.map(e => ({...e, occurred_at: Timestamp.fromDate(new Date(e.occurred_at))}))
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
