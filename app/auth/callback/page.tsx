'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

/**
 * OAuth2 callback processing page
 * This page shows the status while NextAuth processes the OAuth callback
 * Note: NextAuth handles the actual callback at /api/auth/callback/[provider]
 */
export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const [message, setMessage] = useState('Đang xử lý đăng nhập...')
  const [debugInfo, setDebugInfo] = useState<{code?: string, state?: string, error?: string}>({})

  // Extract URL parameters
  useEffect(() => {
    const code = searchParams.get('code') || undefined
    const state = searchParams.get('state') || undefined
    const error = searchParams.get('error') || undefined
    
    setDebugInfo({ code, state, error })
    
    if (error) {
      setMessage(`Lỗi OAuth2: ${error}`)
    } else if (code && state) {
      setMessage('Đã nhận được authorization code, đang xử lý...')
    } else if (!code) {
      setMessage('Không tìm thấy authorization code trong URL')
    }
  }, [searchParams])

  useEffect(() => {
    const handleAuthStatus = () => {
      if (sessionStatus === 'loading') {
        setMessage('Đang xử lý đăng nhập...')
        return
      }

      if (sessionStatus === 'authenticated' && session) {
        setMessage('Đăng nhập thành công! Đang chuyển hướng...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
        return
      }

      if (sessionStatus === 'unauthenticated') {
        setMessage('Đăng nhập thất bại. Đang chuyển về trang đăng nhập...')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
        return
      }
    }

    handleAuthStatus()
  }, [session, sessionStatus, router])

  const getIcon = () => {
    switch (sessionStatus) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      case 'authenticated':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'unauthenticated':
        return <XCircle className="h-8 w-8 text-red-600" />
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'loading':
        return 'text-blue-600'
      case 'authenticated':
        return 'text-green-600'
      case 'unauthenticated':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getStatusTitle = () => {
    switch (sessionStatus) {
      case 'loading':
        return 'Đang xử lý...'
      case 'authenticated':
        return 'Thành công!'
      case 'unauthenticated':
        return 'Có lỗi xảy ra'
      default:
        return 'Đang xử lý...'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            {getIcon()}
          </div>
          <CardTitle className={`text-xl font-bold ${getStatusColor()}`}>
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {/* Debug Information */}
          <div className="bg-gray-50 border rounded-lg p-3 text-left">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">🔍 Debug Info:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Code:</span>
                {debugInfo.code ? (
                  <span className="text-green-600 font-mono bg-green-50 px-1 rounded">
                    {debugInfo.code.substring(0, 20)}...
                  </span>
                ) : (
                  <span className="text-red-500">❌ Không có</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">State:</span>
                {debugInfo.state ? (
                  <span className="text-green-600 font-mono bg-green-50 px-1 rounded">
                    {debugInfo.state.substring(0, 20)}...
                  </span>
                ) : (
                  <span className="text-red-500">❌ Không có</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Error:</span>
                {debugInfo.error ? (
                  <span className="text-red-600 font-mono bg-red-50 px-1 rounded">
                    {debugInfo.error}
                  </span>
                ) : (
                  <span className="text-green-600">✅ Không có lỗi</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Session Status:</span>
                <span className={`font-mono px-1 rounded ${
                  sessionStatus === 'authenticated' ? 'text-green-600 bg-green-50' :
                  sessionStatus === 'loading' ? 'text-blue-600 bg-blue-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {sessionStatus}
                </span>
              </div>
            </div>
          </div>
          
          {sessionStatus === 'unauthenticated' && (
            <p className="mt-2 text-sm text-gray-500">
              Bạn sẽ được chuyển về trang đăng nhập trong giây lát...
            </p>
          )}
          {sessionStatus === 'authenticated' && (
            <p className="mt-2 text-sm text-gray-500">
              Đang chuyển hướng đến dashboard...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}