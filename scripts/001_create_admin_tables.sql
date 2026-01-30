CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure role column exists for authorization
ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  category TEXT NOT NULL CHECK (category IN ('workshop', 'hackathon', 'guest-lecture', 'meetup', 'competition')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  image_url TEXT,
  registration_link TEXT,
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('mobile', 'web', 'ai-ml', 'iot', 'game')),
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'on-hold')),
  tech_stack TEXT[] DEFAULT '{}',
  team_size INTEGER DEFAULT 1,
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('faculty', 'lead', 'domain-lead', 'core-team', 'member')),
  position TEXT,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true
);

-- Blog likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT blog_likes_unique UNIQUE (post_id, user_identifier)
);

-- Basic analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'blog_post', 'project')),
  entity_id UUID NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('view', 'like', 'comment')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table (single row for club settings)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_email TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  discord_url TEXT,
  website_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_profiles (non-recursive, using only auth.uid())
-- These policies NEVER query admin_profiles table to avoid infinite recursion

-- SELECT: Users can only read their own admin profile
CREATE POLICY "admin_profiles_select_own" ON public.admin_profiles 
  FOR SELECT USING (auth.uid() = id);

-- INSERT: Users can only insert their own admin profile (for first-time Google login)
CREATE POLICY "admin_profiles_insert_own" ON public.admin_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own admin profile
CREATE POLICY "admin_profiles_update_own" ON public.admin_profiles 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Helper condition: user is admin based on admin_profiles.role
-- (role can be 'admin' or 'super_admin')

-- RLS Policies for events (public read, admin write)
CREATE POLICY "events_select_all" ON public.events 
  FOR SELECT USING (true);
CREATE POLICY "events_insert_admin" ON public.events 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "events_update_admin" ON public.events 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "events_delete_admin" ON public.events 
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for projects (public read, admin write)
CREATE POLICY "projects_select_all" ON public.projects 
  FOR SELECT USING (true);
CREATE POLICY "projects_insert_admin" ON public.projects 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "projects_update_admin" ON public.projects 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "projects_delete_admin" ON public.projects 
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for team_members (public read, admin write)
CREATE POLICY "team_members_select_all" ON public.team_members 
  FOR SELECT USING (true);
CREATE POLICY "team_members_insert_admin" ON public.team_members 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "team_members_update_admin" ON public.team_members 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "team_members_delete_admin" ON public.team_members 
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for announcements (public read active, admin write)
CREATE POLICY "announcements_select_active" ON public.announcements 
  FOR SELECT USING (
    is_active = true OR EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "announcements_insert_admin" ON public.announcements 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "announcements_update_admin" ON public.announcements 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "announcements_delete_admin" ON public.announcements 
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for contact_messages (public insert, admin read/update)
CREATE POLICY "messages_insert_public" ON public.contact_messages 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select_admin" ON public.contact_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "messages_update_admin" ON public.contact_messages 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "messages_delete_admin" ON public.contact_messages 
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for settings (public read, admin write)
CREATE POLICY "settings_select_all" ON public.settings 
  FOR SELECT USING (true);
CREATE POLICY "settings_insert_admin" ON public.settings 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "settings_update_admin" ON public.settings 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for blog_posts (public read published only, admin write)
CREATE POLICY "blog_posts_select_published" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.id = auth.uid()
      AND ap.role IN ('admin', 'super_admin')
  ));
CREATE POLICY "blog_posts_insert_admin" ON public.blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "blog_posts_update_admin" ON public.blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "blog_posts_delete_admin" ON public.blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for blog_comments (public insert, public read approved, admin manage)
CREATE POLICY "blog_comments_select_public" ON public.blog_comments
  FOR SELECT USING (is_approved = true OR EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.id = auth.uid()
      AND ap.role IN ('admin', 'super_admin')
  ));
CREATE POLICY "blog_comments_insert_public" ON public.blog_comments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_comments_update_admin" ON public.blog_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );
CREATE POLICY "blog_comments_delete_admin" ON public.blog_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for blog_likes (public insert/select/delete for unliking)
CREATE POLICY "blog_likes_select_public" ON public.blog_likes
  FOR SELECT USING (true);
CREATE POLICY "blog_likes_insert_public" ON public.blog_likes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "blog_likes_delete_public" ON public.blog_likes
  FOR DELETE USING (true);

-- RLS Policies for analytics_events (public insert for anonymous tracking, admin read)
CREATE POLICY "analytics_events_insert_public" ON public.analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_events_select_admin" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.admin_profiles ap
      WHERE ap.id = auth.uid()
        AND ap.role IN ('admin', 'super_admin')
    )
  );

-- Insert default settings row
INSERT INTO public.settings (club_email, instagram_url, linkedin_url, github_url, twitter_url)
VALUES ('adclub@college.edu', 'https://instagram.com/adclub', 'https://linkedin.com/company/adclub', 'https://github.com/adclub', 'https://twitter.com/adclub')
ON CONFLICT DO NOTHING;

-- Insert sample data for events
INSERT INTO public.events (title, description, date, time, location, category, status) VALUES
('Flutter Workshop', 'Learn mobile app development with Flutter framework', '2026-02-15', '10:00 AM', 'Room 101', 'workshop', 'upcoming'),
('Hackathon 2026', 'Annual 24-hour coding hackathon with exciting prizes', '2026-03-01', '9:00 AM', 'Main Auditorium', 'hackathon', 'upcoming'),
('Tech Talk: AI in Modern Apps', 'Guest lecture on integrating AI into applications', '2026-02-20', '3:00 PM', 'Seminar Hall', 'guest-lecture', 'upcoming');

-- Insert sample data for projects
INSERT INTO public.projects (title, description, category, status, tech_stack, team_size, github_url) VALUES
('Campus Connect', 'A mobile app for campus navigation and events', 'mobile', 'in-progress', ARRAY['Flutter', 'Firebase', 'Google Maps'], 4, 'https://github.com/adclub/campus-connect'),
('Study Buddy', 'AI-powered study companion web application', 'web', 'completed', ARRAY['Next.js', 'OpenAI', 'Supabase'], 3, 'https://github.com/adclub/study-buddy'),
('Smart Attendance', 'IoT-based attendance system using face recognition', 'iot', 'in-progress', ARRAY['Python', 'OpenCV', 'Raspberry Pi'], 5, 'https://github.com/adclub/smart-attendance');

-- Insert sample data for team_members
INSERT INTO public.team_members (name, role, position, bio, linkedin_url, github_url, display_order) VALUES
('Dr. Priya Sharma', 'faculty', 'Faculty Advisor', 'Associate Professor, Computer Science Department', 'https://linkedin.com/in/priyasharma', NULL, 1),
('Arjun Patel', 'lead', 'Club President', 'Final year CS student passionate about mobile development', 'https://linkedin.com/in/arjunpatel', 'https://github.com/arjunpatel', 2),
('Sneha Reddy', 'domain-lead', 'Mobile Development Lead', 'Flutter enthusiast and open source contributor', 'https://linkedin.com/in/snehareddy', 'https://github.com/snehareddy', 3),
('Rahul Kumar', 'domain-lead', 'Web Development Lead', 'Full-stack developer specializing in React and Node.js', 'https://linkedin.com/in/rahulkumar', 'https://github.com/rahulkumar', 4),
('Ananya Singh', 'core-team', 'UI/UX Lead', 'Design enthusiast with a focus on user experience', 'https://linkedin.com/in/ananyasingh', NULL, 5);

-- Insert sample announcements
INSERT INTO public.announcements (title, content, is_active, priority) VALUES
('Hackathon Registration Open', 'Register now for our annual hackathon! Limited spots available.', true, 'high'),
('New Workshop Series', 'Excited to announce our new workshop series on AI/ML starting next month.', true, 'normal');

-- Insert sample contact messages
INSERT INTO public.contact_messages (name, email, subject, message, is_read) VALUES
('John Doe', 'john@example.com', 'Membership Inquiry', 'I would like to know more about joining the club. What are the requirements?', true),
('Jane Smith', 'jane@example.com', 'Hackathon Query', 'Can you provide more details about the upcoming hackathon?', false),
('Mike Johnson', 'mike@example.com', 'Collaboration Request', 'Interested in collaborating on a project. Please get back to me.', false);
