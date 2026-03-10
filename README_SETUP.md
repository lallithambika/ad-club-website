# AD Club Website - Complete Setup Guide

Welcome to the AD Club Website! This guide will walk you through setting up and deploying your application.

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Supabase project (free at https://supabase.com)
- GitHub account (optional, for deployment)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Note your **Project URL** and **Anon Key**
4. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Initialize Database
Follow the **DATABASE_SETUP.md** guide to:
1. Create blog tables (blog_posts, blog_likes, blog_comments)
2. Set up storage bucket for images
3. Configure RLS policies

### Step 4: Run Locally
```bash
npm run dev
```
Visit http://localhost:3000

### Step 5: Deploy to Vercel
1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Project Settings
4. Deploy!

## Project Structure

```
ad-club-website/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (blog, messages, etc.)
│   ├── admin/             # Admin dashboard
│   ├── blog/              # Public blog pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── home/             # Home page components
│   ├── admin/            # Admin-specific components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client config
│   └── admin-api-auth.ts # Admin authentication
├── DATABASE_SETUP.md      # Database initialization guide
├── QUICKSTART.md          # Quick start instructions
└── IMPLEMENTATION_SUMMARY.md # Technical documentation
```

## Key Features

### 🎯 Blog Module
- **Create, edit, publish** blog posts from admin dashboard
- **Upload cover images** for posts
- **Like and comment** on published posts
- **Tag posts** for organization
- **Publish/draft status** for posts

### 📊 Analytics Dashboard
- Track engagement (likes, comments by month)
- Monitor event attendance
- View project statistics
- Real-time message counter

### 👥 Team Management
- Manage team members
- Add team information
- Display team directory

### 📧 Contact & Messaging
- Contact form with validation
- Admin message dashboard
- Mark messages as read

### 🎪 Events & Projects
- Create and manage events
- Showcase projects
- Upload project images

## Important Files

| File | Purpose |
|------|---------|
| `DATABASE_SETUP.md` | Complete database setup instructions |
| `QUICKSTART.md` | 5-minute quick start guide |
| `IMPLEMENTATION_SUMMARY.md` | Technical implementation details |
| `.env.local` | Environment variables (create locally) |
| `app/api/init/route.ts` | Database status checker endpoint |

## Database Schema

### blog_posts
```
id (UUID) - Primary key
title (TEXT) - Post title
content (TEXT) - Post content
tags (TEXT[]) - Array of tags
featured (BOOLEAN) - Featured post flag
status (TEXT) - 'draft' or 'published'
cover_image_url (TEXT) - Image URL
created_at (TIMESTAMP) - Creation timestamp
```

### blog_likes
```
id (UUID) - Primary key
post_id (UUID) - Reference to blog_posts
user_id (UUID) - User identifier
created_at (TIMESTAMP) - Like timestamp
```

### blog_comments
```
id (UUID) - Primary key
post_id (UUID) - Reference to blog_posts
user_name (TEXT) - Commenter name
message (TEXT) - Comment content
created_at (TIMESTAMP) - Comment timestamp
```

## Admin Access

### Login
1. Navigate to `/admin`
2. Sign in with your Supabase authentication credentials
3. Access the dashboard

### Admin Pages
- **Dashboard** - Overview and statistics
- **Blog** - Manage blog posts
- **Events** - Create and manage events
- **Projects** - Showcase projects
- **Team Members** - Manage team directory
- **Messages** - View contact form submissions
- **Analytics** - View engagement metrics
- **Settings** - Configuration options

## Troubleshooting

### Common Issues

#### "Table not found" Error
**Solution:** Run the SQL setup from DATABASE_SETUP.md in Supabase SQL Editor

#### "Storage bucket not found" Error
**Solution:** Create the `blog-images` bucket in Supabase Storage and add policies

#### "Permission denied" Error
**Solution:** Check RLS policies are enabled correctly in DATABASE_SETUP.md

#### Images not loading
**Solution:** Ensure the storage bucket is set to **Public** in Supabase

#### Can't login to admin
**Solution:** Check Supabase auth is enabled and credentials are correct

## Environment Variables Reference

```env
# Required - Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional - Third-party services
# Add as needed for your features
```

## Performance Optimizations

✅ **Images Optimized**
- Logo images use `priority` prop for LCP optimization
- All images are server-side optimized with Next.js Image component

✅ **Database Optimized**
- Indexes on frequently queried columns
- RLS policies for security and performance
- Connection pooling through Supabase

✅ **Code Optimized**
- Server components for better performance
- Lazy loading for admin components
- Static generation where possible

## Security Notes

🔒 **Protected Routes**
- Admin dashboard requires authentication
- API routes verify admin status
- RLS policies protect sensitive data

🔒 **Storage Security**
- Blog images are publicly readable
- Only authenticated users can upload
- File size limits enforced

🔒 **Authentication**
- Uses Supabase Auth (industry standard)
- Session tokens stored securely
- Automatic token refresh

## Deployment

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy with one click

### Deploy to Other Platforms
This is a standard Next.js app and works on any platform supporting:
- Node.js 18+
- Environment variables
- Static file serving

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Project Issues:** Check IMPLEMENTATION_SUMMARY.md

## Next Steps

1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Set up Supabase
4. ✅ Run database setup
5. ✅ Start development server
6. ✅ Create first blog post
7. ✅ Deploy to production!

---

**Last Updated:** 2026-03-10  
**Version:** 1.0  
**Status:** Production Ready

For detailed setup instructions, see **DATABASE_SETUP.md**
