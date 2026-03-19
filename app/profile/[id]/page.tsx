'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import SkeletonGrid from '@/components/SkeletonGrid'
import EditProfileModal from '@/components/EditProfileModal'
import type { Post, User } from '@/lib/types'
import { User as UserIcon, Grid, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Supabase client tạo 1 lần bên ngoài component
const supabase = createClient()

export default function ProfilePage() {
  const params = useParams()
  const profileId = params.id as string

  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)

  const isOwner = currentUserId === profileId

  useEffect(() => {
    if (!profileId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)

      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (cancelled) return
      setCurrentUserId(authUser?.id || null)

      const { data: userData, error: userError } = await supabase
        .from('users').select('*').eq('id', profileId).single()

      if (cancelled) return
      if (userError || !userData) { setNotFound(true); setLoading(false); return }
      setProfileUser(userData)

      const { data: postsData } = await supabase
        .from('posts')
        .select(`*, users (id, email, avatar_url)`)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (!postsData) { setLoading(false); return }

      let likedPostIds = new Set<string>()
      if (authUser) {
        const { data: likesData } = await supabase
          .from('likes').select('post_id').eq('user_id', authUser.id)
        likedPostIds = new Set(likesData?.map((l: any) => l.post_id) || [])
      }

      const { data: allLikes } = await supabase.from('likes').select('post_id')
      const likeCountMap: Record<string, number> = {}
      allLikes?.forEach((l: any) => {
        likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1
      })

      if (cancelled) return
      setPosts(postsData.map((post: any) => ({
        ...post,
        is_liked: likedPostIds.has(post.id),
        likes_count: likeCountMap[post.id] || 0,
      })))
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [profileId])

  const handlePostDeleted = (postId: string) =>
    setPosts(prev => prev.filter(p => p.id !== postId))

  const handleCaptionUpdated = (postId: string, newCaption: string) =>
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, caption: newCaption } : p))

  const handleProfileUpdated = (updatedUser: User) => {
    setProfileUser(updatedUser)
    setPosts(prev => prev.map(p => ({
      ...p,
      users: p.users ? { ...p.users, avatar_url: updatedUser.avatar_url } : p.users
    })))
  }

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {notFound ? (
          <div className="text-center py-24">
            <p className="text-muted font-medium">Không tìm thấy người dùng.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="flex flex-col items-center text-center mb-12"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mb-4 group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-elevated border-2 border-border flex items-center justify-center">
                  {profileUser?.avatar_url
                    ? <img src={profileUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    : <UserIcon size={36} className="text-muted" />
                  }
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={18} className="text-white" />
                  </button>
                )}
              </div>

              <h1 className="text-2xl font-bold text-primary mb-1">
                {profileUser?.email?.split('@')[0]}
              </h1>
              <p className="text-muted text-sm mb-4">{profileUser?.email}</p>

              {isOwner && (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-primary
                    border border-border px-3 py-1.5 rounded-full transition-all hover:border-accent/40 mb-4"
                >
                  <Pencil size={11} /> Chỉnh sửa hồ sơ
                </button>
              )}

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="font-bold text-primary text-lg">{posts.length}</p>
                  <p className="text-xs text-muted uppercase tracking-wide">Bài đăng</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="font-bold text-primary text-lg">{totalLikes}</p>
                  <p className="text-xs text-muted uppercase tracking-wide">Lượt thích</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-widest">
                <Grid size={12} /><span>Bài đăng</span>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🖼️</span>
                </div>
                <p className="text-muted text-sm">No posts yet.</p>
              </div>
            ) : (
              <div className="masonry-grid">
                <AnimatePresence>
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId}
                      onDelete={handlePostDeleted}
                      onCaptionUpdate={handleCaptionUpdated}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      {showEditProfile && profileUser && (
        <EditProfileModal
          user={profileUser}
          onClose={() => setShowEditProfile(false)}
          onSuccess={handleProfileUpdated}
        />
      )}
    </>
  )
}
