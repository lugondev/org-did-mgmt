'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Test page for userinfo API endpoint
 */
export default function TestUserInfoPage() {
  const { data: session, status } = useSession()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch user info from our API endpoint
   */
  const fetchUserInfo = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/userinfo')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setUserInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Loading session...</div>
  }

  if (status === 'unauthenticated') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to test the userinfo API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/api/auth/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UserInfo API Test</CardTitle>
          <CardDescription>
            Test the /api/userinfo endpoint that calls AuthSys backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Session:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <Button 
            onClick={fetchUserInfo} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Fetching...' : 'Fetch User Info from AuthSys'}
          </Button>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h4 className="font-semibold text-red-800">Error:</h4>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {userInfo && (
            <div>
              <h3 className="font-semibold mb-2">AuthSys User Info Response:</h3>
              <pre className="bg-green-50 border border-green-200 rounded p-3 text-sm overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}