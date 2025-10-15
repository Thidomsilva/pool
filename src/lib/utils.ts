import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return 'R$0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatPercent(value: number | undefined | null) {
  if (value === undefined || value === null) return '0,00%';
  return `${value.toFixed(2).replace('.',',')}%`;
}
