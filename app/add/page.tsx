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
  for (const p of patterns) {
    const m = text.match(p)
    if (m) { const v = parseFloat(m[1].replace(',', '')); if (v > 0) return v }
  }
  const all = [...text.matchAll(/\$?\s*([\d,]+\.\d{2})/g)]
    .map(m => parseFloat(m[1].replace(',', '')))
    .filter(v => v > 0 && v < 10000)
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

  const displayAmount = amount ? `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true); setScanPct(0); setScanMsg(''); setError('')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: (m) => { if (m.status === 'recognizing text') setScanPct(Math.round((m.progress ?? 0) * 100)) },
      })
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      const val = extractAmount(text)
      if (val) { setAmount(val.toFixed(2)); setScanMsg(`Found ${formatAmt(val)} — verify below`) }
      else setScanMsg('Amount not found — enter manually')
    } catch { setError('Scan failed. Enter manually.') }
    finally { setScanning(false); setScanPct(0) }
  }

  const formatAmt = (v: number) => `$${v.toFixed(2)}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) { setError('Pick an amount and category.'); return }
    addTransaction({ amount: parseFloat(amount), category, note, date, is_recurring_instance: false })
    setSuccess(true)
    setTimeout(() => router.push('/'), 1000)
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" style={{ background: 'var(--app-bg)' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white card-shadow flex items-center justify-center tap">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Add Expense</h1>
          <button onClick={() => fileRef.current?.click()} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white card-shadow text-indigo-600 text-xs font-semibold tap disabled:opacity-50"
          >
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <ScanLine size={13} />}
            {scanning ? `${scanPct}%` : 'Scan'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />
        </div>

        {/* Scan progress */}
        {scanning && (
          <div className="mx-5 mb-3">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${scanPct}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">Reading receipt...</p>
          </div>
        )}

        {/* Scan result */}
        <AnimatePresence>
          {scanMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-5 mb-3 px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-indigo-500" />
              <p className="text-xs font-medium text-indigo-700">{scanMsg}</p>
              <button onClick={() => setScanMsg('')} className="ml-auto text-indigo-300 hover:text-indigo-500">
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="px-5 flex flex-col gap-4">

          {/* Amount display */}
          <div className="bg-white rounded-3xl card-shadow p-6 text-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">Amount</p>
            <motion.p
              key={amount}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-bold tracking-tight mb-4 ${amount ? 'text-gray-900' : 'text-gray-200'}`}
            >
              {displayAmount}
            </motion.p>
            <input
              type="number" inputMode="decimal" step="0.01" min="0"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-center text-lg text-gray-600 outline-none bg-gray-50 rounded-2xl py-3 px-4 font-medium placeholder:text-gray-300"
            />
          </div>

          {/* Category grid */}
          <div className="bg-white rounded-3xl card-shadow p-5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">Category</p>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all tap ${
                    category === cat.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                  }`}
                  style={category === cat.id ? { backgroundColor: cat.bg } : { backgroundColor: '#f9fafb' }}
                >
                  <CategoryIcon id={cat.id} size="sm" className={category === cat.id ? '' : 'opacity-70'} />
                  <span className="text-[9px] text-gray-600 text-center leading-tight font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note & Date */}
          <div className="bg-white rounded-3xl card-shadow p-5 flex flex-col gap-5">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Note</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full mt-2 text-gray-800 outline-none bg-transparent placeholder:text-gray-300 font-medium"
              />
            </div>
            <div className="w-full h-px bg-gray-50" />
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full mt-2 text-gray-800 outline-none bg-transparent font-medium"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          {/* Submit */}
          <motion.button type="submit" disabled={success} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-60"
            style={{
              background: success
                ? '#10b981'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: success
                ? '0 8px 24px rgba(16,185,129,0.3)'
                : '0 8px 24px rgba(79,70,229,0.35)',
            }}
          >
            {success
              ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Saved!</span>
              : 'Save Expense'
            }
          </motion.button>
        </form>

        <Nav />
      </div>
    </PageTransition>
  )
}
