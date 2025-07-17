'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Custom hook for authentication management
 * Provides convenient methods for handling authentication state
 */
export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  const user = session?.user

  /**
   * Sign in with AuthSys provider
   */
  const login = useCallback(async (callbackUrl?: string) => {
    try {
      const result = await signIn('authsys', {
        callbackUrl: callbackUrl || '/dashboard',
        redirect: false,
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      if (result?.url) {
        window.location.href = result.url
      }
      
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [])

  /**
   * Sign out and redirect to sign-in page
   */
  const logout = useCallback(async (callbackUrl?: string) => {
    try {
      await signOut({
        callbackUrl: callbackUrl || '/auth/signin',
      })
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [])

  /**
   * Redirect to sign-in page if not authenticated
   */
  const requireAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin')
      return false
    }
    return isAuthenticated
  }, [isLoading, isAuthenticated, router])

  /**
   * Get access token from session
   */
  const getAccessToken = useCallback(() => {
    return (session as any)?.accessToken || null
  }, [session])

  /**
   * Check if access token is expired
   */
  const isTokenExpired = useCallback(() => {
    const expiresAt = (session as any)?.expiresAt
    if (!expiresAt) return false
    
    return Date.now() >= expiresAt * 1000
  }, [session])

  return {
    // State
    isLoading,
    isAuthenticated,
    user,
    session,
    
    // Actions
    login,
    logout,
    requireAuth,
    
    // Token management
    getAccessToken,
    isTokenExpired,
  }
}