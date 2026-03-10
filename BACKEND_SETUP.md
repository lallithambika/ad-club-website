# Backend Setup Guide - AD Club Website

## Overview

The AD Club website uses Supabase as its backend for database and storage. The backend setup is now **automatic** - the application will initialize the database automatically when you visit `/setup`.

## What Gets Initialized

### Database Tables

1. **blog_posts** - Store blog articles
   - `id` (UUID) - Unique post identifier
   - `title` (TEXT) - Post title
   - `content` (TEXT) - Post content/body
   - `tags` (TEXT[]) - Array of tags for categorization
   - `featured` (BOOLEAN) - Featured post flag
   - `status` (TEXT) - 'draft' or 'published'
   - `cover_image_url` (TEXT) - URL to cover image
   - `created_at` (TIMESTAMP) - Auto-generated creation time

2. **blog_likes** - Track post likes
   - `id` (UUID) - Like identifier
   - `post_id` (UUID) - Reference to blog_posts
   - `user_id` (UUID) - User who liked
   - `created_at` (TIMESTAMP) - When like was created

3. **blog_comments** - Store post comments
   - `id` (UUID) - Comment identifier
   - `post_id` (UUID) - Reference to blog_posts
   - `user_name` (TEXT) - Commenter's name
   - `message` (TEXT) - Comment content
   - `created_at` (TIMESTAMP) - When comment was created

### Storage Bucket

- **blog-images** - Public bucket for blog post cover images
  - Max file size: 5MB
  - Public read access
  - Authenticated write access

### Row Level Security (RLS) Policies

- **blog_posts**: Public read for published posts only
- **blog_likes**: Public read/write for engagement
- **blog_comments**: Public read/write for discussions
- **blog-images**: Public read, authenticated write

## Quick Start

### Automatic Setup (Recommended)

1. Visit `http://localhost:3000/setup` (or your production URL + `/setup`)
2. The page will automatically initialize the database
3. You'll see a success message when complete
4. Click "View Blog" or "Create Post" to get started

### What Happens During Auto-Setup

```
POST /api/init
├── Create blog_posts table
├── Create blog_likes table
├── Create blog_comments table
├── Create indexes for performance
├── Enable Row Level Security (RLS)
├── Create RLS policies
└── Create blog-images storage bucket
```

## API Endpoints

### Initialize Database

**Endpoint:** `POST /api/init`

**Description:** Automatically creates all database tables, indexes, RLS policies, and storage bucket

**Response:**
```json
{
  "status": "success",
  "message": "Database initialized automatically",
  "tables": {
    "blog_posts": true,
    "blog_likes": true,
    "blog_comments": true
  },
  "storage": {
    "blog-images": true
  },
  "next_steps": [
    "Visit /blog to view published posts",
    "Visit /admin/blog to create new posts",
    "Upload images to posts using the admin interface"
  ]
}
```

### Check Status

**Endpoint:** `GET /api/init`

**Description:** Check if database is initialized

**Response:**
```json
{
  "status": "ok",
  "initialized": true,
  "tables": {
    "blog_posts": true,
    "blog_likes": true,
    "blog_comments": true
  }
}
```

## Environment Variables Required

The following environment variables must be set (automatically set by Vercel/v0):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features Enabled After Setup

### Public Features

- **Blog Page** (`/blog`) - View all published blog posts
  - Read posts without authentication
  - Like posts (anonymous)
  - Comment on posts (anonymous)
  - Share posts on social media

### Admin Features (After Login)

- **Blog Admin** (`/admin/blog`) - Create and manage posts
  - Create new blog posts
  - Edit existing posts
  - Upload cover images
  - Publish/draft posts
  - View engagement metrics (likes, comments)

- **Analytics** (`/admin/analytics`) - Track performance
  - Blog engagement metrics
  - Event attendance data
  - Project metrics

## Troubleshooting

### "Database not initialized" Error

1. Visit `/setup` to trigger automatic initialization
2. Wait for the process to complete (may take 1-2 minutes)
3. The page will show a success message
4. Refresh the page and try again

### "Could not find table 'public.blog_posts'" Error

This means the auto-initialization failed. Try these steps:

1. Go back to `/setup` and click "Retry"
2. Check that your Supabase project URL and keys are correct
3. Verify your Supabase project has the necessary permissions

### "Permission denied" Error

This usually means RLS policies weren't created correctly:

1. Go to Supabase Dashboard > SQL Editor
2. Check that RLS is enabled on the tables
3. Verify the policies exist

### Storage Bucket Not Found

If images fail to upload:

1. Visit `/setup` again to create the bucket
2. Go to Supabase Dashboard > Storage
3. Verify that `blog-images` bucket exists and is Public

## Database Architecture

```
┌─────────────────┐
│  blog_posts     │
├─────────────────┤
│ id (PK)         │
│ title           │
│ content         │
│ tags[]          │
│ featured        │
│ status          │
│ cover_image_url │
│ created_at      │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
    ┌────▼──────┐    ┌─────▼─────┐
    │blog_likes │    │blog_comments
    ├───────────┤    ├─────────────┤
    │id (PK)    │    │id (PK)      │
    │post_id(FK)│    │post_id (FK) │
    │user_id    │    │user_name    │
    │created_at │    │message      │
    └───────────┘    │created_at   │
                     └─────────────┘

Storage Buckets:
┌──────────────────────┐
│   blog-images        │
├──────────────────────┤
│ Public readable      │
│ Auth writable        │
│ Max: 5MB per file    │
└──────────────────────┘
```

## Advanced Setup

### Manual SQL Execution

If auto-setup fails, you can run the SQL manually in Supabase SQL Editor:

See `DATABASE_SETUP.md` for the complete SQL schema.

### Environment Variable Configuration

In Vercel (or your hosting platform):

1. Go to Project Settings > Environment Variables
2. Add the Supabase keys from your Supabase project dashboard
3. Redeploy the application

## Security Notes

- **RLS is enabled** on all tables to protect data
- **Service role key** is only used on the server (in `/api/init`)
- **Anonymous read** is allowed for published content only
- **Write access** is properly controlled via RLS policies

## Next Steps

1. ✅ Visit `/setup` to initialize the database
2. Visit `/blog` to see the blog page (will be empty initially)
3. Login and visit `/admin/blog` to create posts
4. Customize your AD Club content

For more information, see:
- `DATABASE_SETUP.md` - Manual setup guide
- `QUICKSTART.md` - Quick start guide
- `START_HERE.md` - Project overview
