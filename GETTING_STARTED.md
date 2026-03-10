# Getting Started - AD Club Website

## Welcome! 👋

Your AD Club website is ready to use. This guide will get you up and running in **5 minutes**.

## What You Have

A fully-featured club management website with:
- ✅ Blog system with likes and comments
- ✅ Event countdown timers
- ✅ Project showcase
- ✅ Admin dashboard
- ✅ Analytics
- ✅ Team directory
- ✅ Dark/Light mode

## Step 1: Initialize the Database (1 minute)

The application needs a Supabase database to store blog posts and other data.

### Automatic Setup (Recommended)

**Just visit:** `http://localhost:3000/setup`

The page will automatically:
1. Create database tables
2. Set up storage for images
3. Configure security policies

You'll see a green checkmark when complete! ✅

### Manual Script Setup (Alternative)

If you prefer using a script:

```bash
npm run init:db
# or
node scripts/init-db.js http://localhost:3000
```

## Step 2: Create Your First Blog Post (2 minutes)

1. Visit `http://localhost:3000/admin/blog`
2. Click "Create New Post"
3. Fill in the form:
   - **Title:** Your blog post title
   - **Content:** The blog post content
   - **Cover Image:** Upload a featured image
   - **Tags:** Add relevant tags
   - **Status:** Set to "Published" to make it visible

4. Click "Publish"

Done! Your post is now live at `/blog` 🎉

## Step 3: Explore the Website

### For Visitors
- **Home:** `http://localhost:3000` - See all features
- **Blog:** `http://localhost:3000/blog` - Read posts, like, comment
- **About:** Learn about the club
- **Events:** See upcoming events
- **Contact:** Get in touch

### For Admins (After Login)
- **Dashboard:** `http://localhost:3000/admin/dashboard` - Overview
- **Blog:** `http://localhost:3000/admin/blog` - Manage posts
- **Analytics:** `http://localhost:3000/admin/analytics` - View metrics
- **Events:** `http://localhost:3000/admin/events` - Manage events
- **Projects:** `http://localhost:3000/admin/projects` - Showcase work
- **Team:** `http://localhost:3000/admin/team-members` - Team directory
- **Settings:** Configure club settings

## Common Tasks

### Add a New Blog Post

```
1. Admin > Blog
2. Click "Create New Post"
3. Fill in details
4. Upload cover image
5. Click "Publish"
```

### Update an Existing Post

```
1. Admin > Blog
2. Find the post
3. Click "Edit"
4. Make changes
5. Click "Update"
```

### View Blog Analytics

```
1. Admin > Analytics
2. Scroll to "Blog Engagement"
3. See likes, comments by date
```

### Manage Events

```
1. Admin > Events
2. Create/edit events
3. Set countdown date
4. Events appear on home page
```

### Manage Projects

```
1. Admin > Projects
2. Add project details
3. Upload project images
4. Featured projects show on home
```

## Environment Setup

### Development

Everything is pre-configured! Just run:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Production (Vercel)

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

Environment variables are automatically set if using v0.

## Troubleshooting

### "Database not initialized" Error

**Solution:** Visit `http://localhost:3000/setup`

The page will initialize everything automatically.

### Images not uploading

1. Visit `/setup` to ensure storage bucket exists
2. Check file size (max 5MB)
3. Try again with a smaller image

### Can't access admin pages

1. Make sure you're logged in
2. Check that your auth is properly configured
3. Verify admin role is set in your profile

### Blog posts not showing

1. Visit `/setup` to initialize database
2. Make sure posts are set to "Published" status
3. Try refreshing the page

## File Structure

```
/app
  /admin - Admin pages (dashboard, blog, analytics, etc)
  /api - API routes (initialization, blog CRUD, etc)
  /blog - Public blog page
  /auth - Authentication pages
  page.tsx - Home page
  layout.tsx - Root layout

/components
  - Reusable UI components
  - Page-specific sections

/lib
  /supabase - Supabase client and utilities
  - Database queries, helpers

/public
  - Static assets (logo, etc)

/scripts
  - Database initialization script
```

## Key Features

### Blog System
- ✅ Create, edit, publish posts
- ✅ Upload cover images
- ✅ Tag and categorize
- ✅ Like system
- ✅ Comment system
- ✅ Analytics (likes, comments per day)

### Admin Dashboard
- ✅ Overview of all content
- ✅ Quick access to features
- ✅ User management
- ✅ Settings configuration

### Public Website
- ✅ Hero section with call-to-action
- ✅ Story highlights
- ✅ About preview
- ✅ Blog feed
- ✅ Event countdown
- ✅ Project showcase
- ✅ Team directory
- ✅ Contact form

### Responsive Design
- ✅ Mobile-friendly
- ✅ Dark/Light mode
- ✅ Touch-optimized
- ✅ Fast performance

## Next Steps

1. ✅ Initialize database (`/setup`)
2. ✅ Create your first post
3. ✅ Customize club info in settings
4. ✅ Add events and projects
5. ✅ Share with your club members!

## Documentation

- **BACKEND_SETUP.md** - Technical backend details
- **DATABASE_SETUP.md** - Manual database setup
- **IMPLEMENTATION_SUMMARY.md** - Architecture overview
- **START_HERE.md** - Project overview

## Need Help?

Check these resources:
- **Database Issues?** → See BACKEND_SETUP.md
- **Setup Problems?** → Visit `/setup` page
- **Technical Details?** → See IMPLEMENTATION_SUMMARY.md
- **API Endpoints?** → Check `/app/api`

## Performance Tips

1. **Images:** Keep images under 500KB for faster loading
2. **Blog Content:** Write concise posts for better engagement
3. **Analytics:** Check dashboard regularly to see what content works best

---

**That's it! Your AD Club website is ready to go. Have fun! 🚀**
