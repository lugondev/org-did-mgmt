'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Key, Shield, Copy, CheckCircle, AlertCircle, Clock, Building } from 'lucide-react'
import { toast } from 'sonner'

interface OrganizationDIDInfo {
  hasDID: boolean
  organization?: {
    id: string
    name: string
    did: string
  }
  didDocument?: {
    id: string
    did: string
    method: string
    controller: string
    status: 'ACTIVE' | 'REVOKED' | 'DEACTIVATED'
    createdAt: string
    updatedAt: string
    keyCount: number
    issuedCredentials: number
  }
}

interface OrganizationDIDManagementProps {
  organizationId: string
  className?: string
}

export function OrganizationDIDManagement({ organizationId, className }: OrganizationDIDManagementProps) {
  const [didInfo, setDidInfo] = useState<OrganizationDIDInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationDID()
    }
  }, [organizationId])

  const fetchOrganizationDID = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizations/${organizationId}/did`)
      if (!response.ok) {
        throw new Error('Failed to fetch organization DID')
      }
      const data = await response.json()
      setDidInfo(data)
    } catch (error) {
      console.error('Error fetching organization DID:', error)
      toast.error('Failed to load organization DID information')
    } finally {
      setLoading(false)
    }
  }

  const createOrganizationDID = async () => {
    try {
      setCreating(true)
      const response = await fetch(`/api/organizations/${organizationId}/did`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create organization DID')
      }
      
      const data = await response.json()
      toast.success('Organization DID created successfully')
      await fetchOrganizationDID()
    } catch (error) {
      console.error('Error creating organization DID:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create organization DID')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REVOKED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'DEACTIVATED':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'REVOKED':
        return 'bg-red-100 text-red-800'
      case 'DEACTIVATED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading organization DID...</span>
      </div>
    )
  }

  if (!didInfo?.hasDID) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Organization DID</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create a Decentralized Identifier for your organization to enable credential issuance and verification.
            </p>
            <Button onClick={createOrganizationDID} disabled={creating}>
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Organization DID
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { didDocument } = didInfo

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Organization DID Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {didDocument && getStatusIcon(didDocument.status)}
                <CardTitle className="text-lg">Organization DID</CardTitle>
                {didDocument && (
                  <Badge className={getStatusColor(didDocument.status)}>
                    {didDocument.status}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => didDocument && copyToClipboard(didDocument.did)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy DID
                </Button>
              </div>
            </div>
            <CardDescription className="font-mono text-xs break-all">
              {didDocument?.did}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {didDocument && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{didDocument.keyCount}</div>
                  <div className="text-sm text-muted-foreground">Cryptographic Keys</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{didDocument.issuedCredentials}</div>
                  <div className="text-sm text-muted-foreground">Credentials Issued</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Method: <span className="font-medium">{didDocument.method}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Controller: <span className="font-mono text-xs">{didDocument.controller.slice(0, 20)}...</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(didDocument.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated: {new Date(didDocument.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DID Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle>DID Usage & Benefits</CardTitle>
            <CardDescription>
              How your organization DID enables verifiable credential operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Credential Issuance</h4>
                  <p className="text-sm text-muted-foreground">
                    Issue verifiable credentials with cryptographic proof of authenticity
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Digital Signatures</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign documents and credentials with your organization's identity
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable others to verify credentials issued by your organization
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Trust Network</h4>
                  <p className="text-sm text-muted-foreground">
                    Participate in decentralized trust networks and ecosystems
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Your organization's DID and associated cryptographic keys are securely stored and managed. 
            Only organization administrators can create or manage the DID configuration.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}