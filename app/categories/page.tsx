'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import CategoryIcon from '@/components/CategoryIcon'
import { CATEGORIES } from '@/lib/categories'
import { getCurrentMonthYear, getMonthLabel, formatCurrency } from '@/lib/utils'
import { getBudgets, upsertBudget, type Budget } from '@/lib/store'
import { ChevronLeft, ChevronRight, Check, RefreshCw } from 'lucide-react'

export default function CategoriesPage() {
  const now = getCurrentMonthYear()
  const [month, setMonth] = useState(now.month)
  const [year, setYear] = useState(now.year)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const refresh = useCallback(() => setBudgets(getBudgets(month, year)), [month, year])
  useEffect(() => { refresh() }, [refresh])

  const isCurrentMonth = month === now.month && year === now.year
  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (isCurrentMonth) return; if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const getAllocated = (id: string) => budgets.find(b => b.category === id)?.allocated ?? 0

  const saveBudget = (id: string) => {
    upsertBudget({ category: id, month, year, allocated: parseFloat(editValue) || 0, rollover: 0 })
    refresh(); setEditing(null)
  }

  const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0)

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" style={{ background: 'var(--app-bg)' }}>

        {/* Header */}
        <div
          className="px-5 pt-14 pb-6"
          style={{ background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 55%, #24243e 100%)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Budget Setup</h1>
            <Link href="/recurring"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium tap"
            >
              <RefreshCw size={12} /> Recurring
            </Link>
          </div>

          {/* Month picker */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap">
              <ChevronLeft size={16} className="text-white/70" />
            </button>
            <span className="flex-1 text-center text-white/70 text-sm font-medium">{getMonthLabel(month, year)}</span>
            <button onClick={nextMonth} disabled={isCurrentMonth} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap disabled:opacity-30">
              <ChevronRight size={16} className="text-white/70" />
            </button>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider font-semibold">Total allocated</p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalBudget)}</p>
          </div>

          <div className="absolute -bottom-px left-0 right-0 h-6 bg-[var(--app-bg)]" style={{ borderRadius: '24px 24px 0 0', position: 'relative', marginTop: 0 }} />
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-3xl card-shadow overflow-hidden">
            <div className="px-4 pt-4 pb-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tap any category to set budget</p>
            </div>
            {CATEGORIES.map((cat, i) => {
              const current = getAllocated(cat.id)
              const isEditing = editing === cat.id

              return (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0"
                >
                  <CategoryIcon id={cat.id} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
                    {!isEditing && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {current > 0 ? formatCurrency(current) + ' / mo' : 'Not set'}
                      </p>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-medium">$</span>
                      <input type="number" inputMode="decimal" value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveBudget(cat.id)}
                        className="w-20 text-right font-bold text-gray-900 outline-none border-b-2 border-indigo-500 bg-transparent"
                        autoFocus
                      />
                      <button onClick={() => saveBudget(cat.id)}
                        className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center tap"
                      >
                        <Check size={13} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(cat.id); setEditValue(String(current || '')) }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold tap"
                      style={{ backgroundColor: current > 0 ? cat.bg : '#f3f4f6', color: current > 0 ? cat.color : '#9ca3af' }}
                    >
                      {current > 0 ? 'Edit' : 'Set'}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        <Nav />
      </div>
    </PageTransition>
  )
}
