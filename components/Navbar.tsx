'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Upload, LogOut, User, Settings } from 'lucide-react'
import type { User as UserType } from '@/lib/types'
import SettingsPanel from '@/components/SettingsPanel'

const supabase = createClient()

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (cancelled) return
      if (authUser) {
        const { data } = await supabase
          .from('users').select('*').eq('id', authUser.id).single()
        if (!cancelled) setUser(data)
      }
      if (!cancelled) setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-base/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="font-display text-lg font-bold text-primary hidden sm:block tracking-tight">
                Pinboard
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="w-8 h-8 rounded-full skeleton" />
              ) : user ? (
                <>
                  {/* Upload button */}
                  <Link
                    href="/?upload=true"
                    className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold
                      hover:bg-accent/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Upload size={15} />
                    <span className="hidden sm:inline">Upload</span>
                  </Link>

                  {/* Avatar */}
                  <Link
                    href={`/profile/${user.id}`}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-accent transition-all hover:scale-105"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-elevated flex items-center justify-center">
                        <User size={16} className="text-muted" />
                      </div>
                    )}
                  </Link>

                  {/* Sign out */}
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl text-muted hover:text-primary hover:bg-elevated transition-all"
                    title="Đăng xuất"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-muted hover:text-primary transition-colors px-2">
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="bg-accent text-white px-4 py-2 rounded-xl text-sm font-semibold
                      hover:bg-accent/80 transition-all hover:scale-[1.02]"
                  >
                    Sign up
                  </Link>
                </>
              )}

              {/* Settings button — luôn hiện dù đã login hay chưa */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-xl text-muted hover:text-primary hover:bg-elevated transition-all"
                title="Cài đặt"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
