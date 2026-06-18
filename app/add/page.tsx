'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '@/components/Nav'
import PageTransition from '@/components/PageTransition'
import CategoryIcon from '@/components/CategoryIcon'
import { CATEGORIES } from '@/lib/categories'
import { addTransaction } from '@/lib/store'
import { X, ScanLine, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react'

function extractAmount(text: string): number | null {
  const patterns = [
    /(?:grand\s*total|total\s*due|amount\s*due|balance\s*due|total)[^\d]*\$?\s*([\d,]+\.\d{2})/i,
    /\$?\s*([\d,]+\.\d{2})\s*(?:total|due)/i,
  ]
  for (const p of patterns) { const m = text.match(p); if (m) { const v = parseFloat(m[1].replace(',', '')); if (v > 0) return v } }
  const all = [...text.matchAll(/\$?\s*([\d,]+\.\d{2})/g)].map(m => parseFloat(m[1].replace(',', ''))).filter(v => v > 0 && v < 10000)
  return all.length ? Math.max(...all) : null
}

export default function AddPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [success, setSuccess] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanPct, setScanPct] = useState(0)
  const [scanMsg, setScanMsg] = useState('')
  const [error, setError] = useState('')

  const display = amount ? `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setScanning(true); setScanPct(0); setScanMsg(''); setError('')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, { logger: m => { if (m.status === 'recognizing text') setScanPct(Math.round((m.progress ?? 0) * 100)) } })
      const { data: { text } } = await worker.recognize(file); await worker.terminate()
      const val = extractAmount(text)
      if (val) { setAmount(val.toFixed(2)); setScanMsg(`Found $${val.toFixed(2)}`) } else setScanMsg('No amount found')
    } catch { setError('Scan failed') } finally { setScanning(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) { setError('Pick amount and category'); return }
    addTransaction({ amount: parseFloat(amount), category, note, date, is_recurring_instance: false })
    setSuccess(true); setTimeout(() => router.push('/'), 1000)
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-28 px-5 pt-14">

        {/* Top */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center tap" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={16} style={{ color: 'var(--text-2)' }} />
          </button>
          <h1 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>Add Expense</h1>
          <button onClick={() => fileRef.current?.click()} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold tap disabled:opacity-50"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <ScanLine size={13} />}
            {scanning ? `${scanPct}%` : 'Scan'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />
        </div>

        {scanning && (
          <div className="mb-4">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${scanPct}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        )}

        <AnimatePresence>
          {scanMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card-2 flex items-center gap-2 px-4 py-2.5 mb-4"
            >
              <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
              <p className="text-xs font-medium flex-1" style={{ color: 'var(--accent-bright)' }}>{scanMsg}</p>
              <button onClick={() => setScanMsg('')} className="tap" style={{ color: 'var(--text-3)' }}><X size={13} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Amount */}
          <div className="card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Amount</p>
            <motion.p key={amount} initial={{ scale: 0.97 }} animate={{ scale: 1 }}
              className="text-5xl font-extrabold tracking-tight mb-4"
              style={{ color: amount ? 'var(--text-1)' : 'var(--text-3)' }}
            >
              {display}
            </motion.p>
            <input type="number" inputMode="decimal" step="0.01" min="0" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="0.00"
              className="w-full text-center text-lg font-semibold outline-none rounded-2xl py-3 px-4 placeholder:opacity-30"
              style={{ background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)' }}
            />
          </div>

          {/* Category grid */}
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-3)' }}>Category</p>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all tap ${category === cat.id ? 'ring-2 ring-offset-2 ring-offset-[#1a1a24]' : ''}`}
                  style={{
                    background: category === cat.id ? cat.color + '20' : 'var(--surface-2)',
                    borderColor: category === cat.id ? cat.color : 'transparent',
                    ...(category === cat.id ? { ringColor: cat.color } : {}),
                  }}
                >
                  <CategoryIcon id={cat.id} size="sm" />
                  <span className="text-[9px] text-center leading-tight font-medium" style={{ color: 'var(--text-2)' }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note & Date */}
          <div className="card p-5 flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Note</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="What was this for?"
                className="w-full mt-2 outline-none bg-transparent font-medium placeholder:opacity-30"
                style={{ color: 'var(--text-1)' }}
              />
            </div>
            <div className="h-px" style={{ background: 'var(--border)' }} />
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full mt-2 outline-none bg-transparent font-medium"
                style={{ color: 'var(--text-1)', colorScheme: 'dark' }}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

          <motion.button type="submit" disabled={success} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-60 accent-glow"
            style={{ background: success ? 'var(--green)' : 'linear-gradient(135deg, var(--accent), #a78bfa)' }}
          >
            {success ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Saved!</span> : 'Save Expense'}
          </motion.button>
        </form>

        <Nav />
      </div>
    </PageTransition>
  )
}
