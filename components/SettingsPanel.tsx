'use client'
// components/SettingsPanel.tsx
// Panel settings trượt ra từ bên phải.
// Có toggle dark/light theme + các thông tin khác.

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { X, Sun, Moon, Monitor, Info, Palette } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // next-themes cần mounted mới đọc được theme hiện tại (tránh hydration mismatch)
  useEffect(() => { setMounted(true) }, [])

  const themeOptions = [
    { value: 'light', label: 'Sáng',   icon: Sun },
    { value: 'dark',  label: 'Tối',    icon: Moon },
    { value: 'system',label: 'Hệ thống', icon: Monitor },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel trượt từ phải sang */}
          <motion.div
            className="fixed right-0 top-0 h-full w-80 z-50 bg-surface border-l border-border shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Palette size={15} className="text-accent" />
                </div>
                <h2 className="font-bold text-primary text-base">Cài đặt</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted hover:text-primary hover:bg-elevated transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nội dung */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* ── Theme section ── */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                  Theme
                </p>

                <div className="space-y-2">
                  {themeOptions.map(({ value, label, icon: Icon }) => {
                    const isActive = mounted && theme === value
                    return (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                          ${isActive
                            ? 'bg-accent/10 border-accent/40 text-accent'
                            : 'bg-elevated border-border text-primary hover:border-accent/30 hover:bg-elevated'
                          }`}
                      >
                        <Icon size={17} />
                        <span className="text-sm font-medium">{label}</span>
                        {/* Chấm active */}
                        <div className={`ml-auto w-2 h-2 rounded-full transition-all ${
                          isActive ? 'bg-accent scale-100' : 'bg-border scale-75'
                        }`} />
                      </button>
                    )
                  })}
                </div>

                <p className="text-xs text-muted mt-3 leading-relaxed">
                  Theme <strong className="text-primary/60">System</strong> automatically follows your device's dark/light mode settings.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* ── About section ── */}
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                  About the app
                </p>
                <div className="bg-elevated rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">Pinboard</p>
                      <p className="text-xs text-muted">v1.0.0</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    A Pinterest-style image sharing app. Built with Next.js 14 + Supabase.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border">
              <p className="text-xs text-muted text-center">
                Made by Timberblack using Next.js &amp; Supabase
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
