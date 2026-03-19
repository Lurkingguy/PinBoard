-- ============================================================
-- Pinboard — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================


-- ────────────────────────────────────────
-- 1. USERS TABLE
-- Mirrors Supabase Auth users with extra profile fields.
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can read user profiles (for showing author info on posts)
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Allow insert during registration (called right after sign-up)
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);


-- ────────────────────────────────────────
-- 2. POSTS TABLE
-- Each post has an image URL and optional caption.
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url  TEXT NOT NULL,
  caption    TEXT,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view all posts (public feed)
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT USING (true);

-- Only authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────
-- 3. LIKES TABLE
-- Tracks which user liked which post.
-- A user can only like a post once (enforced by UNIQUE constraint).
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)  -- Prevents duplicate likes
);

-- Enable Row Level Security
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes (for showing like counts)
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

-- Only authenticated users can like posts
CREATE POLICY "Authenticated users can like posts"
  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only unlike their own likes
CREATE POLICY "Users can unlike their own likes"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);


-- ────────────────────────────────────────
-- 4. STORAGE BUCKET
-- Creates a public 'posts' bucket for storing uploaded images.
-- Run this separately if the bucket doesn't exist yet.
-- ────────────────────────────────────────

-- Create the storage bucket (public = images are publicly accessible via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images
CREATE POLICY "Public images are viewable by everyone"
  ON storage.objects FOR SELECT USING (bucket_id = 'posts');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ────────────────────────────────────────
-- 5. STORAGE — allow UPDATE (upsert) for avatars
-- Users can overwrite their own avatar file stored at avatars/<user_id>.*
-- ────────────────────────────────────────

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
