'use client'
// components/PostDetailModal.tsx
// Modal hiện chi tiết post khi user click vào card.
// Hiện ảnh to bên trái + info (caption, author, likes) bên phải.

import { useState } from 'react'
import Link from 'next/link'
import { X, Heart, User, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import type { Post } from '@/lib/types'

interface PostDetailModalProps {
  post: Post
  currentUserId: string | null
  onClose: () => void
  onLikeChange?: (postId: string, isLiked: boolean, newCount: number) => void
}

export default function PostDetailModal({ post, currentUserId, onClose, onLikeChange }: PostDetailModalProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [heartAnim, setHeartAnim] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    if (!currentUserId) { window.location.href = '/login'; return }
    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 600)
    onLikeChange?.(post.id, newLiked, newLiked ? likesCount + 1 : likesCount - 1)

    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUserId, post_id: post.id })
    } else {
      await supabase.from('likes').delete().match({ user_id: currentUserId, post_id: post.id })
    }
  }

  // Format ngày đăng
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop — click để đóng */}
        <motion.div
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal window */}
        <motion.div
          className="relative bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden
            w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row z-10"
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          {/* ── Bên trái: Ảnh ── */}
          <div className="flex-1 bg-base flex items-center justify-center min-h-[300px] max-h-[90vh] overflow-hidden">
            <img
              src={post.image_url}
              alt={post.caption || 'Post'}
              className="w-full h-full object-contain max-h-[90vh]"
            />
          </div>

          {/* ── Bên phải: Info ── */}
          <div className="w-full md:w-80 flex flex-col border-l border-border flex-shrink-0">

            {/* Header: avatar + tên + close button */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              {post.users ? (
                <Link
                  href={`/profile/${post.user_id}`}
                  onClick={onClose}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-elevated border border-border flex-shrink-0">
                    {post.users.avatar_url
                      ? <img src={post.users.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-muted" /></div>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                      {post.users.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted">{formatDate(post.created_at)}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted hover:text-primary hover:bg-elevated transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Caption */}
            <div className="flex-1 overflow-y-auto p-4">
              {post.caption ? (
                <p className="text-primary/90 text-sm leading-relaxed">{post.caption}</p>
              ) : (
                <p className="text-muted text-sm italic">Không có caption.</p>
              )}
            </div>

            {/* Footer: like + download */}
            <div className="p-4 border-t border-border space-y-3">
              {/* Like button lớn */}
              <button
                onClick={handleLike}
                className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm
                  transition-all hover:scale-[1.02] active:scale-[0.98]
                  ${isLiked
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'bg-elevated border border-border text-primary hover:border-accent/50'
                  }`}
              >
                <Heart
                  size={18}
                  className={`transition-all duration-300 ${isLiked ? 'fill-white' : ''} ${heartAnim ? 'scale-125' : ''}`}
                />
                {isLiked ? 'Đã thích' : 'Thích'}
                {likesCount > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isLiked ? 'bg-white/20' : 'bg-border'}`}>
                    {likesCount}
                  </span>
                )}
              </button>

              {/* Download button */}
              <a
                href={post.image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border
                  text-muted hover:text-primary hover:border-primary/30 text-sm transition-all hover:scale-[1.01]"
              >
                <Download size={15} />
                Tải ảnh xuống
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
