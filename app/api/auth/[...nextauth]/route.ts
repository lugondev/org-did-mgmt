import NextAuth from 'next-auth'
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
          tokens: {
            access_token: data.access_token,
            token_type: data.token_type || 'Bearer',
            expires_in: data.expires_in,
            refresh_token: data.refresh_token,
            scope: data.scope,
            id_token: data.id_token
          }
        }
      } catch (error) {
        console.error('AuthSys token request failed:', error)
        throw error
      }
    },
  },
  userinfo: {
    url: `${process.env.NEXT_PUBLIC_AUTHSYS_BASE_URL}/oauth2/userinfo`,
    async request({ tokens, provider }: { tokens: any, provider: any }) {
      console.log('Fetching user info from AuthSys...')
      
      try {
        const response = await fetch(provider.userinfo.url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Userinfo request failed:', response.status, errorText)
          throw new Error(`Userinfo request failed: ${response.status} ${errorText}`)
        }

        const userInfo = await response.json()
        console.log('User info received successfully')
        
        return userInfo
      } catch (error) {
        console.error('AuthSys userinfo request failed:', error)
        throw error
      }
    }
  },
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  idToken: false,
  checks: 'state' as const,
  wellKnown: undefined,
  /**
   * Transform user profile data from AuthSys
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
  providers: [authSysProvider],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    /**
     * Handle JWT token creation and updates
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
     * Handle session data sent to the client
     */
    async session({ session, token }: { session: any, token: any }) {
      console.log('Creating session for client')
      session.accessToken = token.accessToken as string
      session.user = token.user
      session.expires = new Date(token.expiresAt * 1000).toISOString()
      return session
    },
    /**
     * Handle redirects after authentication
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }