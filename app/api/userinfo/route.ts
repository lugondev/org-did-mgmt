import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

// Extend Session type to include accessToken
interface ExtendedSession {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    username?: string
    roles?: string[]
  }
  expires: string
  accessToken?: string
}

/**
 * GET /api/userinfo
 * Fetches user information from AuthSys backend using the access token from session
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session to retrieve access token
    const session = await getServerSession(authOptions) as ExtendedSession | null
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'No valid session or access token found' },
        { status: 401 }
      )
    }

    console.log('Fetching user info from AuthSys with access token...')
    
    // Call AuthSys userinfo endpoint
    const response = await fetch(`${process.env.AUTHSYS_BASE_URL}/api/v1/oauth2/userinfo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AuthSys userinfo request failed:', response.status, errorText)
      return NextResponse.json(
        { error: `AuthSys request failed: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }

    const userInfo = await response.json()
    console.log('User info received successfully from AuthSys')
    
    return NextResponse.json(userInfo)
    
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}