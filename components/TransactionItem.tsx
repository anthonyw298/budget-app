'use client'

import { motion } from 'framer-motion'
import { getCategoryConfig } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils'
import { Trash2, RefreshCw } from 'lucide-react'
import { Transaction } from '@/lib/store'

interface Props {
  transaction: Transaction
  onDelete?: (id: string) => void
}

export default function TransactionItem({ transaction, onDelete }: Props) {
  const cfg = getCategoryConfig(transaction.category as any)
  const date = new Date(transaction.date + 'T00:00:00')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: cfg.bgColor }}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">
          {transaction.note || cfg.label}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {transaction.is_recurring_instance && (
            <span className="inline-flex items-center gap-0.5 text-violet-400">
              <RefreshCw size={10} /> recurring
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-800 text-sm">{formatCurrency(transaction.amount)}</span>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
