'use client'

import { formatCurrency } from '@/lib/utils'

interface Props {
  spent: number
  total: number
  size?: number
}

export default function BudgetRing({ spent, total, size = 160 }: Props) {
  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? Math.min(1, spent / total) : 0
  const offset = circumference * (1 - pct)
  const over = spent > total

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ede9fe"
            strokeWidth={12}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={over ? '#ef4444' : '#7c3aed'}
            strokeWidth={12}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{Math.round(pct * 100)}%</span>
          <span className="text-xs text-gray-400">used</span>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-400 text-xs">Spent</p>
          <p className={`font-bold ${over ? 'text-red-500' : 'text-gray-800'}`}>{formatCurrency(spent)}</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-gray-400 text-xs">Budget</p>
          <p className="font-bold text-gray-800">{formatCurrency(total)}</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div className="text-center">
          <p className="text-gray-400 text-xs">{over ? 'Over' : 'Left'}</p>
          <p className={`font-bold ${over ? 'text-red-500' : 'text-green-500'}`}>
            {formatCurrency(Math.abs(total - spent))}
          </p>
        </div>
      </div>
    </div>
  )
}
