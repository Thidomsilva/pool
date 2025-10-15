// This can be removed if we are not using AI parsing anymore.
// For now, we can define a manual form structure.

export interface ParsedPosition {
  name?: string;
  exchange?: string;
  network?: string;
  entry_date?: string;
  exit_date?: string;
  status?: 'Ativa' | 'Fechada';
  
  tokens?: {
    symbol?: string;
    qty?: number;
    usd_value?: number;
  }[];

  initial_usd?: number;
  current_usd?: number;
  range_min?: number;
  range_max?: number;
  total_fees_usd?: number;

  // These were from the AI parser, might not be needed for manual form
  uncertainFields?: string[];
  confidence?: number;
  captured_at?: string;
}


export interface Pool {
  id: string;
  name: string;
  exchange: string;
  network: string;
  status: 'Ativa' | 'Fechada';
  entry_date: string;
  exit_date?: string;
  
  initial_usd: number;
  current_usd: number;
  total_fees_usd: number;
  range_min?: number;
  range_max?: number;
  
  created_at: string;
  snapshots: PoolSnapshot[];

  // Calculated fields
  profit_loss_usd: number;
  profit_loss_pct: number;
  roi_pct: number;
  duration_days: number;
  in_range: boolean;
}

export type PoolSnapshot = {
  captured_at: string;
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
    bestRoi: { name: string; value: number };
    totalFees: number;
  };
  monthlyPerformance: { month: string; profit: number; fees: number }[];
}
