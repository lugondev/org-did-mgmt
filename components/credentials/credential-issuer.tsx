'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Award, CheckCircle, AlertCircle, Calendar, User, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { CredentialQR } from '@/components/ui/qr-code'
import { BatchIssuer } from './batch-issuer'

interface CredentialSchema {
  id: string
  name: string
  description: string
  type: string
  version: string
  schema: any
}

interface DIDDocument {
  id: string
  did: string
  status: string
}

interface IssuedCredential {
  id: string
  vcId: string
  type: string
  issuer: string
  holder: string
  issuanceDate: string
  expirationDate?: string
  status: string
}

interface CredentialFormData {
  schemaId: string
  recipientDID: string
  credentialSubject: any
  expirationDate?: string
  type: string[]
  context: string[]
}

interface CredentialIssuerProps {
  className?: string
}

export function CredentialIssuer({ className }: CredentialIssuerProps) {
  const [schemas, setSchemas] = useState<CredentialSchema[]>([])
  const [didDocuments, setDidDocuments] = useState<DIDDocument[]>([])
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [issuing, setIssuing] = useState(false)
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [selectedSchema, setSelectedSchema] = useState<CredentialSchema | null>(null)
  const [formData, setFormData] = useState<CredentialFormData>({
    schemaId: '',
    recipientDID: '',
    credentialSubject: {},
    type: ['VerifiableCredential'],
    context: ['https://www.w3.org/2018/credentials/v1']
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [schemasRes, didRes, credentialsRes] = await Promise.all([
        fetch('/api/schemas'),
        fetch('/api/did'),
        fetch('/api/credentials')
      ])

      if (schemasRes.ok) {
        const schemasData = await schemasRes.json()
        setSchemas(schemasData.schemas.filter((s: any) => s.status === 'PUBLISHED'))
      }

      if (didRes.ok) {
        const didData = await didRes.json()
        setDidDocuments(didData.didDocuments.filter((d: any) => d.status === 'ACTIVE'))
      }

      if (credentialsRes.ok) {
        const credentialsData = await credentialsRes.json()
        setIssuedCredentials(credentialsData.credentials || [])
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSchemaSelect = (schemaId: string) => {
    const schema = schemas.find(s => s.id === schemaId)
    if (schema) {
      setSelectedSchema(schema)
      setFormData({
        ...formData,
        schemaId,
        type: ['VerifiableCredential', schema.type],
        credentialSubject: generateDefaultSubject(schema.schema)
      })
    }
  }

  const generateDefaultSubject = (schema: any) => {
    const subject: any = { id: '' }
    
    if (schema.properties?.credentialSubject?.properties) {
      const props = schema.properties.credentialSubject.properties
      Object.keys(props).forEach(key => {
        if (key !== 'id') {
          const prop = props[key]
          switch (prop.type) {
            case 'string':
              subject[key] = ''
              break
            case 'number':
              subject[key] = 0
              break
            case 'boolean':
              subject[key] = false
              break
            case 'array':
              subject[key] = []
              break
            case 'object':
              subject[key] = {}
              break
            default:
              subject[key] = ''
          }
        }
      })
    }
    
    return subject
  }

  const issueCredential = async () => {
    try {
      setIssuing(true)
      
      if (!formData.schemaId || !formData.recipientDID || !formData.credentialSubject.id) {
        throw new Error('Please fill in all required fields')
      }

      const response = await fetch('/api/credentials/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          credentialSubject: {
            ...formData.credentialSubject,
            id: formData.recipientDID
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to issue credential')
      }
      
      const data = await response.json()
      toast.success('Credential issued successfully')
      setShowIssueDialog(false)
      resetForm()
      await fetchInitialData()
    } catch (error) {
      console.error('Error issuing credential:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to issue credential')
    } finally {
      setIssuing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      schemaId: '',
      recipientDID: '',
      credentialSubject: {},
      type: ['VerifiableCredential'],
      context: ['https://www.w3.org/2018/credentials/v1']
    })
    setSelectedSchema(null)
  }

  const updateCredentialSubject = (key: string, value: any) => {
    setFormData({
      ...formData,
      credentialSubject: {
        ...formData.credentialSubject,
        [key]: value
      }
    })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Credential Issuer</h2>
        <p className="text-muted-foreground">
          Issue verifiable credentials to recipients using your schemas
        </p>
      </div>
      
      <Tabs defaultValue="issue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issue">Issue Credential</TabsTrigger>
          <TabsTrigger value="batch">Batch Issuance</TabsTrigger>
          <TabsTrigger value="issued">Issued Credentials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="issue" className="space-y-6">
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogTrigger asChild>
            <Button disabled={didDocuments.length === 0 || schemas.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Issue Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Issue New Credential</DialogTitle>
              <DialogDescription>
                Create and issue a verifiable credential to a recipient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Schema Selection */}
              <div>
                <Label htmlFor="schema">Credential Schema</Label>
                <Select value={formData.schemaId} onValueChange={handleSchemaSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a credential schema" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemas.map((schema) => (
                      <SelectItem key={schema.id} value={schema.id}>
                        {schema.name} (v{schema.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient DID */}
              <div>
                <Label htmlFor="recipient">Recipient DID</Label>
                <Input
                  id="recipient"
                  value={formData.recipientDID}
                  onChange={(e) => setFormData({ ...formData, recipientDID: e.target.value })}
                  placeholder="did:key:z6Mk..."
                />
              </div>

              {/* Expiration Date */}
              <div>
                <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                <Input
                  id="expiration"
                  type="datetime-local"
                  value={formData.expirationDate || ''}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </div>

              {/* Credential Subject */}
              {selectedSchema && (
                <div>
                  <Label>Credential Subject</Label>
                  <div className="space-y-4 p-4 border rounded-lg">
                    {Object.keys(formData.credentialSubject).map((key) => {
                      if (key === 'id') return null
                      
                      const prop = selectedSchema.schema.properties?.credentialSubject?.properties?.[key]
                      const isRequired = selectedSchema.schema.properties?.credentialSubject?.required?.includes(key)
                      
                      return (
                        <div key={key}>
                          <Label htmlFor={key}>
                            {key} {isRequired && <span className="text-red-500">*</span>}
                          </Label>
                          {prop?.description && (
                            <p className="text-sm text-muted-foreground mb-1">{prop.description}</p>
                          )}
                          {prop?.type === 'string' && (
                            <Input
                              id={key}
                              value={formData.credentialSubject[key] || ''}
                              onChange={(e) => updateCredentialSubject(key, e.target.value)}
                              placeholder={prop.description || `Enter ${key}`}
                            />
                          )}
                          {prop?.type === 'number' && (
                            <Input
                              id={key}
                              type="number"
                              value={formData.credentialSubject[key] || ''}
                              onChange={(e) => updateCredentialSubject(key, parseFloat(e.target.value) || 0)}
                              placeholder={prop.description || `Enter ${key}`}
                            />
                          )}
                          {(prop?.type === 'object' || prop?.type === 'array') && (
                            <Textarea
                              id={key}
                              value={JSON.stringify(formData.credentialSubject[key] || {}, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value)
                                  updateCredentialSubject(key, parsed)
                                } catch (error) {
                                  // Invalid JSON, don't update
                                }
                              }}
                              className="font-mono text-sm"
                              rows={4}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={issueCredential} disabled={issuing}>
                  {issuing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Award className="h-4 w-4 mr-2" />
                  )}
                  Issue Credential
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Prerequisites Check */}
        {(didDocuments.length === 0 || schemas.length === 0) && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {didDocuments.length === 0 && "You need to create a DID document first. "}
              {schemas.length === 0 && "You need to create and publish at least one credential schema. "}
              Please complete these prerequisites before issuing credentials.
            </AlertDescription>
          </Alert>
        )}
        </TabsContent>
        
        <TabsContent value="batch" className="space-y-6">
          <BatchIssuer schemas={[]} />
        </TabsContent>
        
        <TabsContent value="issued" className="space-y-6">

      {/* Recent Issued Credentials */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recently Issued Credentials</h3>
        {issuedCredentials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Credentials Issued</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start issuing verifiable credentials to your recipients.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {issuedCredentials.slice(0, 10).map((credential) => (
              <Card key={credential.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base">{credential.type}</CardTitle>
                      <Badge className={getStatusColor(credential.status)}>
                        {credential.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(credential.issuanceDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Holder:</span>
                      </div>
                      <div className="font-mono text-xs truncate">{credential.holder}</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires:</span>
                      </div>
                      <div className="text-xs">
                        {credential.expirationDate 
                          ? new Date(credential.expirationDate).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <CredentialQR
                      credentialId={credential.id}
                      credentialData={credential}
                      className=""
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}