'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'
import { getCurrentMonthYear, getMonthLabel, formatCurrency, getPastMonths } from '@/lib/utils'
import { getTransactions, getBudgets } from '@/lib/store'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function SummaryPage() {
  const now = getCurrentMonthYear()
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [categorySummary, setCategorySummary] = useState<any[]>([])
  const [trendData, setTrendData] = useState<{ label: string; spent: number }[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(() => {
    const txns = getTransactions(now.month, now.year)
    const budgets = getBudgets(now.month, now.year)

    const spentMap: Record<string, number> = {}
    txns.forEach((t) => { spentMap[t.category] = (spentMap[t.category] ?? 0) + Number(t.amount) })

    const summary = CATEGORIES.map((cat) => {
      const budget = budgets.find((b) => b.category === cat.id)
      const allocated = budget ? Number(budget.allocated) + Number(budget.rollover) : 0
      const spent = spentMap[cat.id] ?? 0
      return { ...cat, allocated, spent, diff: allocated - spent }
    }).filter((c) => c.allocated > 0 || c.spent > 0)

    const tSpent = txns.reduce((s, t) => s + Number(t.amount), 0)
    const tBudget = budgets.reduce((s, b) => s + Number(b.allocated) + Number(b.rollover), 0)

    setTotalSpent(tSpent)
    setTotalBudget(tBudget)
    setCategorySummary(summary)

    // Trend: last 6 months
    const months = getPastMonths(6).reverse()
    const trend = months.map((m) => ({
      label: m.label,
      spent: getTransactions(m.month, m.year).reduce((s, t) => s + Number(t.amount), 0),
    }))
    setTrendData(trend)
    setLoaded(true)
  }, [now.month, now.year])

  useEffect(() => { load() }, [load])

  const overBudget = categorySummary.filter((c) => c.diff < 0)
  const underBudget = categorySummary.filter((c) => c.diff >= 0 && c.allocated > 0)
  const topSpend = [...categorySummary].sort((a, b) => b.spent - a.spent).slice(0, 3)
  const totalRemaining = totalBudget - totalSpent

  return (
    <div className="pb-28 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
        <p className="text-sm text-gray-400 mt-0.5">{getMonthLabel(now.month, now.year)}</p>
      </div>

      {!loaded ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-4">
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Spent', value: totalSpent, color: 'text-gray-800' },
              { label: 'Budget', value: totalBudget, color: 'text-gray-800' },
              {
                label: totalRemaining >= 0 ? 'Remaining' : 'Over',
                value: Math.abs(totalRemaining),
                color: totalRemaining >= 0 ? 'text-green-600' : 'text-red-500',
              },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-400">{kpi.label}</p>
                <p className={`font-bold text-base mt-0.5 ${kpi.color}`}>{formatCurrency(kpi.value)}</p>
              </div>
            ))}
          </div>

          {/* 6-month trend */}
          {trendData.some((d) => d.spent > 0) && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">6-Month Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="spent" stroke="#7c3aed" strokeWidth={2.5}
                    dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top spending */}
          {topSpend.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3">Top Spending</h3>
              <div className="flex flex-col gap-3">
                {topSpend.map((cat, i) => {
                  const cfg = getCategoryConfig(cat.id as any)
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: cfg.bgColor }}>
                        {cfg.icon}
                      </div>
                      <p className="flex-1 text-sm font-semibold text-gray-800">{cfg.label}</p>
                      <p className="font-bold text-gray-800">{formatCurrency(cat.spent)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Over budget */}
          {overBudget.length > 0 && (
            <div className="bg-red-50 rounded-3xl border border-red-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-red-500" />
                <h3 className="font-bold text-red-700">Over Budget</h3>
              </div>
              {overBudget.map((cat) => {
                const cfg = getCategoryConfig(cat.id as any)
                return (
                  <div key={cat.id} className="flex items-center gap-2 py-2 border-b border-red-100 last:border-0">
                    <span>{cfg.icon}</span>
                    <span className="flex-1 text-sm text-gray-700">{cfg.label}</span>
                    <span className="text-sm font-bold text-red-600">+{formatCurrency(Math.abs(cat.diff))}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Under budget */}
          {underBudget.length > 0 && (
            <div className="bg-green-50 rounded-3xl border border-green-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={18} className="text-green-600" />
                <h3 className="font-bold text-green-700">Under Budget (rolls over)</h3>
              </div>
              {underBudget.map((cat) => {
                const cfg = getCategoryConfig(cat.id as any)
                return (
                  <div key={cat.id} className="flex items-center gap-2 py-2 border-b border-green-100 last:border-0">
                    <span>{cfg.icon}</span>
                    <span className="flex-1 text-sm text-gray-700">{cfg.label}</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(cat.diff)} saved</span>
                  </div>
                )
              })}
            </div>
          )}

          {categorySummary.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="font-medium">No data yet</p>
              <p className="text-sm mt-1">Set budgets and log some expenses to see your summary</p>
            </div>
          )}
        </div>
      )}

      <Nav />
    </div>
  )
}
