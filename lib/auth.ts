import type { NextAuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

/**
 * Custom OAuth2 provider configuration for AuthSys backend
 */
const authSysProvider = {
  id: 'authsys',
  name: 'AuthSys',
  type: 'oauth' as const,
  authorization: {
    url: `${process.env.NEXT_PUBLIC_AUTHSYS_BASE_URL}/oauth2/authorize`,
    params: {
      scope: process.env.NEXT_PUBLIC_SCOPE || 'openid profile email',
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!!,
    },
  },
  token: {
    url: `${process.env.NEXT_PUBLIC_AUTHSYS_BASE_URL}/oauth2/token`,
    async request({ client, params, checks, provider }: { client: any, params: any, checks: any, provider: any }) {
      console.log('Requesting token from AuthSys...')
      
      try {
        const response = await fetch(provider.token.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${client.client_id}:${client.client_secret}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: params.code,
            redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!!,
            client_id: client.client_id,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Token request failed:', response.status, errorText)
          throw new Error(`Token request failed: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log('Token received successfully')

        return {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
          token_type: data.token_type,
          scope: data.scope,
        }
      } catch (error) {
        console.error('Error during token exchange:', error)
        throw error
      }
    },
  },
  userinfo: {
    url: `${process.env.NEXT_PUBLIC_AUTHSYS_BASE_URL}/oauth2/userinfo`,
    async request({ tokens, provider }: { tokens: any, provider: any }) {
      console.log('Requesting user info from AuthSys...')
      const response = await fetch(provider.userinfo.url, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('UserInfo request failed:', response.status, errorText)
        throw new Error(`UserInfo request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('User info received successfully')
      return data
    },
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  idToken: false,
  checks: 'state' as const,
  wellKnown: undefined,

  /**
   * Transform the profile data from AuthSys to NextAuth format
   */
  async profile(profile: any, tokens: any) {
    console.log('Processing user profile...')
    return {
      id: profile.sub || profile.id || 'unknown',
      name: profile.name || profile.preferred_username || 'Unknown User',
      email: profile.email || '',
      image: (profile as any).picture || (profile as any).avatar_url || null,
      username: (profile as any).preferred_username || '',
      roles: (profile as any).roles || [],
    }
  },
}

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [authSysProvider as any],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created, updated, or accessed
     */
    async jwt({ token, account, profile, user }) {
      // Initial sign in
      if (account && profile) {
        console.log('Creating JWT token for new session')
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.user = {
          id: profile.sub || (profile as any).id || 'unknown',
          name: profile.name || (profile as any).preferred_username || 'Unknown User',
          email: profile.email || '',
          image: (profile as any).picture || (profile as any).avatar_url || null,
          username: (profile as any).preferred_username || '',
          roles: (profile as any).roles || [],
        }
      }
      return token
    },

    /**
     * Session callback - called whenever a session is checked
     */
    async session({ session, token }: { session: any, token: any }) {
      console.log('Creating session for client')
      session.accessToken = token.accessToken as string
      session.user = token.user
      session.expires = new Date(token.expiresAt * 1000).toISOString()
      return session
    },

    /**
     * Redirect callback - called anytime the user is redirected
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}