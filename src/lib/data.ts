import type { DashboardData, Pool, PoolSnapshot } from './definitions';
import { differenceInDays, format, parseISO } from 'date-fns';

const MOCK_POOLS: Pool[] = [
  {
    id: '1',
    name: 'ETH / USDC',
    exchange: 'Uniswap v4',
    network: 'Unichain',
    status: 'Ativa',
    entry_date: '2023-10-01T10:00:00Z',
    exit_date: undefined,
    initial_usd: 1500.50,
    current_usd: 1550.75,
    total_fees_usd: 25.30,
    range_min: 3800.89,
    range_max: 4367.66,
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
    exchange: 'Uniswap v3',
    network: 'Arbitrum',
    status: 'Fechada',
    entry_date: '2023-09-15T09:00:00Z',
    exit_date: '2023-11-20T14:00:00Z',
    initial_usd: 5000,
    current_usd: 4850.25,
    total_fees_usd: 150.8,
    range_min: 15.5,
    range_max: 17.8,
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
    const latestSnapshot = pool.snapshots.sort((a, b) => new Date(b.captured_at as string).getTime() - new Date(a.captured_at as string).getTime())[0];
    
    const initial_usd = pool.initial_usd;
    const current_usd = pool.current_usd;
    const total_fees_usd = pool.total_fees_usd;

    const profit_loss_usd = (current_usd + total_fees_usd) - initial_usd;
    const profit_loss_pct = initial_usd > 0 ? (profit_loss_usd / initial_usd) * 100 : 0;
    const roi_pct = initial_usd > 0 ? (total_fees_usd / initial_usd) * 100 : 0;

    const endDate = pool.exit_date ? parseISO(pool.exit_date) : new Date();
    const duration_days = differenceInDays(endDate, parseISO(pool.entry_date));
    
    // This is a simplification. Real in_range would depend on current price vs range.
    const in_range = pool.status === 'Ativa';
    
    return {
        ...pool,
        current_usd,
        total_fees_usd,
        profit_loss_usd,
        profit_loss_pct,
        roi_pct,
        duration_days,
        in_range
    };
}


export async function getDashboardData(): Promise<DashboardData> {
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


export async function savePool(poolData: any) {
    console.log("Saving new pool:", poolData);
    const newId = (MOCK_POOLS.length + 1).toString();
    
    const now = new Date().toISOString();

    const newPool: Pool = {
        id: newId,
        name: poolData.name,
        exchange: poolData.exchange,
        network: poolData.network,
        status: poolData.status,
        entry_date: poolData.entry_date,
        exit_date: poolData.exit_date,
        initial_usd: poolData.initial_usd,
        current_usd: poolData.current_usd,
        range_min: poolData.range_min,
        range_max: poolData.range_max,
        total_fees_usd: poolData.total_fees_usd,
        created_at: now,
        // In a real app, pool_tokens would be saved to a separate table.
        // We'll add a snapshot here to represent the initial state.
        snapshots: [{
             captured_at: now,
             position_usd: poolData.current_usd,
             fees_total_usd: poolData.total_fees_usd,
             in_range: poolData.status === 'Ativa',
             price_min: poolData.range_min,
             price_max: poolData.range_max,
             // Other fields would be here
        }],
    } as Pool;
    MOCK_POOLS.push(newPool);
    return newPool;
}
