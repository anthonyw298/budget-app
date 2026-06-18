'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import CategoryCard from '@/components/CategoryCard'
import TransactionItem from '@/components/TransactionItem'
import PageTransition from '@/components/PageTransition'
import { CATEGORIES } from '@/lib/categories'
import { getCurrentMonthYear, getMonthLabel, formatCurrency } from '@/lib/utils'
import { getTransactions, getBudgets, processRecurring, type Transaction, type Budget } from '@/lib/store'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

export default function Dashboard() {
  const now = getCurrentMonthYear()
  const [month, setMonth] = useState(now.month)
  const [year, setYear] = useState(now.year)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(() => {
    setTransactions(getTransactions(month, year))
    setBudgets(getBudgets(month, year))
    setLoaded(true)
  }, [month, year])

  useEffect(() => { processRecurring(); refresh() }, [refresh])

  const spentByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = transactions.filter(t => t.category === cat.id).reduce((s, t) => s + Number(t.amount), 0)
    return acc
  }, {} as Record<string, number>)

  const getBudget = (id: string) => budgets.find(b => b.category === id) ?? { allocated: 0, rollover: 0 }
  const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated) + Number(b.rollover), 0)
  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0)
  const remaining = totalBudget - totalSpent
  const isCurrentMonth = month === now.month && year === now.year
  const pct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0
  const over = remaining < 0
  const activeBudgets = CATEGORIES.filter(cat => getBudget(cat.id).allocated > 0 || spentByCategory[cat.id] > 0)

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (isCurrentMonth) return; if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <PageTransition>
      <div className="pb-28 min-h-screen px-5 pt-14">

        {/* Month selector */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={16} style={{ color: 'var(--text-2)' }} />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>{getMonthLabel(month, year)}</span>
          <button onClick={nextMonth} disabled={isCurrentMonth} className="w-9 h-9 rounded-full flex items-center justify-center tap disabled:opacity-30" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronRight size={16} style={{ color: 'var(--text-2)' }} />
          </button>
        </div>

        {/* Main amount */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>Total Spent</p>
          <motion.p key={totalSpent} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}
          >
            {formatCurrency(totalSpent)}
          </motion.p>
          {totalBudget > 0 && (
            <p className="text-sm mt-2" style={{ color: 'var(--text-3)' }}>of {formatCurrency(totalBudget)} budget</p>
          )}
        </div>

        {/* Progress bar */}
        {totalBudget > 0 && (
          <div className="mb-8">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: over ? 'var(--red)' : 'linear-gradient(90deg, var(--accent), #a78bfa)' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{pct}%</span>
              <span className={`text-xs font-semibold flex items-center gap-1 ${over ? 'text-red-400' : 'text-emerald-400'}`}>
                {over ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {over ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
              </span>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Transactions', value: String(transactions.length) },
            { label: 'Categories', value: String(activeBudgets.length) },
          ].map(s => (
            <div key={s.label} className="card-2 p-4">
              <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        {loaded && activeBudgets.length > 0 && (
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Categories</h2>
              <a href="/categories" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Manage</a>
            </div>
            <AnimatePresence>
              {activeBudgets.map((cat, i) => {
                const b = getBudget(cat.id)
                return <CategoryCard key={cat.id} category={cat.id} allocated={Number(b.allocated)} rollover={Number(b.rollover)} spent={spentByCategory[cat.id] ?? 0} index={i} />
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Recent */}
        {loaded && transactions.length > 0 && (
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Recent</h2>
              <a href="/history" className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>See all</a>
            </div>
            {transactions.slice(0, 5).map(t => <TransactionItem key={t.id} transaction={t} />)}
          </div>
        )}

        {/* Empty */}
        {loaded && activeBudgets.length === 0 && transactions.length === 0 && (
          <div className="card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent)' + '20' }}>
              <Wallet size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>Start tracking</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Set budgets and log your first expense.</p>
          </div>
        )}

        <Nav />
      </div>
    </PageTransition>
  )
}
