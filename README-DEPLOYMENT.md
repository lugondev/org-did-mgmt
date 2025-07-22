# Deployment Guide for Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: Vercel Postgres, Supabase, or PlanetScale)
3. **Environment Variables**: Prepare all required environment variables

## Quick Deploy

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel
```

### Option 2: Deploy via Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure environment variables (see below)
6. Deploy

## Environment Variables Setup

In your Vercel dashboard, add these environment variables:

### Required Variables

```env
# NextAuth Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secure-random-string-here

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# OAuth2 Configuration
NEXT_PUBLIC_AUTHSYS_BASE_URL=https://your-auth-system.com
NEXT_PUBLIC_CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_REDIRECT_URI=https://your-app.vercel.app/auth/callback
NEXT_PUBLIC_SCOPE=openid profile email

# Internal Auth System Base URL
AUTHSYS_BASE_URL=https://your-auth-system.com
```

### Generate NEXTAUTH_SECRET

```bash
# Generate a secure secret
openssl rand -base64 32
```

## Database Setup

### Option 1: Vercel Postgres

1. Go to your Vercel dashboard
2. Navigate to Storage tab
3. Create a new Postgres database
4. Copy the connection string to `DATABASE_URL`

### Option 2: External Database

1. Set up PostgreSQL on your preferred provider
2. Update `DATABASE_URL` with your connection string
3. Ensure the database is accessible from Vercel's IP ranges

## Database Migration

After deployment, run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

Or set up automatic migrations in your build process by adding to `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## Domain Configuration

1. In Vercel dashboard, go to your project settings
2. Navigate to "Domains" tab
3. Add your custom domain
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_REDIRECT_URI` to use your custom domain

## Performance Optimization

### Edge Functions
API routes are automatically optimized for Vercel's Edge Runtime where possible.

### Image Optimization
Next.js Image component is pre-configured for Vercel's image optimization.

### Caching
Static assets and API responses are automatically cached by Vercel's CDN.

## Monitoring and Debugging

### Vercel Analytics
Enable Vercel Analytics in your dashboard for performance insights.

### Logs
View real-time logs in Vercel dashboard under "Functions" tab.

### Error Tracking
Consider integrating Sentry or similar error tracking service.

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **CORS**: Configure CORS settings for your API endpoints
3. **Rate Limiting**: Implement rate limiting for public APIs
4. **HTTPS**: Always use HTTPS in production (Vercel provides this automatically)

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `DATABASE_URL` is correctly formatted
2. **Environment Variables**: Check all required variables are set
3. **Build Errors**: Review build logs in Vercel dashboard
4. **OAuth Redirect**: Ensure redirect URIs match exactly

### Build Command Issues

If you encounter build issues, try:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build
```

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Contact support through Vercel dashboard