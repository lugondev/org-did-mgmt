'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

/**
 * Custom sign-in page for OAuth2 authentication
 */
export default function SignInPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if already authenticated
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  /**
   * Handle OAuth2 sign-in with AuthSys provider
   */
  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await login('/dashboard')
    } catch (err) {
      setError('Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">OrgDID Platform</CardTitle>
          <CardDescription>
            Đăng nhập vào hệ thống quản lý danh tính số và chứng chỉ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang đăng nhập...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập với AuthSys</span>
              </div>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Sử dụng tài khoản AuthSys để truy cập hệ thống</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}