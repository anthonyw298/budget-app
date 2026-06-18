'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Tag, PlusCircle, Clock, BarChart2 } from 'lucide-react'

const tabs = [
  { href: '/',          icon: Home,       label: 'Home' },
  { href: '/categories',icon: Tag,        label: 'Budget' },
  { href: '/add',       icon: PlusCircle, label: 'Add', primary: true },
  { href: '/history',   icon: Clock,      label: 'History' },
  { href: '/summary',   icon: BarChart2,  label: 'Summary' },
]

export default function Nav() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div
        className="w-full max-w-md glass border-t border-gray-200/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <div className="flex items-center justify-around px-3 pt-2 pb-1">
          {tabs.map((tab) => {
            const active = tab.href === '/'
              ? path === '/'
              : path.startsWith(tab.href)
            const Icon = tab.icon

            if (tab.primary) {
              return (
                <Link key={tab.href} href={tab.href} className="flex flex-col items-center -mt-4 tap">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}
                  >
                    <Icon size={22} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] mt-1 font-semibold text-indigo-500">Add</span>
                </Link>
              )
            }

            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 px-3 py-1 tap">
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? 'text-indigo-600' : 'text-gray-400'}
                  />
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
