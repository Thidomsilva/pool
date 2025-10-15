import type { ParsedPosition as AIParsedPosition } from '@/ai/flows/highlight-uncertain-fields-in-preview';

export type ParsedPosition = AIParsedPosition;

export interface Pool {
  id: string;
  name: string;
  pair_base: string;
  pair_quote: string;
  network: string;
  version: string;
  fee_bps: number;
  initial_usd: number;
  created_at: string;
  snapshots: PoolSnapshot[];
  // Calculated fields
  current_usd: number;
  total_fees_usd: number;
  profit_loss_usd: number;
  profit_loss_pct: number;
  roi_pct: number;
  duration_days: number;
  status: 'active' | 'closed';
  in_range: boolean;
}

export type PoolSnapshot = Omit<
  ParsedPosition,
  | 'pair_base'
  | 'pair_quote'
  | 'network'
  | 'version'
  | 'fee_bps'
  | 'uncertainFields'
  | 'confidence'
>;

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
