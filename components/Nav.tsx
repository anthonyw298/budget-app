'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, PlusCircle, Tag, BarChart2, Clock } from 'lucide-react'

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/categories', icon: Tag, label: 'Budget' },
  { href: '/add', icon: PlusCircle, label: 'Add', primary: true },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/summary', icon: BarChart2, label: 'Summary' },
]

export default function Nav() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-md glass border-t border-white/40 shadow-2xl" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
        <div className="flex items-end justify-around px-2 pt-2 pb-1">
          {tabs.map((tab) => {
            const active = path === tab.href || (tab.href !== '/' && path.startsWith(tab.href))
            const Icon = tab.icon

            if (tab.primary) {
              return (
                <Link key={tab.href} href={tab.href} className="flex flex-col items-center -mt-5">
                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-400/40"
                  >
                    <Icon size={26} className="text-white" />
                  </motion.div>
                  <span className="text-[10px] mt-1 text-violet-600 font-semibold">{tab.label}</span>
                </Link>
              )
            }

            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
                <motion.div whileTap={{ scale: 0.88 }} className="flex flex-col items-center gap-0.5">
                  <div className="relative">
                    <Icon size={22} className={active ? 'text-violet-600' : 'text-gray-400'} />
                    {active && (
                      <motion.div
                        layoutId="nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600"
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-violet-600' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
