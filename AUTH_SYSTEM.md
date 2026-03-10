# Admin Authentication System

## Overview

The AD Club website now has a fully functional admin authentication system with multiple login methods:

1. **Email/Password Authentication** - Direct login with email and password
2. **Google OAuth** - Sign in with Google account
3. **Signup** - Create new admin accounts

## Features

### 1. Email/Password Login
- User-friendly login form
- Password input with validation
- Error handling for invalid credentials
- Automatic session management

### 2. Google OAuth
- One-click Google sign-in
- Automatic user profile creation
- Seamless integration with Supabase Auth

### 3. Account Signup
- Create new admin accounts with email/password
- Optional name field
- Email-based verification
- Automatic admin profile creation

## Technical Implementation

### Frontend Components

#### `/app/admin/login/page.tsx`
- Main login page component
- Supports both email/password and Google OAuth
- Signup mode for new account creation
- Error handling and user feedback via toast notifications

**Key Features:**
- Session checking on load (redirects if already logged in)
- Tab switcher between email and Google methods
- Form validation
- Loading states with spinner indicators

### Backend API Routes

#### `/app/auth/callback/route.ts`
Handles OAuth callbacks and session creation:
- Exchanges OAuth code for Supabase session
- Creates or updates admin profile
- Gracefully handles missing `admin_profiles` table
- Allows admins to proceed even if profile table doesn't exist yet

#### `/app/api/auth/signup/route.ts`
Handles new account creation:
```typescript
POST /api/auth/signup
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "Signup successful. Please check your email to confirm.",
  "user": {
    "id": "uuid",
    "email": "admin@example.com"
  }
}
```

### Database Tables

#### `admin_profiles`
Auto-created with the following schema:
```sql
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

- **Automatic Creation**: Table is created on first setup
- **Row Level Security**: RLS enabled for data protection
- **Role Management**: Supports 'admin' and 'super_admin' roles

## User Flows

### First-Time Admin Setup

1. **Visit Login Page**
   - User navigates to `/admin/login`

2. **Create Account**
   - Click "Don't have an account? Sign up"
   - Enter email and password
   - Click "Create Account"
   - Receive confirmation email

3. **Access Dashboard**
   - Confirm email (if verification enabled)
   - Sign in with email/password or Google
   - Redirected to `/admin/dashboard`

### Regular Admin Login

**Email/Password:**
1. Navigate to `/admin/login`
2. Select "Email" tab
3. Enter email and password
4. Click "Sign In"
5. Redirected to dashboard

**Google OAuth:**
1. Navigate to `/admin/login`
2. Select "Google" tab
3. Click "Continue with Google"
4. Complete Google sign-in
5. Auto-redirect to dashboard

## Error Handling

### Login Errors

| Error | Message | Cause |
|-------|---------|-------|
| Invalid credentials | "Invalid email or password" | Wrong password or non-existent account |
| Missing fields | "Please enter both email and password" | Empty form fields |
| Auth failed | "Failed to sign in" | Supabase auth service issue |

### Signup Errors

| Error | Message | Cause |
|-------|---------|-------|
| Email exists | "User already registered" | Email already has account |
| Weak password | "Password is too weak" | Password doesn't meet requirements |
| Missing field | "Email and password are required" | Empty form fields |

## Middleware Protection

The middleware (`lib/supabase/middleware.ts`) protects admin routes:

- **Public**: `/admin/login` - Always accessible
- **Protected**: `/admin/*` - Requires valid session
- **Graceful Fallback**: Missing `admin_profiles` table doesn't block login

## Session Management

- Sessions stored in Supabase Auth
- Automatic session persistence via cookies
- Session auto-refresh before expiration
- Secure logout clears all session data

## Security Features

1. **Password Security**
   - Passwords never stored in plaintext
   - Hashed using Supabase Auth
   - HTTPS only in production

2. **Session Security**
   - HTTP-only cookies (not accessible via JavaScript)
   - CSRF protection via Supabase
   - Session expiration

3. **Database Security**
   - Row Level Security (RLS) enabled on `admin_profiles`
   - Admin-only access to sensitive data
   - Automatic user association via `auth.users`

## Configuration

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Supabase Configuration
1. Enable Email/Password auth in Supabase dashboard
2. Enable Google OAuth and add credentials
3. Configure redirect URLs to include `/auth/callback`

## Troubleshooting

### "Admin login page shows blank"
- Clear browser cache
- Check console for errors
- Verify Supabase credentials in `.env.local`

### "Google sign-in not working"
- Verify Google OAuth credentials in Supabase
- Check redirect URL configuration
- Ensure `redirectTo` matches Supabase config

### "Can't create admin account"
- Check email format is valid
- Verify password meets requirements
- Check network console for API errors

### "Redirects to login after successful auth"
- Ensure session is properly established
- Check cookies are enabled
- Verify middleware isn't blocking

## API Integration

### Manual Token Usage
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

### Protected Routes
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // User not authenticated
}
```

## Next Steps

1. ✅ Authentication system is fully functional
2. Set up email verification (optional)
3. Configure admin roles and permissions
4. Set up audit logging for admin actions
5. Implement 2FA for enhanced security (optional)

## Support

For issues with authentication:
1. Check the browser console for error messages
2. Review `/app/admin/login/page.tsx` for frontend issues
3. Check Supabase dashboard for backend issues
4. Verify all environment variables are set correctly
