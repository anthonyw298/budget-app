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
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0])
  const [filterCat, setFilterCat] = useState('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tab, setTab] = useState<'list' | 'charts'>('list')

  const refresh = useCallback(() => {
    const cat = filterCat === 'all' ? undefined : filterCat
    setTransactions(getTransactions(selectedMonth.month, selectedMonth.year, cat))
  }, [selectedMonth, filterCat])

  useEffect(() => { refresh() }, [refresh])

  const handleDelete = (id: string) => { deleteTransaction(id); refresh() }

  const chartData = CATEGORIES.map(cat => ({
    name: cat.label, color: cat.color,
    value: transactions.filter(t => t.category === cat.id).reduce((s, t) => s + Number(t.amount), 0),
  })).filter(d => d.value > 0)

  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0)

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" style={{ background: 'var(--app-bg)' }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-4" style={{ background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 55%, #24243e 100%)' }}>
          <h1 className="text-xl font-bold text-white mb-4">History</h1>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MONTHS.map(m => (
              <button key={`${m.year}-${m.month}`}
                onClick={() => setSelectedMonth(m)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all tap ${
                  m.month === selectedMonth.month && m.year === selectedMonth.year
                    ? 'bg-white text-indigo-700'
                    : 'bg-white/10 text-white/60 border border-white/10'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="absolute -bottom-px left-0 right-0 h-5 bg-[var(--app-bg)]" style={{ borderRadius: '20px 20px 0 0', position: 'relative', marginTop: 0 }} />
        </div>

        {/* Tab */}
        <div className="px-5 mt-4 mb-4">
          <div className="flex bg-white rounded-2xl card-shadow p-1">
            {(['list', 'charts'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500'
                }`}
              >
                {t === 'list' ? 'Transactions' : 'Charts'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'list' ? (
          <div className="px-5 flex flex-col gap-4">
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilterCat('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tap transition-all ${
                  filterCat === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 card-shadow'
                }`}
              >All</button>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setFilterCat(filterCat === cat.id ? 'all' : cat.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tap transition-all"
                  style={filterCat === cat.id
                    ? { backgroundColor: cat.color, color: '#fff' }
                    : { backgroundColor: '#fff', color: '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {transactions.length === 0 ? (
              <div className="bg-white rounded-3xl card-shadow p-10 text-center text-gray-400">
                No transactions this month
              </div>
            ) : (
              <div className="bg-white rounded-3xl card-shadow px-4">
                {transactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} />)}
              </div>
            )}

            {transactions.length > 0 && (
              <div className="bg-indigo-600 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-indigo-100 text-sm font-medium">Total spent</span>
                <span className="text-white font-bold text-xl">{formatCurrency(totalSpent)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-4">
            {chartData.length === 0 ? (
              <div className="bg-white rounded-3xl card-shadow p-10 text-center text-gray-400">No data to display</div>
            ) : (
              <>
                <div className="bg-white rounded-3xl card-shadow p-5">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">By Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={48}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={v => formatCurrency(Number(v))} />
                      <Legend formatter={v => <span className="text-xs text-gray-600">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-3xl card-shadow p-5">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Breakdown</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `$${v}`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={72} />
                      <Tooltip formatter={v => formatCurrency(Number(v))} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
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
