'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Plus, Key, Shield, Copy, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface DIDDocument {
  id: string
  did: string
  method: string
  controller: string
  status: 'ACTIVE' | 'REVOKED' | 'DEACTIVATED'
  createdAt: string
  updatedAt: string
  keyCount: number
  issuedCredentials: number
  receivedCredentials: number
}

interface DIDManagementProps {
  className?: string
}

export function DIDManagement({ className }: DIDManagementProps) {
  const [didDocuments, setDidDocuments] = useState<DIDDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedDID, setSelectedDID] = useState<DIDDocument | null>(null)
  const [resolvedDocument, setResolvedDocument] = useState<any>(null)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    fetchDIDDocuments()
  }, [])

  const fetchDIDDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/did')
      if (!response.ok) {
        throw new Error('Failed to fetch DID documents')
      }
      const data = await response.json()
      setDidDocuments(data.didDocuments)
    } catch (error) {
      console.error('Error fetching DID documents:', error)
      toast.error('Failed to load DID documents')
    } finally {
      setLoading(false)
    }
  }

  const createDIDDocument = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/did', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to create DID document')
      }
      
      const data = await response.json()
      toast.success('DID document created successfully')
      await fetchDIDDocuments()
    } catch (error) {
      console.error('Error creating DID document:', error)
      toast.error('Failed to create DID document')
    } finally {
      setCreating(false)
    }
  }

  const resolveDIDDocument = async (did: string) => {
    try {
      setResolving(true)
      const encodedDID = encodeURIComponent(did)
      const response = await fetch(`/api/did/${encodedDID}`)
      
      if (!response.ok) {
        throw new Error('Failed to resolve DID document')
      }
      
      const data = await response.json()
      setResolvedDocument(data.document)
    } catch (error) {
      console.error('Error resolving DID document:', error)
      toast.error('Failed to resolve DID document')
    } finally {
      setResolving(false)
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
        <span className="ml-2">Loading DID documents...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">DID Management</h2>
          <p className="text-muted-foreground">
            Manage your Decentralized Identifiers and cryptographic keys
          </p>
        </div>
        <Button onClick={createDIDDocument} disabled={creating}>
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create DID
        </Button>
      </div>

      {didDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No DID Documents</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first DID document to start issuing and managing verifiable credentials.
            </p>
            <Button onClick={createDIDDocument} disabled={creating}>
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Your First DID
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {didDocuments.map((did) => (
            <Card key={did.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(did.status)}
                    <CardTitle className="text-lg">{did.method}</CardTitle>
                    <Badge className={getStatusColor(did.status)}>
                      {did.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(did.did)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy DID
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDID(did)
                            resolveDIDDocument(did.did)
                          }}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          View Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>DID Document</DialogTitle>
                          <DialogDescription>
                            Resolved DID document for {selectedDID?.did}
                          </DialogDescription>
                        </DialogHeader>
                        {resolving ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Resolving DID document...</span>
                          </div>
                        ) : resolvedDocument ? (
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            {JSON.stringify(resolvedDocument, null, 2)}
                          </pre>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Failed to resolve DID document
                            </AlertDescription>
                          </Alert>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CardDescription className="font-mono text-xs break-all">
                  {did.did}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{did.keyCount}</div>
                    <div className="text-sm text-muted-foreground">Keys</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{did.issuedCredentials}</div>
                    <div className="text-sm text-muted-foreground">Issued</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{did.receivedCredentials}</div>
                    <div className="text-sm text-muted-foreground">Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(did.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated: {new Date(did.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}