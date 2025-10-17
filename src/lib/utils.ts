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

/**
 * Parse a number coming from Brazilian-style input formats.
 * Accepts: "1.234,56", "1234,56", "1234.56", 1234, etc.
 */
export function parseBrNumber(input: string | number | undefined | null): number {
  if (input === undefined || input === null) return 0;
  if (typeof input === 'number') return input;
  let s = String(input).trim();
  if (s === '') return 0;
  // remove thousands separator (dot) if present and replace decimal comma with dot
  // handle cases like "1.234,56" -> "1234.56", or "1,234.56" -> "1234.56"
  const hasComma = s.indexOf(',') >= 0;
  const hasDot = s.indexOf('.') >= 0;
  if (hasComma && hasDot) {
    // assume dot is thousands and comma is decimal
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    s = s.replace(',', '.');
  } else {
    // keep as is (dots are decimal or no separators)
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}
