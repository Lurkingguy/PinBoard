'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import PostCard from '@/components/PostCard'
import SkeletonGrid from '@/components/SkeletonGrid'
import UploadModal from '@/components/UploadModal'
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'

// Tạo supabase client 1 lần duy nhất bên ngoài component — tránh tạo lại mỗi render
const supabase = createClient()

async function fetchAllPosts(uid: string | null): Promise<Post[]> {
  const { data: postsData, error } = await supabase
    .from('posts')
    .select(`*, users (id, email, avatar_url)`)
    .order('created_at', { ascending: false })

  if (error || !postsData) return []

  let likedPostIds = new Set<string>()
  if (uid) {
    const { data: likesData } = await supabase
      .from('likes').select('post_id').eq('user_id', uid)
    likedPostIds = new Set(likesData?.map((l: any) => l.post_id) || [])
  }

  const { data: allLikes } = await supabase.from('likes').select('post_id')
  const likeCountMap: Record<string, number> = {}
  allLikes?.forEach((l: any) => {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1
  })

  return postsData.map((post: any) => ({
    ...post,
    is_liked: likedPostIds.has(post.id),
    likes_count: likeCountMap[post.id] || 0,
  }))
}

function HomeFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get('upload') === 'true') setShowUpload(true)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // Lấy user
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || null

      if (cancelled) return
      setCurrentUserId(uid)

      // Fetch posts
      const result = await fetchAllPosts(uid)

      if (cancelled) return
      setPosts(result)
      setLoading(false)
    }

    load()

    // Cleanup — nếu component unmount thì bỏ qua kết quả
    return () => { cancelled = true }
  }, []) // chạy đúng 1 lần

  const handleCloseUpload = () => {
    setShowUpload(false)
    router.push('/')
  }

  const handleUploadSuccess = async () => {
    const result = await fetchAllPosts(currentUserId)
    setPosts(result)
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary italic mb-2 tracking-tight">
            Discover &amp; Inspire
          </h1>
          <p className="text-muted text-sm">A curated collection of beautiful things</p>
        </motion.div>

        {loading ? (
          <SkeletonGrid />
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🖼️</span>
            </div>
            <p className="text-muted font-medium">Chưa có bài đăng nào.</p>
            <p className="text-muted/60 text-sm mt-1">Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                onCaptionUpdate={(id, cap) => setPosts(prev => prev.map(p =>
                  p.id === id ? { ...p, caption: cap } : p
                ))}
              />
            ))}
          </div>
        )}
      </main>

      {showUpload && (
        <UploadModal onClose={handleCloseUpload} onSuccess={handleUploadSuccess} />
      )}
    </>
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-8"><SkeletonGrid /></div>
      }>
        <HomeFeed />
      </Suspense>
    </>
  )
}
