# 📌 Pinboard — Pinterest-style Image Sharing App

A modern, minimal image-sharing app built with **Next.js 14**, **Tailwind CSS**, and **Supabase**.

**Features:** Masonry feed · Image uploads · Like/unlike · User profiles · Auth

---

## 🗂 Project Structure

```
pinboard/
├── app/
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── globals.css         # Global styles + masonry CSS
│   ├── page.tsx            # Home feed (masonry grid)
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── register/
│   │   └── page.tsx        # Registration page
│   └── profile/
│       └── [id]/
│           └── page.tsx    # User profile page
├── components/
│   ├── Navbar.tsx          # Top navigation bar
│   ├── PostCard.tsx        # Individual post card with like button
│   ├── SkeletonGrid.tsx    # Loading skeleton (shimmer effect)
│   └── UploadModal.tsx     # Image upload modal
├── lib/
│   ├── supabase.ts         # Browser Supabase client
│   ├── supabase-server.ts  # Server Supabase client
│   └── types.ts            # TypeScript interfaces
├── supabase-schema.sql     # Full DB schema (run in Supabase SQL Editor)
├── .env.local.example      # Environment variable template
└── README.md
```

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (free account)
2. Click **New Project**
3. Choose a name (e.g. `pinboard`), set a strong database password, choose a region close to you
4. Wait ~2 minutes for the project to provision

---

### Step 2 — Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (or press `Cmd+Enter`)

This creates:
- `users` table — user profiles
- `posts` table — image posts
- `likes` table — like relationships
- Storage bucket `posts` — for image files
- All Row Level Security (RLS) policies

---

### Step 3 — Configure Authentication

1. In Supabase, go to **Authentication → Providers**
2. Make sure **Email** provider is enabled (it is by default)
3. Optionally go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000` (for dev)

---

### Step 4 — Get Your API Keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (long JWT string)

---

### Step 5 — Configure Environment Variables

1. In the project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and fill in your values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

### Step 6 — Install Dependencies & Run

```bash
# Install all packages
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Pinboard app! 🎉

---

## 🌐 Environment Variables

| Variable | Description | Where to find |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your public anon key | Supabase → Settings → API → anon public |

> **Note:** Both variables start with `NEXT_PUBLIC_` which means they're safe to expose in the browser. They only allow operations permitted by your Row Level Security policies.

---

## 📋 Database Schema

```sql
-- Users (mirrors Supabase Auth)
users (
  id         UUID PRIMARY KEY,   -- Same as auth.users.id
  email      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)

-- Posts
posts (
  id         UUID PRIMARY KEY,
  image_url  TEXT,               -- Public URL from Supabase Storage
  caption    TEXT,
  user_id    UUID → users.id,
  created_at TIMESTAMPTZ
)

-- Likes (many-to-many between users and posts)
likes (
  id      UUID PRIMARY KEY,
  user_id UUID → users.id,
  post_id UUID → posts.id,
  UNIQUE(user_id, post_id)       -- One like per user per post
)
```

---

## 🔧 Troubleshooting

**"relation 'users' does not exist"**
→ You haven't run the SQL schema yet. Follow Step 2 above.

**Images not loading after upload**
→ Check that your storage bucket `posts` is set to **public** in Supabase → Storage.

**"new row violates row-level security policy"**
→ Make sure you ran all the `CREATE POLICY` statements in the schema SQL.

**Login redirects back to login page**
→ Check your `.env.local` file has the correct Supabase URL and anon key.

**Images upload but URL is wrong**
→ In Supabase → Storage → Buckets, make sure `posts` bucket exists and is public.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | React framework with file-based routing |
| **TypeScript** | Type safety throughout |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Supabase Auth** | Email/password authentication |
| **Supabase PostgreSQL** | Database for posts, users, likes |
| **Supabase Storage** | Image file hosting |
| **lucide-react** | Clean icon library |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `cream` | `#FAF9F7` | Page background |
| `charcoal` | `#2D2D2D` | Primary text, buttons |
| `mauve` | `#D4A0B0` | Accent color, liked state |
| `blush` | `#F2C4CE` | Decorative accents |
| `sage` | `#B8D4C8` | Secondary accents |
| `lavender` | `#C9C0D8` | Avatar backgrounds |

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add environment variables in Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy! Vercel auto-detects Next.js.

For production, update your Supabase **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`

---

## ✨ Bonus Features Included

- ✅ **Loading skeletons** — shimmer placeholders while posts load
- ✅ **Framer Motion animations** — smooth card entrance animations
- ✅ **Optimistic UI** — likes update instantly before DB confirms
- ✅ **Drag & drop** image upload
- ✅ **Image preview** before posting
- ✅ **Password strength indicator** on register
- ✅ **Responsive** — works on mobile, tablet, and desktop
- ✅ **Sticky navbar** with backdrop blur
- ✅ **Hover scale effect** on images
- ✅ **Profile stats** — post count and total likes received
