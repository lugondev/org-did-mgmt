'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink } from 'lucide-react'
import { Suspense } from 'react'

/**
 * Debug callback content component
 */
function DebugCallbackContent() {
  const searchParams = useSearchParams()
  const [urlParams, setUrlParams] = useState<Record<string, string>>({})
  const [manualTest, setManualTest] = useState({
    code: '',
    state: '',
    error: ''
  })

  useEffect(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    setUrlParams(params)
  }, [searchParams])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testCallbackUrl = () => {
    const baseUrl = 'http://localhost:3033/auth/callback'
    const params = new URLSearchParams()
    if (manualTest.code) params.append('code', manualTest.code)
    if (manualTest.state) params.append('state', manualTest.state)
    if (manualTest.error) params.append('error', manualTest.error)
    
    const fullUrl = `${baseUrl}?${params.toString()}`
    window.open(fullUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🐛 Debug OAuth2 Callback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current URL Parameters */}
            <div>
              <h3 className="font-semibold mb-3">📍 Current URL Parameters:</h3>
              <div className="bg-gray-50 border rounded-lg p-4">
                {Object.keys(urlParams).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(urlParams).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Badge variant="outline">{key}</Badge>
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border flex-1">
                          {value}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(value)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Không có parameters trong URL</p>
                )}
              </div>
            </div>

            {/* Manual Test Section */}
            <div>
              <h3 className="font-semibold mb-3">🧪 Manual Test Callback:</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Authorization Code:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="Nhập authorization code..."
                    value={manualTest.code}
                    onChange={(e) => setManualTest(prev => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State:</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="Nhập state parameter..."
                    value={manualTest.state}
                    onChange={(e) => setManualTest(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Error (optional):</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="Nhập error parameter (nếu có)..."
                    value={manualTest.error}
                    onChange={(e) => setManualTest(prev => ({ ...prev, error: e.target.value }))}
                  />
                </div>
                <Button onClick={testCallbackUrl} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Test Callback URL
                </Button>
              </div>
            </div>

            {/* Sample URLs */}
            <div>
              <h3 className="font-semibold mb-3">📋 Sample Callback URLs:</h3>
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-medium text-green-800 mb-1">✅ Success Case:</p>
                  <code className="text-xs text-green-700 break-all">
                    /auth/callback?code=abc123&state=xyz789
                  </code>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm font-medium text-red-800 mb-1">❌ Error Case:</p>
                  <code className="text-xs text-red-700 break-all">
                    /auth/callback?error=access_denied&state=xyz789
                  </code>
                </div>
              </div>
            </div>

            {/* NextAuth Endpoints */}
            <div>
              <h3 className="font-semibold mb-3">🔗 NextAuth Endpoints:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge>OAuth Callback</Badge>
                  <code>/api/auth/callback/authsys</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Custom Callback</Badge>
                  <code>/auth/callback</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Sign In</Badge>
                  <code>/auth/signin</code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Session</Badge>
                  <code>/api/auth/session</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Debug callback page with Suspense boundary
 */
export default function DebugCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebugCallbackContent />
    </Suspense>
  )
}