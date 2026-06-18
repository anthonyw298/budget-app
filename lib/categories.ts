export type Category =
  | 'groceries'
  | 'eating_out'
  | 'clothes'
  | 'accessories'
  | 'rent_utilities'
  | 'health'
  | 'school'
  | 'transportation'
  | 'vacation'
  | 'entertainment'
  | 'subscriptions'
  | 'personal_care'
  | 'other'

export interface CategoryConfig {
  id: Category
  label: string
  icon: string
  color: string
  bgColor: string
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'groceries', label: 'Groceries', icon: '🛒', color: '#22c55e', bgColor: '#dcfce7' },
  { id: 'eating_out', label: 'Eating Out', icon: '🍜', color: '#f97316', bgColor: '#ffedd5' },
  { id: 'clothes', label: 'Clothes', icon: '👗', color: '#a855f7', bgColor: '#f3e8ff' },
  { id: 'accessories', label: 'Accessories', icon: '👜', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'rent_utilities', label: 'Rent & Utilities', icon: '🏠', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'health', label: 'Health', icon: '💊', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'school', label: 'School', icon: '📚', color: '#0ea5e9', bgColor: '#e0f2fe' },
  { id: 'transportation', label: 'Transportation', icon: '🚗', color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'vacation', label: 'Vacation', icon: '✈️', color: '#14b8a6', bgColor: '#ccfbf1' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '📱', color: '#6366f1', bgColor: '#e0e7ff' },
  { id: 'personal_care', label: 'Personal Care', icon: '✨', color: '#d946ef', bgColor: '#fae8ff' },
  { id: 'other', label: 'Other', icon: '📦', color: '#6b7280', bgColor: '#f3f4f6' },
]

export const getCategoryConfig = (id: Category): CategoryConfig =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
