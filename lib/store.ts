'use client'

// All data lives in localStorage on the device — no server, no keys needed.

export type Transaction = {
  id: string
  amount: number
  category: string
  date: string
  note: string
  is_recurring_instance: boolean
  created_at: string
}

export type Budget = {
  id: string
  category: string
  month: number
  year: number
  allocated: number
  rollover: number
}

export type Recurring = {
  id: string
  amount: number
  category: string
  note: string
  frequency: 'weekly' | 'monthly'
  next_due: string
  active: boolean
}

function uid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

const KEYS = {
  transactions: 'bgt_transactions',
  budgets: 'bgt_budgets',
  recurring: 'bgt_recurring',
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function getTransactions(month?: number, year?: number, category?: string): Transaction[] {
  let txns = read<Transaction>(KEYS.transactions)
  if (month && year) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const prefix = `${year}-${pad(month)}`
    txns = txns.filter((t) => t.date.startsWith(prefix))
  }
  if (category) txns = txns.filter((t) => t.category === category)
  return txns.sort((a, b) => b.date.localeCompare(a.date))
}

export function addTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Transaction {
  const txns = read<Transaction>(KEYS.transactions)
  const t: Transaction = { ...data, id: uid(), created_at: new Date().toISOString() }
  save(KEYS.transactions, [t, ...txns])
  return t
}

export function deleteTransaction(id: string) {
  save(KEYS.transactions, read<Transaction>(KEYS.transactions).filter((t) => t.id !== id))
}

// ─── Budgets ─────────────────────────────────────────────────────────────────

export function getBudgets(month: number, year: number): Budget[] {
  return read<Budget>(KEYS.budgets).filter((b) => b.month === month && b.year === year)
}

export function upsertBudget(data: Omit<Budget, 'id'> & { id?: string }): Budget {
  const budgets = read<Budget>(KEYS.budgets)
  const existing = budgets.findIndex(
    (b) => b.category === data.category && b.month === data.month && b.year === data.year
  )
  if (existing >= 0) {
    budgets[existing] = { ...budgets[existing], ...data }
    save(KEYS.budgets, budgets)
    return budgets[existing]
  }
  const b: Budget = { ...data, id: data.id ?? uid() }
  save(KEYS.budgets, [...budgets, b])
  return b
}

export function computeRollover(category: string, month: number, year: number): number {
  // Get previous month
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const prevBudgets = getBudgets(prevMonth, prevYear)
  const prevBudget = prevBudgets.find((b) => b.category === category)
  if (!prevBudget) return 0

  const prevSpent = getTransactions(prevMonth, prevYear, category).reduce(
    (sum, t) => sum + t.amount, 0
  )
  return Math.max(0, prevBudget.allocated + prevBudget.rollover - prevSpent)
}

// ─── Recurring ───────────────────────────────────────────────────────────────

export function getRecurring(): Recurring[] {
  return read<Recurring>(KEYS.recurring)
    .filter((r) => r.active)
    .sort((a, b) => a.next_due.localeCompare(b.next_due))
}

export function addRecurring(data: Omit<Recurring, 'id'>): Recurring {
  const items = read<Recurring>(KEYS.recurring)
  const r: Recurring = { ...data, id: uid() }
  save(KEYS.recurring, [...items, r])
  return r
}

export function updateRecurring(id: string, patch: Partial<Recurring>) {
  const items = read<Recurring>(KEYS.recurring)
  const idx = items.findIndex((r) => r.id === id)
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...patch }
    save(KEYS.recurring, items)
  }
}

export function deleteRecurring(id: string) {
  updateRecurring(id, { active: false })
}

// ─── Process overdue recurring transactions ───────────────────────────────────

export function processRecurring() {
  const today = new Date().toISOString().split('T')[0]
  const items = read<Recurring>(KEYS.recurring).filter((r) => r.active && r.next_due <= today)

  for (const r of items) {
    addTransaction({
      amount: r.amount,
      category: r.category,
      date: r.next_due,
      note: r.note,
      is_recurring_instance: true,
    })

    const nextDue = new Date(r.next_due + 'T00:00:00')
    if (r.frequency === 'weekly') {
      nextDue.setDate(nextDue.getDate() + 7)
    } else {
      nextDue.setMonth(nextDue.getMonth() + 1)
    }
    updateRecurring(r.id, { next_due: nextDue.toISOString().split('T')[0] })
  }
}
