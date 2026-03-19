'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, User, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Post } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import PostDetailModal from '@/components/PostDetailModal'

interface PostCardProps {
  post: Post
  currentUserId?: string | null
  onDelete?: (postId: string) => void
  onCaptionUpdate?: (postId: string, newCaption: string) => void
}

export default function PostCard({ post, currentUserId, onDelete, onCaptionUpdate }: PostCardProps) {
  const isOwner = currentUserId === post.user_id

  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [heartAnim, setHeartAnim] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(post.caption || '')
  const [caption, setCaption] = useState(post.caption || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showDetail, setShowDetail] = useState(false)  // 👈 state mở modal

  const supabase = createClient()

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!currentUserId) { window.location.href = '/login'; return }
    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 600)
    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id })
    } else {
      await supabase.from('likes').delete().match({ user_id: currentUserId, post_id: post.id })
    }
  }

  const handleSaveCaption = async () => {
    setSaving(true)
    const trimmed = editValue.trim()
    const { error } = await supabase.from('posts').update({ caption: trimmed || null }).eq('id', post.id)
    if (!error) { setCaption(trimmed); onCaptionUpdate?.(post.id, trimmed) }
    setEditing(false); setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const url = new URL(post.image_url)
      const pathAfterBucket = url.pathname.split('/posts/')[1]
      if (pathAfterBucket) await supabase.storage.from('posts').remove([pathAfterBucket])
    } catch (_) {}
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) { onDelete?.(post.id) } else { setDeleting(false); setConfirmDelete(false) }
  }

  return (
    <>
      <motion.div
        className="masonry-item group relative"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        layout
      >
        <div className="relative rounded-2xl overflow-hidden bg-surface border border-border
          hover:border-elevated hover:shadow-xl hover:shadow-black/40 transition-all duration-300">

          {/* ── Ảnh — click để mở modal ── */}
          <div className="relative overflow-hidden">
            <img
              src={post.image_url}
              alt={caption || 'Post'}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
              loading="lazy"
              onClick={() => setShowDetail(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />

            {/* Like button */}
            <button
              onClick={handleLike}
              className={`absolute top-2.5 right-2.5 p-2.5 rounded-xl backdrop-blur-sm transition-all duration-200
                ${isLiked
                  ? 'bg-accent/90 text-white'
                  : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/70'
                } hover:scale-110 active:scale-95`}
            >
              <Heart size={15} className={`transition-all ${isLiked ? 'fill-white' : ''} ${heartAnim ? 'scale-125' : ''}`} />
            </button>

            {/* Owner menu */}
            {isOwner && (
              <div className="absolute top-2.5 left-2.5">
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); setConfirmDelete(false) }}
                  className="p-2 rounded-xl bg-black/50 backdrop-blur-sm text-white/70
                    opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all hover:scale-110"
                >
                  <MoreHorizontal size={15} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      className="absolute top-10 left-0 bg-elevated border border-border rounded-xl shadow-xl overflow-hidden z-20 min-w-[140px]"
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); setEditing(true); setMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-primary hover:bg-border transition-colors"
                      >
                        <Pencil size={13} className="text-muted" /> Edit caption
                      </button>

                      {!confirmDelete ? (
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 size={13} /> Delete post
                        </button>
                      ) : (
                        <div className="px-3 py-2.5 space-y-2">
                          <p className="text-xs text-muted">Chắc chưa?</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete() }}
                              disabled={deleting}
                              className="flex-1 py-1 bg-danger text-white text-xs rounded-lg hover:bg-danger/80 transition-colors disabled:opacity-60"
                            >
                              {deleting ? '…' : 'Xoá'}
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
                              className="flex-1 py-1 bg-border text-primary text-xs rounded-lg hover:bg-elevated transition-colors"
                            >
                              Thôi
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="p-3">
            {editing ? (
              <div className="mb-2" onClick={e => e.stopPropagation()}>
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  rows={2}
                  maxLength={280}
                  autoFocus
                  className="w-full text-sm px-2.5 py-2 rounded-lg border border-border bg-base text-primary
                    resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
                />
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={handleSaveCaption}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1 bg-accent text-white text-xs rounded-lg hover:bg-accent/80 disabled:opacity-50 transition-all"
                  >
                    <Check size={11} /> {saving ? '…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditValue(caption) }}
                    className="flex items-center gap-1 px-3 py-1 bg-border text-primary text-xs rounded-lg hover:bg-elevated transition-all"
                  >
                    <X size={11} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              caption && <p className="text-sm text-primary/80 line-clamp-2 mb-2 leading-snug">{caption}</p>
            )}

            <div className="flex items-center justify-between">
              {post.users && (
                <Link href={`/profile/${post.user_id}`} className="flex items-center gap-1.5 group/a" onClick={e => e.stopPropagation()}>
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-elevated flex items-center justify-center flex-shrink-0">
                    {post.users.avatar_url
                      ? <img src={post.users.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <User size={11} className="text-muted" />
                    }
                  </div>
                  <span className="text-xs text-muted group-hover/a:text-primary transition-colors truncate max-w-[100px]">
                    {post.users.email?.split('@')[0]}
                  </span>
                </Link>
              )}
              {likesCount > 0 && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Heart size={11} className="fill-accent text-accent" />
                  {likesCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Post Detail Modal ── */}
      {showDetail && (
        <PostDetailModal
          post={{ ...post, caption, is_liked: isLiked, likes_count: likesCount }}
          currentUserId={currentUserId || null}
          onClose={() => setShowDetail(false)}
          onLikeChange={(_, liked, count) => { setIsLiked(liked); setLikesCount(count) }}
        />
      )}
    </>
  )
}
