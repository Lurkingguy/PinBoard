'use client'
import { useState, useRef } from 'react'
import { X, Camera, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@/lib/types'

interface EditProfileModalProps {
  user: User
  onClose: () => void
  onSuccess: (updatedUser: User) => void
}

export default function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Chọn file ảnh nhé.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Ảnh phải nhỏ hơn 5MB.'); return }
    setAvatarFile(file); setError('')
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      let newAvatarUrl = user.avatar_url
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `avatars/${user.id}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('posts').upload(filePath, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(filePath)
        newAvatarUrl = `${publicUrl}?t=${Date.now()}`
      }
      const { error: updateError } = await supabase.from('users').update({ avatar_url: newAvatarUrl }).eq('id', user.id)
      if (updateError) throw updateError
      onSuccess({ ...user, avatar_url: newAvatarUrl }); onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-bold text-primary">Chỉnh sửa hồ sơ</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-elevated transition-colors text-muted hover:text-primary">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full overflow-hidden bg-elevated border-2 border-border flex items-center justify-center">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <span className="text-primary text-3xl font-bold">{user.email?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-primary">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-muted mt-0.5">{user.email}</p>
                <button onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-accent hover:text-primary transition-colors mt-1.5 underline underline-offset-2">
                  Change profile picture
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {error && <p className="text-danger text-sm bg-danger/10 border border-danger/20 px-4 py-2.5 rounded-xl">{error}</p>}

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-primary hover:bg-elevated transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading || !avatarFile}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold
                  hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Check size={15} /> Save</>}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
