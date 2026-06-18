'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import TransactionItem from '@/components/TransactionItem'
import { CATEGORIES } from '@/lib/categories'
import { getPastMonths, formatCurrency } from '@/lib/utils'
import { getTransactions, deleteTransaction, type Transaction } from '@/lib/store'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

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

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    refresh()
  }

  const spentByCategory = CATEGORIES.map((cat) => ({
    name: cat.label,
    icon: cat.icon,
    color: cat.color,
    value: transactions.filter((t) => t.category === cat.id).reduce((s, t) => s + Number(t.amount), 0),
  })).filter((d) => d.value > 0)

  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="pb-28 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
      </div>

      {/* Month selector */}
      <div className="px-5 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MONTHS.map((m) => (
            <button
              key={`${m.year}-${m.month}`}
              onClick={() => setSelectedMonth(m)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                m.month === selectedMonth.month && m.year === selectedMonth.year
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab toggle */}
      <div className="px-5 mb-4">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['list', 'charts'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'list' ? (
        <div className="px-5">
          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onClick={() => setFilterCat('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filterCat === 'all' ? 'bg-violet-100 text-violet-700' : 'bg-white text-gray-500 border border-gray-100'}`}
            >All</button>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setFilterCat(filterCat === cat.id ? 'all' : cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${filterCat === cat.id ? 'text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
                style={filterCat === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No transactions this month</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4">
              {transactions.map((t) => (
                <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {transactions.length > 0 && (
            <div className="mt-4 bg-violet-50 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-violet-700 font-medium">Total spent</span>
              <span className="text-violet-900 font-bold text-lg">{formatCurrency(totalSpent)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-5">
          {spentByCategory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No data to chart</div>
          ) : (
            <>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4">Spending by Category</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={spentByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {spentByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4">Amount by Category</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={spentByCategory} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {spentByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
  )
}
