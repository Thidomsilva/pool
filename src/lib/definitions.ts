import { Timestamp } from "firebase/firestore";

export interface FeeEvent {
  amount_usd: number;
  description?: string;
  occurred_at: Date;
}

export interface PoolForm {
  name: string;
  exchange: string;
  network: string;
  entry_date: Date;
  exit_date?: Date;
  status: 'Ativa' | 'Fechada';
  
  tokens: {
    symbol: string;
    qty: number;
    usd_value: number;
  }[];

  initial_usd: number;
  current_usd: number;
  range_min?: number;
  range_max?: number;
  total_fees_usd: number;
  fee_events: FeeEvent[];
}


export interface Pool {
  id: string;
  name: string;
  exchange: string;
  network: string;
  status: 'Ativa' | 'Fechada';
  entry_date: Date | Timestamp;
  exit_date?: Date | Timestamp;
  
  initial_usd: number;
  current_usd: number;
  total_fees_usd: number;
  range_min?: number;
  range_max?: number;
  
  created_at: Date | Timestamp;
  snapshots: PoolSnapshot[];
  fee_events: (FeeEvent & { occurred_at: Timestamp })[];

  // Calculated fields
  profit_loss_usd: number;
  profit_loss_pct: number;
  roi_pct: number;
  duration_days: number;
  in_range: boolean;
  resultado: number; // For PoolCard
}

export type PoolSnapshot = {
  captured_at: Date | Timestamp;
  position_usd: number;
  fees_total_usd: number;
  in_range: boolean;
  price_min?: number;
  price_max?: number;
  price_market?: number;
  apr_total_pct?: number;
  note?: string;
};

export interface DashboardData {
  pools: Pool[];
  summaryMetrics: {
    totalValue: number;
    totalProfitLoss: number;
    totalProfitLossPct: number;
    bestRoi: { name: string; value: number };
    totalFees: number;
  };
  monthlyPerformance: { month: string; profit: number; fees: number }[];
  bestPool?: Pool;
  highestRoiPool?: Pool;
  highestFeesPool?: Pool;
}
