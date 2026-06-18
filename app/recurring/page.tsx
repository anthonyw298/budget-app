'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils'
import { getRecurring, addRecurring, deleteRecurring, type Recurring } from '@/lib/store'
import { Plus, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function RecurringPage() {
  const [items, setItems] = useState<Recurring[]>([])
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly')
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0])
  const [formError, setFormError] = useState('')

  const refresh = () => setItems(getRecurring())

  useEffect(() => { refresh() }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) { setFormError('Amount and category required.'); return }
    addRecurring({ amount: parseFloat(amount), category, note, frequency, next_due: nextDue, active: true })
    setSuccess(true)
    setTimeout(() => {
      setShowForm(false)
      setSuccess(false)
      setAmount(''); setCategory(''); setNote('')
      refresh()
    }, 900)
  }

  const handleDelete = (id: string) => {
    deleteRecurring(id)
    refresh()
  }

  return (
    <div className="pb-28 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Recurring</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-5 mb-4"
          >
            <form onSubmit={handleAdd} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
              <h3 className="font-bold text-gray-800">New Recurring</h3>

              <div>
                <label className="text-xs text-gray-400 font-medium">Amount ($)</label>
                <input
                  type="number" inputMode="decimal" step="0.01"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full mt-1 text-2xl font-bold text-gray-900 outline-none border-b border-gray-100 pb-1 bg-transparent"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium">Category</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-95 ${category === cat.id ? 'ring-2 ring-violet-500' : 'bg-gray-50'}`}
                      style={category === cat.id ? { backgroundColor: cat.bgColor } : {}}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-[9px] text-gray-600 text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium">Note</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Spotify, Rent..."
                  className="w-full mt-1 text-gray-800 outline-none border-b border-gray-100 pb-1 bg-transparent placeholder:text-gray-300"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium">Frequency</label>
                  <div className="flex gap-2 mt-1">
                    {(['monthly', 'weekly'] as const).map((f) => (
                      <button key={f} type="button" onClick={() => setFrequency(f)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${frequency === f ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium">First due</label>
                  <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)}
                    className="w-full mt-1 text-gray-800 outline-none border-b border-gray-100 pb-1 bg-transparent text-sm"
                  />
                </div>
              </div>

              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <motion.button type="submit" whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-2xl font-bold text-white"
                style={{ background: success ? '#22c55e' : 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
              >
                {success
                  ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Saved!</span>
                  : 'Save Recurring'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <RefreshCw size={40} className="text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No recurring transactions</p>
            <p className="text-gray-400 text-sm mt-1">Add rent, subscriptions, or anything that repeats</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item) => {
              const cfg = getCategoryConfig(item.category as any)
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: cfg.bgColor }}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.note || cfg.label}</p>
                    <p className="text-xs text-gray-400">
                      {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} · next {new Date(item.next_due + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(item.amount)}</p>
                    <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-400 transition-colors mt-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      <Nav />
    </div>
  )
}
