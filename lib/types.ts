// lib/types.ts
// Shared TypeScript types used across the app

export interface User {
  id: string
  email: string
  avatar_url: string | null
}

export interface Post {
  id: string
  image_url: string
  caption: string | null
  user_id: string
  created_at: string
  // Joined from users table
  users?: User
  // Count of likes for this post
  likes_count?: number
  // Whether the current user has liked this post
  is_liked?: boolean
}

export interface Like {
  id: string
  user_id: string
  post_id: string
}
