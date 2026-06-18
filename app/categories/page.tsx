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
  const saveBudget = (id: string) => { upsertBudget({ category: id, month, year, allocated: parseFloat(editValue) || 0, rollover: 0 }); refresh(); setEditing(null) }
  const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0)

  return (
    <PageTransition>
      <div className="min-h-screen pb-28 px-5 pt-14">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Budget Setup</h1>
          <Link href="/recurring" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tap"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            <RefreshCw size={12} /> Recurring
          </Link>
        </div>

        {/* Month picker */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center tap" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={16} style={{ color: 'var(--text-2)' }} />
          </button>
          <span className="flex-1 text-center text-sm font-semibold" style={{ color: 'var(--text-2)' }}>{getMonthLabel(month, year)}</span>
          <button onClick={nextMonth} disabled={isCurrentMonth} className="w-8 h-8 rounded-full flex items-center justify-center tap disabled:opacity-30" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronRight size={16} style={{ color: 'var(--text-2)' }} />
          </button>
        </div>

        {/* Total */}
        <div className="card-2 p-5 mb-5">
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-3)' }}>Total allocated</p>
          <p className="text-3xl font-extrabold mt-1" style={{ color: 'var(--text-1)' }}>{formatCurrency(totalBudget)}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>per month</p>
        </div>

        {/* List */}
        <div className="card overflow-hidden">
          {CATEGORIES.map((cat, i) => {
            const current = getAllocated(cat.id)
            const isEditing = editing === cat.id
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}
              >
                <CategoryIcon id={cat.id} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{cat.label}</p>
                  {!isEditing && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{current > 0 ? formatCurrency(current) + ' / mo' : 'Not set'}</p>}
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-3)' }}>$</span>
                    <input type="number" inputMode="decimal" value={editValue} onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveBudget(cat.id)}
                      className="w-20 text-right font-bold outline-none bg-transparent" style={{ color: 'var(--text-1)', borderBottom: '2px solid var(--accent)' }} autoFocus
                    />
                    <button onClick={() => saveBudget(cat.id)} className="w-7 h-7 rounded-full flex items-center justify-center tap" style={{ background: 'var(--accent)' }}>
                      <Check size={13} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(cat.id); setEditValue(String(current || '')) }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold tap"
                    style={{ background: current > 0 ? cat.color + '20' : 'var(--surface-2)', color: current > 0 ? cat.color : 'var(--text-3)' }}
                  >
                    {current > 0 ? 'Edit' : 'Set'}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>

        <Nav />
      </div>
    </PageTransition>
  )
}
