'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import CategoryIcon from '@/components/CategoryIcon'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'
import { getCurrentMonthYear, getMonthLabel, formatCurrency, getPastMonths } from '@/lib/utils'
import { getTransactions, getBudgets } from '@/lib/store'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SummaryPage() {
  const now = getCurrentMonthYear()
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalBudget, setTotalBudget] = useState(0)
  const [catSummary, setCatSummary] = useState<any[]>([])
  const [trend, setTrend] = useState<{ label: string; spent: number }[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(() => {
    const txns = getTransactions(now.month, now.year)
    const budgets = getBudgets(now.month, now.year)
    const spentMap: Record<string, number> = {}
    txns.forEach(t => { spentMap[t.category] = (spentMap[t.category] ?? 0) + Number(t.amount) })
    const summary = CATEGORIES.map(cat => {
      const b = budgets.find(b => b.category === cat.id)
      const allocated = b ? Number(b.allocated) + Number(b.rollover) : 0
      const spent = spentMap[cat.id] ?? 0
      return { ...cat, allocated, spent, diff: allocated - spent }
    }).filter(c => c.allocated > 0 || c.spent > 0)
    setTotalSpent(txns.reduce((s, t) => s + Number(t.amount), 0))
    setTotalBudget(budgets.reduce((s, b) => s + Number(b.allocated) + Number(b.rollover), 0))
    setCatSummary(summary)
    const months = getPastMonths(6).reverse()
    setTrend(months.map(m => ({
      label: m.label,
      spent: getTransactions(m.month, m.year).reduce((s, t) => s + Number(t.amount), 0),
    })))
    setLoaded(true)
  }, [now.month, now.year])

  useEffect(() => { load() }, [load])

  const over = catSummary.filter(c => c.diff < 0)
  const under = catSummary.filter(c => c.diff >= 0 && c.allocated > 0)
  const top3 = [...catSummary].sort((a, b) => b.spent - a.spent).slice(0, 3)
  const remaining = totalBudget - totalSpent

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" style={{ background: 'var(--app-bg)' }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 55%, #24243e 100%)' }}>
          <h1 className="text-xl font-bold text-white mb-1">Summary</h1>
          <p className="text-white/40 text-sm">{getMonthLabel(now.month, now.year)}</p>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Spent', value: totalSpent, color: 'text-white' },
              { label: 'Budget', value: totalBudget, color: 'text-white' },
              { label: remaining >= 0 ? 'Remaining' : 'Over', value: Math.abs(remaining), color: remaining >= 0 ? 'text-emerald-400' : 'text-red-400' },
            ].map(k => (
              <div key={k.label} className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{k.label}</p>
                <p className={`text-base font-bold mt-1 ${k.color}`}>{formatCurrency(k.value)}</p>
              </div>
            ))}
          </div>
          <div className="h-6 bg-[var(--app-bg)] rounded-t-[24px] mt-4 -mx-5 -mb-6" />
        </div>

        {!loaded ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-5 mt-2 flex flex-col gap-4">

            {/* Trend */}
            {trend.some(d => d.spent > 0) && (
              <div className="bg-white rounded-3xl card-shadow p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">6-Month Spending Trend</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={v => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="spent" stroke="#4f46e5" strokeWidth={2.5}
                      dot={{ fill: '#4f46e5', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top spending */}
            {top3.length > 0 && (
              <div className="bg-white rounded-3xl card-shadow p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Top Spending</h3>
                <div className="flex flex-col gap-4">
                  {top3.map((cat, i) => {
                    const cfg = getCategoryConfig(cat.id)
                    const pct = cat.allocated > 0 ? Math.min(100, (cat.spent / cat.allocated) * 100) : 100
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                        <CategoryIcon id={cat.id} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-800">{cfg.label}</span>
                            <span className="text-sm font-bold text-gray-800">{formatCurrency(cat.spent)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Over budget */}
            {over.length > 0 && (
              <div className="bg-white rounded-3xl card-shadow overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <h3 className="text-sm font-bold text-red-600">Over Budget</h3>
                </div>
                {over.map(cat => {
                  const cfg = getCategoryConfig(cat.id)
                  return (
                    <div key={cat.id} className="flex items-center gap-3 px-5 py-3 border-t border-red-50">
                      <CategoryIcon id={cat.id} size="sm" />
                      <span className="flex-1 text-sm font-medium text-gray-700">{cfg.label}</span>
                      <span className="text-sm font-bold text-red-500">+{formatCurrency(Math.abs(cat.diff))}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Under budget */}
            {under.length > 0 && (
              <div className="bg-white rounded-3xl card-shadow overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <h3 className="text-sm font-bold text-emerald-600">Under Budget — rolls over</h3>
                </div>
                {under.map(cat => {
                  const cfg = getCategoryConfig(cat.id)
                  return (
                    <div key={cat.id} className="flex items-center gap-3 px-5 py-3 border-t border-green-50">
                      <CategoryIcon id={cat.id} size="sm" />
                      <span className="flex-1 text-sm font-medium text-gray-700">{cfg.label}</span>
                      <span className="text-sm font-bold text-emerald-500">{formatCurrency(cat.diff)} saved</span>
                    </div>
                  )
                })}
              </div>
            )}

            {catSummary.length === 0 && (
              <div className="bg-white rounded-3xl card-shadow p-10 text-center text-gray-400">
                <TrendingDown size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="font-semibold text-gray-600">No data yet</p>
                <p className="text-sm mt-1">Set budgets and log expenses to see your summary.</p>
              </div>
            )}
          </div>
        )}

        <Nav />
      </div>
    </PageTransition>
  )
}
