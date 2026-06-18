'use client'

import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import BudgetRing from '@/components/BudgetRing'
import CategoryCard from '@/components/CategoryCard'
import TransactionItem from '@/components/TransactionItem'
import { CATEGORIES } from '@/lib/categories'
import { getCurrentMonthYear, getMonthLabel } from '@/lib/utils'
import {
  getTransactions,
  getBudgets,
  processRecurring,
  type Transaction,
  type Budget,
} from '@/lib/store'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

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

  useEffect(() => {
    processRecurring()
    refresh()
  }, [refresh])

  const spentByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = transactions
      .filter((t) => t.category === cat.id)
      .reduce((s, t) => s + Number(t.amount), 0)
    return acc
  }, {} as Record<string, number>)

  const getBudget = (catId: string) =>
    budgets.find((b) => b.category === catId) ?? { allocated: 0, rollover: 0 }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated) + Number(b.rollover), 0)
  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0)

  const isCurrentMonth = month === now.month && year === now.year

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (isCurrentMonth) return
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const activeBudgets = CATEGORIES.filter(
    (cat) => getBudget(cat.id).allocated > 0 || spentByCategory[cat.id] > 0
  )

  return (
    <div className="pb-28" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
            <Sparkles size={18} className="text-violet-600" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={prevMonth} className="p-1.5 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <span className="flex-1 text-center font-semibold text-gray-700">
            {getMonthLabel(month, year)}
          </span>
          <button onClick={nextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-xl bg-white shadow-sm border border-gray-100 disabled:opacity-30 active:scale-95 transition-transform">
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="mx-5 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex justify-center">
        {!loaded ? (
          <div className="w-44 h-44 rounded-full bg-gray-100 animate-pulse" />
        ) : (
          <BudgetRing spent={totalSpent} total={totalBudget} size={180} />
        )}
      </div>

      {loaded && activeBudgets.length > 0 && (
        <div className="px-5 mt-5">
          <h2 className="font-bold text-gray-800 mb-3">Categories</h2>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {activeBudgets.map((cat) => {
                const budget = getBudget(cat.id)
                return (
                  <CategoryCard
                    key={cat.id}
                    category={cat.id}
                    allocated={Number(budget.allocated)}
                    rollover={Number(budget.rollover)}
                    spent={spentByCategory[cat.id] ?? 0}
                  />
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {loaded && transactions.length > 0 && (
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">Recent</h2>
            <a href="/history" className="text-sm text-violet-600 font-medium">See all</a>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4">
            {transactions.slice(0, 5).map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      )}

      {loaded && activeBudgets.length === 0 && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-16 px-8 text-center">
          <div className="text-6xl mb-4">💜</div>
          <p className="text-gray-600 font-medium">No data yet for this month</p>
          <p className="text-gray-400 text-sm mt-1">Set budgets in the Budget tab, then start logging expenses!</p>
        </div>
      )}

      <Nav />
    </div>
  )
}
