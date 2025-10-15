import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Pool } from '@/lib/definitions';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function PoolsTable({ pools }: { pools: Pool[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pool</TableHead>
          <TableHead>Network</TableHead>
          <TableHead className="text-right">Profit/Loss</TableHead>
          <TableHead className="text-right">Fees</TableHead>
          <TableHead className="text-right">ROI</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pools.map((pool) => (
          <TableRow key={pool.id}>
            <TableCell>
              <div className="font-medium">{pool.name}</div>
              <div className="text-sm text-muted-foreground">
                {pool.version} - {pool.fee_bps}%
              </div>
            </TableCell>
            <TableCell>{pool.network}</TableCell>
            <TableCell
              className={cn(
                'text-right',
                pool.profit_loss_usd >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrency(pool.profit_loss_usd)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(pool.total_fees_usd)}
            </TableCell>
            <TableCell className="text-right">
              {formatPercent(pool.roi_pct)}
            </TableCell>
            <TableCell>
              <Badge variant={pool.in_range ? 'default' : 'destructive'} 
                className={cn(pool.in_range ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600', 'text-white')}>
                {pool.in_range ? 'In Range' : 'Out of Range'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
