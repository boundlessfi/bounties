# GitHub OAuth Implementation

## Changes Made

### Files Created:
1. `lib/auth.ts` - Server-side Better Auth configuration with GitHub provider
2. `app/api/auth/[...all]/route.ts` - Next.js API route handler
3. `.env.example` - Environment variables template

### Files Modified:
1. `lib/auth-client.ts` - Added exported sign-in methods
2. `components/login/sign-in.tsx` - Wired GitHub button with OAuth flow

## Setup Instructions

### 1. Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Boundless Finance (Dev)`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Click "Generate a new client secret" and copy the **Client Secret**

### 2. Set Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your-random-secret-key
GITHUB_CLIENT_ID=your_client_id_from_github
GITHUB_CLIENT_SECRET=your_client_secret_from_github
```

### 3. Install Dependencies (if needed)
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Test Authentication

1. Navigate to: http://localhost:3000/auth
2. Click "Sign in with Github"
3. Authorize the application
4. Should redirect back and create a session

## How It Works

1. User clicks "Sign in with Github" button
2. `authClient.signIn.social()` redirects to GitHub OAuth page
3. User authorizes the app
4. GitHub redirects to `/api/auth/callback/github`
5. Better Auth handles the callback and creates a session
6. User is redirected to the home page (`/`)

## Production Deployment

For production (staging-api.boundlessfi.xyz):

1. Create a new GitHub OAuth App for production
2. Set callback URL to: `https://staging-api.boundlessfi.xyz/api/auth/callback/github`
3. Update environment variables:
   ```bash
   NEXT_PUBLIC_APP_URL=https://staging-api.boundlessfi.xyz
   AUTH_SECRET=<generate-secure-random-string>
   GITHUB_CLIENT_ID=<production-client-id>
   GITHUB_CLIENT_SECRET=<production-client-secret>
   ```

## Files Changed

- ✅ `lib/auth.ts` (NEW)
- ✅ `lib/auth-client.ts` (MODIFIED)
- ✅ `app/api/auth/[...all]/route.ts` (NEW)
- ✅ `components/login/sign-in.tsx` (MODIFIED)
- ✅ `.env.example` (NEW)

## Testing Checklist

- [ ] GitHub button triggers OAuth flow
- [ ] Redirects to GitHub authorization page
- [ ] After authorization, returns to app
- [ ] Session is created
- [ ] User info is available
- [ ] Sign out works

## Notes

- Using in-memory sessions (no database required)
- Sessions expire after 7 days
- Easy to swap credentials for production
- Follows Better Auth best practices
