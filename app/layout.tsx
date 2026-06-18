import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Budget',
  description: 'Personal budget tracker',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Budget' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, themeColor: '#0d0d12',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head><link rel="apple-touch-icon" href="/icon-192.png" /></head>
      <body style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', background: '#0d0d12' }}>
        <div className="max-w-md mx-auto min-h-screen relative">{children}</div>
      </body>
    </html>
  )
}
