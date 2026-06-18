'use client'

import { motion } from 'framer-motion'
import { getCategoryConfig } from '@/lib/categories'
import { formatCurrency, pct } from '@/lib/utils'

interface Props {
  category: string
  allocated: number
  rollover: number
  spent: number
}

export default function CategoryCard({ category, allocated, rollover, spent }: Props) {
  const cfg = getCategoryConfig(category as any)
  const total = allocated + rollover
  const remaining = total - spent
  const over = remaining < 0
  const progress = pct(spent, total)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: cfg.bgColor }}
          >
            {cfg.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{cfg.label}</p>
            {rollover > 0 && (
              <p className="text-xs text-green-500">+{formatCurrency(rollover)} rollover</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-sm ${over ? 'text-red-500' : 'text-gray-800'}`}>
            {formatCurrency(spent)}
          </p>
          <p className="text-xs text-gray-400">of {formatCurrency(total)}</p>
        </div>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: over ? '#ef4444' : cfg.color }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">{progress}% used</span>
        <span className={`text-xs font-medium ${over ? 'text-red-500' : 'text-green-600'}`}>
          {over ? `-${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
        </span>
      </div>
    </motion.div>
  )
}
