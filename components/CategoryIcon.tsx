import {
  ShoppingCart, Utensils, Shirt, Gem, Home, Heart,
  BookOpen, Car, Plane, Tv, Smartphone, Sparkles, Package,
  type LucideIcon,
} from 'lucide-react'
import { getCategoryConfig } from '@/lib/categories'

const iconMap: Record<string, LucideIcon> = {
  groceries: ShoppingCart, eating_out: Utensils, clothes: Shirt, accessories: Gem,
  rent_utilities: Home, health: Heart, school: BookOpen, transportation: Car,
  vacation: Plane, entertainment: Tv, subscriptions: Smartphone, personal_care: Sparkles, other: Package,
}

const sizeMap = {
  sm: { wrap: 'w-8 h-8 rounded-xl', icon: 15 },
  md: { wrap: 'w-10 h-10 rounded-xl', icon: 18 },
  lg: { wrap: 'w-12 h-12 rounded-2xl', icon: 22 },
}

export default function CategoryIcon({ id, size = 'md', className = '' }: { id: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const cfg = getCategoryConfig(id as any)
  const Icon = iconMap[id] ?? Package
  const s = sizeMap[size]

  return (
    <div className={`${s.wrap} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ backgroundColor: cfg.color + '18' }}
    >
      <Icon size={s.icon} style={{ color: cfg.color }} strokeWidth={2} />
    </div>
  )
}
