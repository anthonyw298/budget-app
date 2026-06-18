'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import CategoryIcon from '@/components/CategoryIcon'
import { CATEGORIES } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils'
import { getRecurring, addRecurring, deleteRecurring, type Recurring } from '@/lib/store'
import { Plus, Trash2, RefreshCw, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RecurringPage() {
  const router = useRouter()
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
    setTimeout(() => { setShowForm(false); setSuccess(false); setAmount(''); setCategory(''); setNote(''); refresh() }, 900)
  }

  const handleDelete = (id: string) => { deleteRecurring(id); refresh() }

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" style={{ background: 'var(--app-bg)' }}>

        {/* Header */}
        <div className="px-5 pt-14 pb-5" style={{ background: 'linear-gradient(145deg, #0f0c29 0%, #302b63 55%, #24243e 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center tap">
                <ChevronLeft size={16} className="text-white/70" />
              </button>
              <h1 className="text-xl font-bold text-white">Recurring</h1>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-semibold tap"
            >
              <Plus size={15} /> Add
            </button>
          </div>
          <div className="h-5 bg-[var(--app-bg)] rounded-t-[20px] mt-4 -mx-5" />
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-5 mb-4"
            >
              <form onSubmit={handleAdd} className="bg-white rounded-3xl card-shadow p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">New Recurring</h3>

                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Amount</label>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xl font-bold text-gray-300">$</span>
                    <input type="number" inputMode="decimal" step="0.01" value={amount}
                      onChange={e => setAmount(e.target.value)} placeholder="0.00"
                      className="flex-1 text-2xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 block">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all tap ${category === cat.id ? 'ring-2 ring-indigo-500 ring-offset-1' : 'bg-gray-50'}`}
                        style={category === cat.id ? { backgroundColor: cat.bg } : {}}
                      >
                        <CategoryIcon id={cat.id} size="sm" />
                        <span className="text-[9px] text-gray-600 text-center leading-tight font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Note</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder="e.g. Spotify, Rent..."
                    className="w-full mt-2 text-gray-800 outline-none bg-transparent border-b border-gray-100 pb-1 placeholder:text-gray-300 font-medium"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Frequency</label>
                    <div className="flex gap-2 mt-2">
                      {(['monthly', 'weekly'] as const).map(f => (
                        <button key={f} type="button" onClick={() => setFrequency(f)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all tap ${frequency === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">First due</label>
                    <input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)}
                      className="w-full mt-2 text-gray-700 outline-none bg-transparent text-sm font-medium border-b border-gray-100 pb-1"
                    />
                  </div>
                </div>

                {formError && <p className="text-red-500 text-sm font-medium">{formError}</p>}

                <motion.button type="submit" whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white"
                  style={{ background: success ? '#10b981' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {success ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Saved!</span> : 'Save'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="px-5 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl card-shadow p-10 text-center">
              <RefreshCw size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-gray-600">No recurring transactions</p>
              <p className="text-gray-400 text-sm mt-1">Add rent, subscriptions, and anything that repeats automatically.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl card-shadow overflow-hidden">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-0"
                  >
                    <CategoryIcon id={item.category} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.note || item.category}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} · next{' '}
                        {new Date(item.next_due + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{formatCurrency(item.amount)}</p>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-400 transition-colors mt-0.5 tap">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <Nav />
      </div>
    </PageTransition>
  )
}
