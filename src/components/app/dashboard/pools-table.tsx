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

  const saveValue = async (id: string) => {
    try {
      const value = Number(String(localValue).replace(',', '.')) || 0;
      const res = await fetch('/api/sheets/updatePool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { current_usd: value } }),
      });
      if (!res.ok) throw new Error('Failed to update');
      // Optionally show toast here
    } catch (e) {
      console.error('Failed to persist updated current_usd', e);
    } finally {
      setEditingId(null);
    }
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
              <TableCell className="text-right">
                {editingId === p.id ? (
                  <div className="flex items-center justify-end gap-2">
                    <input className="input h-8 rounded border px-2 text-right" value={localValue} onChange={(e) => setLocalValue(e.target.value)} />
                    <Button size="sm" onClick={() => saveValue(p.id)}>Salvar</Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancelar</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <span>{formatCurrency(p.current_usd)}</span>
                    <Button size="sm" onClick={() => startEdit(p.id, p.current_usd)}>Editar</Button>
                  </div>
                )}
              </TableCell>
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
