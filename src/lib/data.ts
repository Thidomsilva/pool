import type { DashboardData, Pool, PoolSnapshot } from './definitions';
import { differenceInDays, format, parseISO } from 'date-fns';

const MOCK_POOLS: Pool[] = [
  {
    id: '1',
    name: 'ETH / USDC',
    pair_base: 'ETH',
    pair_quote: 'USDC',
    network: 'Unichain',
    version: 'v4',
    fee_bps: 0.05,
    initial_usd: 1500.50,
    created_at: '2023-10-01T10:00:00Z',
    snapshots: [
      {
        captured_at: '2023-10-01T10:00:00Z',
        position_usd: 1500.50,
        fees_total_usd: 0,
        in_range: true,
        price_min: 3800.89,
        price_max: 4367.66,
        price_market: 4001.35,
        apr_total_pct: 30.1,
      },
      {
        captured_at: '2023-11-15T12:00:00Z',
        position_usd: 1550.75,
        fees_total_usd: 25.3,
        in_range: true,
        price_min: 3800.89,
        price_max: 4367.66,
        price_market: 4100.0,
        apr_total_pct: 32.73,
      },
    ],
  } as Pool,
    {
    id: '2',
    name: 'WBTC / ETH',
    pair_base: 'WBTC',
    pair_quote: 'ETH',
    network: 'Arbitrum',
    version: 'v4',
    fee_bps: 0.3,
    initial_usd: 5000,
    created_at: '2023-09-15T09:00:00Z',
    snapshots: [
      {
        captured_at: '2023-09-15T09:00:00Z',
        position_usd: 5000,
        fees_total_usd: 0,
        in_range: true,
        price_min: 15.5,
        price_max: 17.8,
        price_market: 16.2,
        apr_total_pct: 18.5,
      },
      {
        captured_at: '2023-11-20T14:00:00Z',
        position_usd: 4850.25,
        fees_total_usd: 150.8,
        in_range: false,
        price_min: 15.5,
        price_max: 17.8,
        price_market: 18.1,
        apr_total_pct: 15.2,
      },
    ],
  } as Pool,
];

function calculatePoolMetrics(pool: Pool): Pool {
    const sortedSnapshots = pool.snapshots.sort((a, b) => new Date(b.captured_at as string).getTime() - new Date(a.captured_at as string).getTime());
    const latestSnapshot = sortedSnapshots[0];
    const initialSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
    
    const initial_usd = initialSnapshot.position_usd ?? 0;
    const current_usd = latestSnapshot.position_usd ?? 0;
    const total_fees_usd = latestSnapshot.fees_total_usd ?? 0;
    const profit_loss_usd = (current_usd + total_fees_usd) - initial_usd;
    const profit_loss_pct = initial_usd > 0 ? (profit_loss_usd / initial_usd) * 100 : 0;
    const roi_pct = initial_usd > 0 ? (total_fees_usd / initial_usd) * 100 : 0;
    const duration_days = differenceInDays(new Date(), parseISO(pool.created_at));
    const status = latestSnapshot.in_range ? 'active' : 'closed';
    const in_range = latestSnapshot.in_range ?? false;
    
    return {
        ...pool,
        initial_usd,
        current_usd,
        total_fees_usd,
        profit_loss_usd,
        profit_loss_pct,
        roi_pct,
        duration_days,
        status,
        in_range
    };
}


export async function getDashboardData(): Promise<DashboardData> {
  // In a real app, this would fetch from a database.
  // Here we're using mock data.
  const processedPools = MOCK_POOLS.map(calculatePoolMetrics);

  const summaryMetrics = processedPools.reduce(
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

  // Mock monthly performance
  const monthlyPerformance = [
    { month: 'Aug 2023', profit: -200, fees: 50 },
    { month: 'Sep 2023', profit: 500, fees: 150 },
    { month: 'Oct 2023', profit: 300, fees: 120 },
    { month: 'Nov 2023', profit: 750, fees: 250 },
  ];

  return {
    pools: processedPools,
    summaryMetrics,
    monthlyPerformance,
  };
}

export async function getPools(): Promise<Pool[]> {
    return MOCK_POOLS.map(calculatePoolMetrics);
}

// In a real app, these would be API calls
export async function savePool(poolData: any) {
    console.log("Saving new pool:", poolData);
    const newId = (MOCK_POOLS.length + 1).toString();
    const newPool: Pool = {
        id: newId,
        name: `${poolData.pair_base} / ${poolData.pair_quote}`,
        pair_base: poolData.pair_base,
        pair_quote: poolData.pair_quote,
        network: poolData.network,
        version: poolData.version,
        fee_bps: poolData.fee_bps,
        initial_usd: poolData.position_usd,
        created_at: new Date().toISOString(),
        snapshots: [{ ...poolData, id: 's1', pool_id: newId }],
    } as Pool;
    MOCK_POOLS.push(newPool);
    return newPool;
}
