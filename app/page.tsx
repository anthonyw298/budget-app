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
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'

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
    acc[cat.id] = transactions.filter((t) => t.category === cat.id).reduce((s, t) => s + Number(t.amount), 0)
    return acc
  }, {} as Record<string, number>)

  const getBudget = (id: string) => budgets.find((b) => b.category === id) ?? { allocated: 0, rollover: 0 }
  const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated) + Number(b.rollover), 0)
  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0)
  const remaining = totalBudget - totalSpent
  const isCurrentMonth = month === now.month && year === now.year
  const pct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (isCurrentMonth) return; if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const activeBudgets = CATEGORIES.filter(cat => getBudget(cat.id).allocated > 0 || spentByCategory[cat.id] > 0)
  const over = remaining < 0

  return (
    <PageTransition>
      <div className="pb-28 min-h-screen" style={{ background: 'var(--app-bg)' }}>

        {/* Hero card */}
        <div
          className="relative px-5 pt-14 pb-8 hero-shadow"
          style={{ background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 55%, #24243e 100%)' }}
        >
          {/* Month picker */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap">
              <ChevronLeft size={16} className="text-white/70" />
            </button>
            <span className="text-white/70 text-sm font-medium">{getMonthLabel(month, year)}</span>
            <button onClick={nextMonth} disabled={isCurrentMonth} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap disabled:opacity-30">
              <ChevronRight size={16} className="text-white/70" />
            </button>
          </div>

          {/* Main number */}
          <div className="text-center mb-6">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Total Spent</p>
            <motion.p
              key={totalSpent}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-white tracking-tight"
            >
              {formatCurrency(totalSpent)}
            </motion.p>
            {totalBudget > 0 && (
              <p className="text-white/40 text-sm mt-1">of {formatCurrency(totalBudget)} budget</p>
            )}
          </div>

          {/* Progress bar */}
          {totalBudget > 0 && (
            <div className="mb-5">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: over ? '#ef4444' : 'linear-gradient(90deg, #818cf8, #a78bfa)' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/40 text-xs">{pct}% used</span>
                <span className={`text-xs font-semibold flex items-center gap-1 ${over ? 'text-red-400' : 'text-emerald-400'}`}>
                  {over ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {over ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
                </span>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Transactions', value: transactions.length },
              { label: 'Categories used', value: activeBudgets.length },
            ].map((s) => (
              <div key={s.label} className="bg-white/8 rounded-2xl p-3 backdrop-blur-sm border border-white/8">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom curve */}
          <div className="absolute -bottom-px left-0 right-0 h-6 bg-[var(--app-bg)]" style={{ borderRadius: '24px 24px 0 0' }} />
        </div>

        <div className="px-5 mt-4 flex flex-col gap-4">

          {/* Categories */}
          {loaded && activeBudgets.length > 0 && (
            <div className="bg-white rounded-3xl card-shadow overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Categories</h2>
                <a href="/categories" className="text-xs text-indigo-500 font-semibold">Manage</a>
              </div>
              <div className="px-4 pb-2">
                <AnimatePresence>
                  {activeBudgets.map((cat, i) => {
                    const b = getBudget(cat.id)
                    return (
                      <CategoryCard key={cat.id} category={cat.id}
                        allocated={Number(b.allocated)} rollover={Number(b.rollover)}
                        spent={spentByCategory[cat.id] ?? 0} index={i}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Recent */}
          {loaded && transactions.length > 0 && (
            <div className="bg-white rounded-3xl card-shadow overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent</h2>
                <a href="/history" className="text-xs text-indigo-500 font-semibold">See all</a>
              </div>
              <div className="px-4 pb-2">
                {transactions.slice(0, 5).map((t) => (
                  <TransactionItem key={t.id} transaction={t} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {loaded && activeBudgets.length === 0 && transactions.length === 0 && (
            <div className="bg-white rounded-3xl card-shadow p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <TrendingDown size={28} className="text-indigo-400" />
              </div>
              <p className="font-bold text-gray-800 text-lg">Nothing here yet</p>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                Set your monthly budgets, then log your first expense to get started.
              </p>
            </div>
          )}
        </div>

        <Nav />
      </div>
    </PageTransition>
  )
}
