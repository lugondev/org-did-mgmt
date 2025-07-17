'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, LogIn, LogOut, RefreshCw } from 'lucide-react'

/**
 * Test page for OAuth2 authentication flow
 */
export default function TestAuthPage() {
  const { data: session, status, update } = useSession()

  const handleSignIn = () => {
    signIn('authsys', { callbackUrl: '/auth/callback' })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const handleRefreshSession = () => {
    update()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              OAuth2 Authentication Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={status === 'authenticated' ? 'default' : status === 'loading' ? 'secondary' : 'destructive'}>
                {status}
              </Badge>
            </div>

            {status === 'loading' && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Đang kiểm tra trạng thái xác thực...</span>
              </div>
            )}

            {status === 'unauthenticated' && (
              <div className="space-y-4">
                <p className="text-gray-600">Bạn chưa đăng nhập. Nhấn nút bên dưới để bắt đầu flow OAuth2.</p>
                <Button onClick={handleSignIn} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập với AuthSys
                </Button>
              </div>
            )}

            {status === 'authenticated' && session && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Đăng nhập thành công!</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                    <p><strong>Image:</strong> {session.user?.image || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">🔑 Token Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Access Token:</strong> {(session as any)?.accessToken ? '✅ Present' : '❌ Missing'}</p>
                    <p><strong>Refresh Token:</strong> {(session as any)?.refreshToken ? '✅ Present' : '❌ Missing'}</p>
                    <p><strong>Expires At:</strong> {(session as any)?.expiresAt ? new Date((session as any).expiresAt * 1000).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSignOut} variant="destructive" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                  <Button onClick={handleRefreshSession} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Session
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle>🐛 Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded p-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({ session, status }, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}