'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'
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

  const refresh = useCallback(() => {
    setBudgets(getBudgets(month, year))
  }, [month, year])

  useEffect(() => { refresh() }, [refresh])

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

  const getAllocated = (catId: string) =>
    budgets.find((b) => b.category === catId)?.allocated ?? 0

  const startEdit = (catId: string) => {
    setEditing(catId)
    setEditValue(String(getAllocated(catId) || ''))
  }

  const saveBudget = (catId: string) => {
    const amount = parseFloat(editValue) || 0
    upsertBudget({ category: catId, month, year, allocated: amount, rollover: 0 })
    refresh()
    setEditing(null)
  }

  const totalBudget = budgets.reduce((s, b) => s + b.allocated, 0)

  return (
    <div className="pb-28 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <Link
            href="/recurring"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 text-sm font-medium active:scale-95 transition-transform"
          >
            <RefreshCw size={14} />
            Recurring
          </Link>
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

      <div className="mx-5 mb-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white">
        <p className="text-sm opacity-80">Total monthly budget</p>
        <p className="text-3xl font-bold mt-0.5">{formatCurrency(totalBudget)}</p>
        <p className="text-xs opacity-60 mt-1">Tap a category to set or edit its budget</p>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {CATEGORIES.map((cat, i) => {
          const cfg = getCategoryConfig(cat.id)
          const current = getAllocated(cat.id)
          const isEditing = editing === cat.id

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: cfg.bgColor }}>
                  {cfg.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{cfg.label}</p>
                  {!isEditing && (
                    <p className="text-xs text-gray-400">
                      {current > 0 ? formatCurrency(current) + '/mo' : 'No budget set'}
                    </p>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 text-right font-bold text-gray-800 outline-none border-b-2 border-violet-500 bg-transparent"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveBudget(cat.id)}
                    />
                    <button
                      onClick={() => saveBudget(cat.id)}
                      className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Check size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(cat.id)}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium active:scale-95 transition-all"
                    style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
                  >
                    {current > 0 ? 'Edit' : 'Set'}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <Nav />
    </div>
  )
}
