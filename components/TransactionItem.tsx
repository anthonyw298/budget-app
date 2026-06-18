'use client'

import { motion } from 'framer-motion'
import { getCategoryConfig } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils'
import { Trash2, RefreshCw } from 'lucide-react'
import { Transaction } from '@/lib/store'
import CategoryIcon from './CategoryIcon'

interface Props { transaction: Transaction; onDelete?: (id: string) => void }

export default function TransactionItem({ transaction, onDelete }: Props) {
  const cfg = getCategoryConfig(transaction.category as any)
  const date = new Date(transaction.date + 'T00:00:00')

  return (
    <motion.div layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}
    >
      <CategoryIcon id={transaction.category} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{transaction.note || cfg.label}</p>
        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-3)' }}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {transaction.is_recurring_instance && (
            <span className="inline-flex items-center gap-0.5 text-indigo-400 font-medium"><RefreshCw size={9} /> recurring</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>-{formatCurrency(transaction.amount)}</span>
        {onDelete && (
          <button onClick={() => onDelete(transaction.id)} className="p-1 tap" style={{ color: 'var(--text-3)' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
