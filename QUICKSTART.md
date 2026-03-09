# AD Club Website - Quick Start Guide

## 5-Minute Setup

### Step 1: Set Up Database (2 minutes)

1. Open your Supabase project: https://app.supabase.com
2. Go to **SQL Editor**
3. Copy the entire SQL from `DATABASE_SETUP.md`
4. Paste and execute

### Step 2: Create Storage Bucket (1 minute)

1. In Supabase, go to **Storage**
2. Click **Create a new bucket**
3. Enter name: `blog-images`
4. Set as **Public**
5. Set file size limit: 5 MB
6. Click **Create bucket**

### Step 3: Verify Setup (1 minute)

1. In your running app, visit: `http://localhost:3000/api/init`
2. You should see a JSON response like:
```json
{
  "status": "ok",
  "message": "Database is initialized and ready"
}
```

### Step 4: Create Your First Post (1 minute)

1. Navigate to `/admin` (requires authentication)
2. Click **Blog** in the sidebar
3. Click **New Post**
4. Add title, content, and optional cover image
5. Click **Share** to publish

## What You Can Do Now

✅ **As Admin:**
- Create, edit, and delete blog posts
- Upload cover images
- Set posts as draft or published
- Tag posts for organization
- View analytics dashboard

✅ **As Public User:**
- View all published blog posts at `/blog`
- See blog preview on home page
- Like and comment on posts
- Filter and search posts

## File Locations

| Page | URL | File |
|------|-----|------|
| Home | `/` | `app/page.tsx` |
| Blog Feed | `/blog` | `app/blog/page.tsx` |
| Blog Post Detail | `/blog/[id]` | `app/blog/[id]/page.tsx` |
| Admin Dashboard | `/admin` | `app/admin/page.tsx` |
| Admin Blog | `/admin/blog` | `app/admin/blog/page.tsx` |
| Analytics | `/admin/analytics` | `app/admin/analytics/page.tsx` |

## Common Tasks

### Create a Blog Post

1. Go to `/admin/blog`
2. Click **New Post**
3. Fill in:
   - **Title** - Post headline
   - **Content** - Main text (required)
   - **Tags** - Comma-separated (e.g., "web, react, tutorial")
   - **Cover Image** - Drag/drop or click to upload
   - **Featured** - Toggle to make featured
4. Click **Save** (draft) or **Share** (publish)

### Publish a Draft

1. Go to `/admin/blog`
2. Find the draft post
3. Click **Edit**
4. Click **Share** to publish

### View Analytics

1. Go to `/admin/analytics`
2. See:
   - Events over time
   - Blog engagement (likes/comments)
   - Project categories

## Troubleshooting

### "Database tables not found"
- Run DATABASE_SETUP.md SQL again
- Make sure all SQL executed successfully

### "Blog-images bucket not found"
- Create the bucket in Storage (see Step 2)
- Make sure it's set to **Public**

### "Cannot access admin"
- Need to be logged in
- Must have admin role in admin_profiles table

### Images not uploading
- Check file size is under 5 MB
- Try a different image format (JPG, PNG)
- Verify blog-images bucket exists

## Documentation

For more detailed information, see:
- **Setup Instructions:** `DATABASE_SETUP.md`
- **Full Implementation:** `IMPLEMENTATION_SUMMARY.md`
- **GitHub:** [lallithambika/ad-club-website](https://github.com/lallithambika/ad-club-website)

## Need Help?

1. Check the troubleshooting section above
2. Review DATABASE_SETUP.md for setup issues
3. Check browser console for error messages
4. Verify Supabase is properly connected

## Next: Advanced Setup

Once you're comfortable with the basics, you can:
- Customize the blog design
- Add more admin users
- Set up custom domain
- Configure email notifications
- Add advanced analytics

---

**You're all set!** Start creating content for your club at `/admin/blog` 🚀
