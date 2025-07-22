'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle, Upload, FileText, Clock, User, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface VerificationResult {
  valid: boolean
  checks: {
    cryptographicVerification: boolean
    expired: boolean
    revoked: boolean
    issuerTrusted: boolean
  }
  verificationResult: {
    verified: boolean
    error?: string
  }
  credential?: {
    id: string
    type: string
    issuer: string
    status: string
    issuanceDate: string
    expirationDate?: string
    lastVerifiedAt?: string
  }
  verifiedAt: string
}

interface CredentialVerifierProps {
  className?: string
}

export function CredentialVerifier({ className }: CredentialVerifierProps) {
  const [credentialInput, setCredentialInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [inputMethod, setInputMethod] = useState<'paste' | 'upload'>('paste')

  const verifyCredential = async () => {
    try {
      setVerifying(true)
      setVerificationResult(null)
      
      if (!credentialInput.trim()) {
        throw new Error('Please provide a credential to verify')
      }

      let credential
      try {
        credential = JSON.parse(credentialInput)
      } catch (error) {
        throw new Error('Invalid JSON format. Please provide a valid verifiable credential.')
      }

      const response = await fetch('/api/credentials/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to verify credential')
      }
      
      const result = await response.json()
      setVerificationResult(result)
      
      if (result.valid) {
        toast.success('Credential verification successful')
      } else {
        toast.error('Credential verification failed')
      }
    } catch (error) {
      console.error('Error verifying credential:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to verify credential')
      setVerificationResult({
        valid: false,
        checks: {
          cryptographicVerification: false,
          expired: false,
          revoked: false,
          issuerTrusted: false
        },
        verificationResult: {
          verified: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        verifiedAt: new Date().toISOString()
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCredentialInput(content)
      }
      reader.readAsText(file)
    }
  }

  const clearInput = () => {
    setCredentialInput('')
    setVerificationResult(null)
  }

  const getCheckIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getOverallStatusIcon = (valid: boolean) => {
    return valid ? (
      <CheckCircle className="h-6 w-6 text-green-500" />
    ) : (
      <XCircle className="h-6 w-6 text-red-500" />
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'bg-green-100 text-green-800'
      case 'REVOKED':
        return 'bg-red-100 text-red-800'
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Credential Verifier</h2>
        <p className="text-muted-foreground">
          Verify the authenticity and validity of verifiable credentials
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Credential Input</span>
            </CardTitle>
            <CardDescription>
              Paste or upload a verifiable credential to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'paste' | 'upload')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste JSON</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste" className="space-y-4">
                <div>
                  <Label htmlFor="credential">Verifiable Credential (JSON)</Label>
                  <Textarea
                    id="credential"
                    value={credentialInput}
                    onChange={(e) => setCredentialInput(e.target.value)}
                    placeholder="Paste your verifiable credential JSON here..."
                    className="font-mono text-sm min-h-[200px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="file">Upload Credential File</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <input
                      id="file"
                      type="file"
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-2">
              <Button 
                onClick={verifyCredential} 
                disabled={verifying || !credentialInput.trim()}
                className="flex-1"
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Verify Credential
              </Button>
              <Button variant="outline" onClick={clearInput}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Verification Results</span>
            </CardTitle>
            <CardDescription>
              Detailed verification status and security checks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!verificationResult ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mb-4" />
                <p>No verification performed yet</p>
                <p className="text-sm">Provide a credential to see verification results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  {getOverallStatusIcon(verificationResult.valid)}
                  <div>
                    <h3 className="font-semibold">
                      {verificationResult.valid ? 'Verification Successful' : 'Verification Failed'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Verified at {new Date(verificationResult.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Security Checks */}
                <div>
                  <h4 className="font-semibold mb-3">Security Checks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">Cryptographic Signature</span>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(verificationResult.checks.cryptographicVerification)}
                        <span className="text-sm">
                          {verificationResult.checks.cryptographicVerification ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">Not Expired</span>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(!verificationResult.checks.expired)}
                        <span className="text-sm">
                          {verificationResult.checks.expired ? 'Expired' : 'Valid'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">Not Revoked</span>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(!verificationResult.checks.revoked)}
                        <span className="text-sm">
                          {verificationResult.checks.revoked ? 'Revoked' : 'Valid'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm">Trusted Issuer</span>
                      <div className="flex items-center space-x-2">
                        {getCheckIcon(verificationResult.checks.issuerTrusted)}
                        <span className="text-sm">
                          {verificationResult.checks.issuerTrusted ? 'Trusted' : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credential Details */}
                {verificationResult.credential && (
                  <div>
                    <h4 className="font-semibold mb-3">Credential Details</h4>
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Type:</span>
                        <span className="text-sm">{verificationResult.credential.type}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge className={getStatusColor(verificationResult.credential.status)}>
                          {verificationResult.credential.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Issuer:</span>
                        <span className="text-xs font-mono truncate max-w-[200px]">
                          {verificationResult.credential.issuer}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Issued:</span>
                        <span className="text-sm">
                          {new Date(verificationResult.credential.issuanceDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {verificationResult.credential.expirationDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Expires:</span>
                          <span className="text-sm">
                            {new Date(verificationResult.credential.expirationDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {verificationResult.credential.lastVerifiedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Last Verified:</span>
                          <span className="text-sm">
                            {new Date(verificationResult.credential.lastVerifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {verificationResult.verificationResult.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Verification Error:</strong> {verificationResult.verificationResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}