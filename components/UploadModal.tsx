'use client'
import { useState, useRef } from 'react'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!selected.type.startsWith('image/')) { setError('Chọn file ảnh nhé.'); return }
    if (selected.size > 10 * 1024 * 1024) { setError('Ảnh phải nhỏ hơn 10MB.'); return }
    setFile(selected); setError('')
    setPreview(URL.createObjectURL(selected))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (!dropped) return
    if (!dropped.type.startsWith('image/')) { setError('Chọn file ảnh nhé.'); return }
    if (dropped.size > 10 * 1024 * 1024) { setError('Ảnh phải nhỏ hơn 10MB.'); return }
    setFile(dropped); setError('')
    setPreview(URL.createObjectURL(dropped))
  }

  const handleSubmit = async () => {
    if (!file) { setError('Chọn ảnh trước nhé.'); return }
    setLoading(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Chưa đăng nhập')
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName)
      const { error: insertError } = await supabase.from('posts').insert({
        image_url: publicUrl,
        caption: caption.trim() || null,
        user_id: user.id,
      })
      if (insertError) throw insertError
      onSuccess(); onClose()
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra, thử lại nhé.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-bold text-primary">Create Post</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-elevated transition-colors text-muted hover:text-primary">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer
                ${preview ? 'border-transparent' : 'border-border hover:border-accent hover:bg-accent/5'}`}
              onClick={() => !preview && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full rounded-2xl object-cover max-h-64" />
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <ImagePlus size={24} className="text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-primary/80">Drag and drop an image here</p>
                    <p className="text-sm mt-1 text-muted">or click to select · PNG, JPG, WebP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* Caption */}
            <div>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Thêm caption… (tuỳ chọn)"
                rows={3}
                maxLength={280}
                className="w-full px-4 py-3 rounded-xl border border-border bg-base text-primary text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                  transition-all placeholder:text-muted"
              />
              <p className="text-xs text-muted text-right mt-1">{caption.length}/280</p>
            </div>

            {error && <p className="text-danger text-sm bg-danger/10 border border-danger/20 px-4 py-2.5 rounded-xl">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="w-full py-3 bg-accent text-white rounded-xl font-semibold text-sm
                hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : 'Upload to Pinboard'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
