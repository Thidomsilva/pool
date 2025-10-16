'use client';

import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Pool } from '@/lib/definitions';

export default function PoolsTable({ pools }: { pools: Pool[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string>('');

  const startEdit = (id: string, currentUsd: number) => {
    setEditingId(id);
    setLocalValue(currentUsd?.toString() ?? '0');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLocalValue('');
  };

  const saveValue = (id: string) => {
    // Aqui apenas fazemos o callback local. Persistência será implementada pelo servidor/Firebase.
    // Podemos chamar uma API para atualizar o pool por id.
    console.log('Salvar valor atual para', id, localValue);
    setEditingId(null);
  };

  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pool</TableHead>
            <TableHead className="text-right">Valor Inicial (USD)</TableHead>
            <TableHead className="text-right">Valor Atual (USD)</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell className="text-right">{formatCurrency(p.initial_usd)}</TableCell>
              <TableCell className="text-right">{formatCurrency(p.current_usd)}</TableCell>
              <TableCell className="text-right">{p.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Rodapé: Atualize "Valor Atual" para cada operação aqui.</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => console.log('Atualizar em lote')}>Atualizar Todos</Button>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
