'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import CategoryIcon from '@/components/CategoryIcon'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'
import { getCurrentMonthYear, getMonthLabel, formatCurrency, getPastMonths } from '@/lib/utils'
import { getTransactions, getBudgets } from '@/lib/store'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react'

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
    setTrend(months.map(m => ({ label: m.label, spent: getTransactions(m.month, m.year).reduce((s, t) => s + Number(t.amount), 0) })))
    setLoaded(true)
  }, [now.month, now.year])
  useEffect(() => { load() }, [load])

  const over = catSummary.filter(c => c.diff < 0)
  const under = catSummary.filter(c => c.diff >= 0 && c.allocated > 0)
  const top3 = [...catSummary].sort((a, b) => b.spent - a.spent).slice(0, 3)
  const remaining = totalBudget - totalSpent

  const tooltipStyle = { contentStyle: { background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 12, color: '#f1f5f9' } }

  return (
    <PageTransition>
      <div className="min-h-screen pb-28 px-5 pt-14">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Summary</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-3)' }}>{getMonthLabel(now.month, now.year)}</p>

        {!loaded ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* KPI */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Spent', value: totalSpent, extra: '' },
                { label: 'Budget', value: totalBudget, extra: '' },
                { label: remaining >= 0 ? 'Left' : 'Over', value: Math.abs(remaining), extra: remaining >= 0 ? 'emerald' : 'red' },
              ].map(k => (
                <div key={k.label} className="card-2 p-3">
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>{k.label}</p>
                  <p className="text-base font-bold mt-1" style={{ color: k.extra === 'emerald' ? 'var(--green)' : k.extra === 'red' ? 'var(--red)' : 'var(--text-1)' }}>
                    {formatCurrency(k.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Trend */}
            {trend.some(d => d.spent > 0) && (
              <div className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-3)' }}>6-Month Trend</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={v => formatCurrency(Number(v))} {...tooltipStyle} />
                    <Line type="monotone" dataKey="spent" stroke="#818cf8" strokeWidth={2.5}
                      dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top spending */}
            {top3.length > 0 && (
              <div className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-3)' }}>Top Spending</h3>
                {top3.map((cat, i) => {
                  const cfg = getCategoryConfig(cat.id)
                  const pct = cat.allocated > 0 ? Math.min(100, (cat.spent / cat.allocated) * 100) : 100
                  return (
                    <div key={cat.id} className="flex items-center gap-3 mb-4 last:mb-0">
                      <span className="text-xs font-bold w-4" style={{ color: 'var(--text-3)' }}>#{i + 1}</span>
                      <CategoryIcon id={cat.id} size="md" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{cfg.label}</span>
                          <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatCurrency(cat.spent)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Over budget */}
            {over.length > 0 && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-4 pb-3">
                  <AlertCircle size={14} className="text-red-400" />
                  <h3 className="text-sm font-bold text-red-400">Over Budget</h3>
                </div>
                {over.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <CategoryIcon id={cat.id} size="sm" />
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-2)' }}>{getCategoryConfig(cat.id).label}</span>
                    <span className="text-sm font-bold text-red-400">+{formatCurrency(Math.abs(cat.diff))}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Under budget */}
            {under.length > 0 && (
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-4 pb-3">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-emerald-400">Under Budget</h3>
                </div>
                {under.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <CategoryIcon id={cat.id} size="sm" />
                    <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-2)' }}>{getCategoryConfig(cat.id).label}</span>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(cat.diff)} saved</span>
                  </div>
                ))}
              </div>
            )}

            {catSummary.length === 0 && (
              <div className="card p-10 text-center">
                <TrendingDown size={28} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-1)' }}>No data yet</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Set budgets and log expenses.</p>
              </div>
            )}
          </div>
        )}
        <Nav />
      </div>
    </PageTransition>
  )
}
