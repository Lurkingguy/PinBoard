'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const supabase = createClient()

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/'); router.refresh() }
  }

  return (
    <div className="min-h-screen flex bg-base">

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-surface border-r border-border items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-accent mx-auto mb-6 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-4xl font-extrabold text-primary mb-3 tracking-tight">Pinboard</h1>
          <p className="text-muted text-lg leading-relaxed">Lưu lại những gì truyền cảm hứng cho bạn.</p>
          <div className="flex justify-center gap-2 mt-8">
            {['#4F8EF7','#2E2E2E','#6B6B6B','#E8E8E8'].map((c, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">

        {/* ← Nút back về trang chủ */}
        <Link
          href="/"
          className="absolute top-5 left-5 flex items-center gap-2 text-sm text-muted
            hover:text-primary transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-elevated border border-border flex items-center justify-center
            group-hover:border-accent/40 group-hover:bg-accent/5 transition-all">
            <ArrowLeft size={15} />
          </div>
          <span className="hidden sm:inline">Về trang chủ</span>
        </Link>

        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent inline-flex items-center justify-center mb-3">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-extrabold text-primary">Pinboard</h1>
          </div>

          <h2 className="text-2xl font-bold text-primary mb-1">Chào mừng trở lại</h2>
          <p className="text-muted text-sm mb-8">Đăng nhập vào tài khoản của bạn</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-primary text-sm
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                  transition-all placeholder:text-muted"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-surface text-primary text-sm
                    focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                    transition-all placeholder:text-muted"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                className="text-danger text-sm bg-danger/10 border border-danger/20 px-4 py-2.5 rounded-xl"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-accent text-white rounded-xl font-semibold text-sm
                hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all hover:scale-[1.01] active:scale-[0.99]
                flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-accent hover:text-primary font-semibold transition-colors">
              Đăng ký
            </Link>
          </p>

          {/* Hoặc tiếp tục không cần login */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">hoặc</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Link
            href="/"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              border border-border text-sm text-muted hover:text-primary hover:border-primary/30
              transition-all hover:scale-[1.01]"
          >
            Tiếp tục với tư cách khách
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
