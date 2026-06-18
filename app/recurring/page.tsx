'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import CategoryIcon from '@/components/CategoryIcon'
import { CATEGORIES } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils'
import { getRecurring, addRecurring, deleteRecurring, type Recurring } from '@/lib/store'
import { Plus, Trash2, RefreshCw, CheckCircle2, ChevronLeft } from 'lucide-react'

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
    if (!amount || !category) { setFormError('Required'); return }
    addRecurring({ amount: parseFloat(amount), category, note, frequency, next_due: nextDue, active: true })
    setSuccess(true)
    setTimeout(() => { setShowForm(false); setSuccess(false); setAmount(''); setCategory(''); setNote(''); refresh() }, 900)
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-28 px-5 pt-14">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center tap" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <ChevronLeft size={16} style={{ color: 'var(--text-2)' }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Recurring</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold tap"
            style={{ background: 'var(--accent)', color: '#fff' }}
          ><Plus size={15} /> Add</button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <form onSubmit={handleAdd} className="card p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>New Recurring</h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold" style={{ color: 'var(--text-3)' }}>$</span>
                  <input type="number" inputMode="decimal" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                    className="flex-1 text-2xl font-extrabold outline-none bg-transparent placeholder:opacity-20"
                    style={{ color: 'var(--text-1)' }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl tap ${category === cat.id ? 'ring-2 ring-offset-2 ring-offset-[#1a1a24]' : ''}`}
                      style={{ background: category === cat.id ? cat.color + '20' : 'var(--surface-2)', ...(category === cat.id ? { ringColor: cat.color } : {}) }}
                    >
                      <CategoryIcon id={cat.id} size="sm" />
                      <span className="text-[8px] font-medium" style={{ color: 'var(--text-2)' }}>{cat.label}</span>
                    </button>
                  ))}
                </div>

                <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Spotify, Rent..."
                  className="outline-none bg-transparent font-medium placeholder:opacity-20" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}
                />

                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>Frequency</p>
                    <div className="flex gap-2">
                      {(['monthly', 'weekly'] as const).map(f => (
                        <button key={f} type="button" onClick={() => setFrequency(f)}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold tap"
                          style={frequency === f ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--text-3)' }}
                        >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>First due</p>
                    <input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)}
                      className="w-full outline-none bg-transparent text-sm font-medium" style={{ color: 'var(--text-1)', colorScheme: 'dark', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}
                    />
                  </div>
                </div>

                {formError && <p className="text-red-400 text-sm">{formError}</p>}

                <motion.button type="submit" whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-white accent-glow"
                  style={{ background: success ? 'var(--green)' : 'linear-gradient(135deg, var(--accent), #a78bfa)' }}
                >
                  {success ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Saved!</span> : 'Save'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {items.length === 0 ? (
          <div className="card p-10 text-center">
            <RefreshCw size={28} className="mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
            <p className="font-semibold" style={{ color: 'var(--text-1)' }}>No recurring yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Add rent, subscriptions, etc.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <CategoryIcon id={item.category} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-1)' }}>{item.note || item.category}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} · next{' '}
                      {new Date(item.next_due + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{formatCurrency(item.amount)}</p>
                    <button onClick={() => { deleteRecurring(item.id); refresh() }} className="mt-0.5 tap" style={{ color: 'var(--text-3)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Nav />
      </div>
    </PageTransition>
  )
}
