'use client'

import { motion } from 'framer-motion'
import { getCategoryConfig } from '@/lib/categories'
import { formatCurrency, pct } from '@/lib/utils'
import CategoryIcon from './CategoryIcon'

interface Props {
  category: string; allocated: number; rollover: number; spent: number; index?: number
}

export default function CategoryCard({ category, allocated, rollover, spent, index = 0 }: Props) {
  const cfg = getCategoryConfig(category as any)
  const total = allocated + rollover
  const remaining = total - spent
  const over = remaining < 0
  const progress = pct(spent, total)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="flex items-center gap-3 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}
    >
      <CategoryIcon id={category} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{cfg.label}</span>
          <div className="text-right">
            <span className={`text-sm font-bold ${over ? 'text-red-400' : ''}`} style={over ? {} : { color: 'var(--text-1)' }}>
              {formatCurrency(spent)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}> / {formatCurrency(total)}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, delay: index * 0.04 + 0.1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: over ? 'var(--red)' : cfg.color }}
          />
        </div>
      </div>
      <div className="text-right ml-1 w-14 flex-shrink-0">
        <p className={`text-xs font-semibold ${over ? 'text-red-400' : 'text-emerald-400'}`}>
          {over ? '-' : ''}{formatCurrency(Math.abs(remaining))}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{over ? 'over' : 'left'}</p>
      </div>
    </motion.div>
  )
}
