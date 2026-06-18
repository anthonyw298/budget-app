import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without clsx dependency
  return inputs.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getCurrentMonthYear() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export function getMonthLabel(month: number, year: number): string {
  return new Date(year, month - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
}

export function getPastMonths(count: number): { month: number; year: number; label: string }[] {
  const result = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
    })
  }
  return result
}

export function pct(spent: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((spent / total) * 100))
}
