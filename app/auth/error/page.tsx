'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

/**
 * Authentication error content component
 */
function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  /**
   * Get error message based on error type
   */
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'Có lỗi cấu hình hệ thống. Vui lòng liên hệ quản trị viên.'
      case 'AccessDenied':
        return 'Truy cập bị từ chối. Bạn không có quyền truy cập vào hệ thống này.'
      case 'Verification':
        return 'Không thể xác minh danh tính của bạn. Vui lòng thử lại.'
      case 'Default':
      default:
        return 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.'
    }
  }

  /**
   * Get error title based on error type
   */
  const getErrorTitle = (errorType: string | null) => {
    switch (errorType) {
      case 'Configuration':
        return 'Lỗi Cấu Hình'
      case 'AccessDenied':
        return 'Truy Cập Bị Từ Chối'
      case 'Verification':
        return 'Lỗi Xác Minh'
      case 'Default':
      default:
        return 'Lỗi Đăng Nhập'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">
            {getErrorTitle(error)}
          </CardTitle>
          <CardDescription className="text-red-600">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">
                <strong>Mã lỗi:</strong> {error}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Button asChild className="w-full" variant="default">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Thử Đăng Nhập Lại
              </Link>
            </Button>
            
            <Button asChild className="w-full" variant="outline">
              <Link href="/help/support">
                Liên Hệ Hỗ Trợ
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với đội ngũ hỗ trợ kỹ thuật.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Authentication error page with Suspense boundary
 */
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}