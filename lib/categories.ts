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
  color: string
  bg: string
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'groceries',       label: 'Groceries',       color: '#10b981', bg: '#ecfdf5' },
  { id: 'eating_out',      label: 'Eating Out',       color: '#f59e0b', bg: '#fffbeb' },
  { id: 'clothes',         label: 'Clothes',          color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'accessories',     label: 'Accessories',      color: '#ec4899', bg: '#fdf2f8' },
  { id: 'rent_utilities',  label: 'Rent & Utilities', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'health',          label: 'Health',           color: '#ef4444', bg: '#fef2f2' },
  { id: 'school',          label: 'School',           color: '#06b6d4', bg: '#ecfeff' },
  { id: 'transportation',  label: 'Transport',        color: '#f97316', bg: '#fff7ed' },
  { id: 'vacation',        label: 'Vacation',         color: '#14b8a6', bg: '#f0fdfa' },
  { id: 'entertainment',   label: 'Entertainment',    color: '#a855f7', bg: '#faf5ff' },
  { id: 'subscriptions',   label: 'Subscriptions',    color: '#6366f1', bg: '#eef2ff' },
  { id: 'personal_care',   label: 'Personal Care',    color: '#d946ef', bg: '#fdf4ff' },
  { id: 'other',           label: 'Other',            color: '#6b7280', bg: '#f9fafb' },
]

export const getCategoryConfig = (id: Category): CategoryConfig =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
