'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import TransactionItem from '@/components/TransactionItem'
import { CATEGORIES } from '@/lib/categories'
import { getPastMonths, formatCurrency } from '@/lib/utils'
import { getTransactions, deleteTransaction, type Transaction } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const MONTHS = getPastMonths(12)

export default function HistoryPage() {
  const [sel, setSel] = useState(MONTHS[0])
  const [filterCat, setFilterCat] = useState('all')
  const [txns, setTxns] = useState<Transaction[]>([])
  const [tab, setTab] = useState<'list' | 'charts'>('list')

  const refresh = useCallback(() => {
    setTxns(getTransactions(sel.month, sel.year, filterCat === 'all' ? undefined : filterCat))
  }, [sel, filterCat])
  useEffect(() => { refresh() }, [refresh])

  const handleDelete = (id: string) => { deleteTransaction(id); refresh() }

  const chartData = CATEGORIES.map(c => ({
    name: c.label, color: c.color,
    value: txns.filter(t => t.category === c.id).reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.value > 0)

  const total = txns.reduce((s, t) => s + Number(t.amount), 0)

  const tooltipStyle = { contentStyle: { background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 12, color: '#f1f5f9' } }

  return (
    <PageTransition>
      <div className="min-h-screen pb-28 px-5 pt-14">
        <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--text-1)' }}>History</h1>

        {/* Month pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {MONTHS.map(m => (
            <button key={`${m.year}-${m.month}`} onClick={() => setSel(m)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tap"
              style={m.month === sel.month && m.year === sel.year
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }
              }
            >{m.label}</button>
          ))}
        </div>

        {/* Tab */}
        <div className="flex rounded-2xl p-1 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {(['list', 'charts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-3)' }}
            >{t === 'list' ? 'Transactions' : 'Charts'}</button>
          ))}
        </div>

        {tab === 'list' ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
              <button onClick={() => setFilterCat('all')} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tap"
                style={filterCat === 'all' ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
              >All</button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? 'all' : c.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tap"
                  style={filterCat === c.id ? { background: c.color, color: '#fff' } : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
                >{c.label}</button>
              ))}
            </div>

            {txns.length === 0 ? (
              <div className="card p-10 text-center" style={{ color: 'var(--text-3)' }}>No transactions</div>
            ) : (
              <div className="card px-4">{txns.map(t => <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} />)}</div>
            )}

            {txns.length > 0 && (
              <div className="card-2 p-4 mt-4 flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Total spent</span>
                <span className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>{formatCurrency(total)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {chartData.length === 0 ? (
              <div className="card p-10 text-center" style={{ color: 'var(--text-3)' }}>No data</div>
            ) : (
              <>
                <div className="card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-3)' }}>By Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={48}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={v => formatCurrency(Number(v))} {...tooltipStyle} />
                      <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-3)' }}>Breakdown</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={72} />
                      <Tooltip formatter={v => formatCurrency(Number(v))} {...tooltipStyle} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}
        <Nav />
      </div>
    </PageTransition>
  )
}
