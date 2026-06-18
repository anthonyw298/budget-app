'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Nav from '@/components/Nav'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'
import { addTransaction } from '@/lib/store'
import { ChevronLeft, Loader2, CheckCircle2, ScanLine } from 'lucide-react'

function extractAmountFromText(text: string): number | null {
  const totalPatterns = [
    /(?:grand\s*total|total\s*due|amount\s*due|balance\s*due|total)[^\d]*\$?\s*([\d,]+\.\d{2})/i,
    /\$?\s*([\d,]+\.\d{2})\s*(?:total|due)/i,
  ]
  for (const pattern of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      const val = parseFloat(match[1].replace(',', ''))
      if (val > 0) return val
    }
  }
  const allAmounts = [...text.matchAll(/\$?\s*([\d,]+\.\d{2})/g)]
    .map((m) => parseFloat(m[1].replace(',', '')))
    .filter((v) => v > 0 && v < 10000)
  if (allAmounts.length === 0) return null
  return Math.max(...allAmounts)
}

export default function AddTransaction() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState<string | null>(null)

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setScanProgress(0)
    setScanResult(null)
    setError('')
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round((m.progress ?? 0) * 100))
          }
        },
      })
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      const extracted = extractAmountFromText(text)
      if (extracted !== null) {
        setAmount(extracted.toFixed(2))
        setScanResult(`Found $${extracted.toFixed(2)} — verify & pick a category`)
      } else {
        setScanResult('No amount found — enter manually')
      }
    } catch {
      setError('Scan failed. Enter amount manually.')
    } finally {
      setScanning(false)
      setScanProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) { setError('Amount and category are required.'); return }
    setLoading(true)
    setError('')
    addTransaction({
      amount: parseFloat(amount),
      category,
      note,
      date,
      is_recurring_instance: false,
    })
    setSuccess(true)
    setTimeout(() => router.push('/'), 1000)
  }

  const selectedCfg = category ? getCategoryConfig(category as any) : null

  return (
    <div className="pb-28 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Expense</h1>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
          >
            {scanning ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
            {scanning ? `${scanProgress}%` : 'Scan Receipt'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleReceiptScan} />
        </div>
      </div>

      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mb-3 px-4 py-2.5 rounded-2xl bg-violet-50 border border-violet-100 flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-violet-500 flex-shrink-0" />
          <p className="text-sm text-violet-700">{scanResult}</p>
        </motion.div>
      )}

      {scanning && (
        <div className="mx-5 mb-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${scanProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">Reading receipt...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-5 flex flex-col gap-5">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Amount</label>
          <div className="flex items-center mt-2">
            <span className="text-3xl font-bold text-gray-300 mr-1">$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-4xl font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-200"
              autoFocus
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</label>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all active:scale-95 ${
                  category === cat.id ? 'ring-2 ring-offset-1 ring-violet-500' : 'bg-gray-50'
                }`}
                style={category === cat.id ? { backgroundColor: cat.bgColor } : {}}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[9px] text-gray-600 text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Note</label>
            <input
              type="text"
              placeholder={selectedCfg ? `e.g. ${selectedCfg.label}` : 'Add a note...'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-2 text-gray-800 outline-none bg-transparent border-b border-gray-100 pb-2 placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-2 text-gray-800 outline-none bg-transparent border-b border-gray-100 pb-2"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <motion.button
          type="submit"
          disabled={loading || success}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-purple-300/40 disabled:opacity-60"
          style={{ background: success ? '#22c55e' : 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
        >
          {success ? (
            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={20} /> Saved!</span>
          ) : loading ? (
            <Loader2 size={20} className="animate-spin mx-auto" />
          ) : 'Save Expense'}
        </motion.button>
      </form>

      <Nav />
    </div>
  )
}
