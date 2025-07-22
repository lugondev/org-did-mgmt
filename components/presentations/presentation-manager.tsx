'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Eye, Send, FileText, Clock, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface PresentationRequest {
  id: string
  name: string
  description?: string
  requiredCredentials: {
    type: string
    issuer?: string
    required: boolean
  }[]
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  createdAt: string
  expiresAt?: string
  author: {
    name: string
    email: string
  }
  _count: {
    submissions: number
  }
}

interface PresentationSubmission {
  id: string
  presentationRequestId: string
  submittedBy: {
    name: string
    email: string
  }
  presentation: any
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  submittedAt: string
  verifiedAt?: string
  verificationResult?: {
    valid: boolean
    error?: string
  }
  presentationRequest: {
    name: string
  }
}

interface PresentationManagerProps {
  className?: string
}

export function PresentationManager({ className }: PresentationManagerProps) {
  const [activeTab, setActiveTab] = useState('requests')
  const [requests, setRequests] = useState<PresentationRequest[]>([])
  const [submissions, setSubmissions] = useState<PresentationSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  
  // Form states
  const [newRequest, setNewRequest] = useState({
    name: '',
    description: '',
    requiredCredentials: [{ type: '', issuer: '', required: true }],
    expiresAt: ''
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests()
    } else {
      fetchSubmissions()
    }
  }, [activeTab])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/presentations/requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to fetch presentation requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/presentations/submissions')
      if (!response.ok) throw new Error('Failed to fetch submissions')
      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to fetch presentation submissions')
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async () => {
    try {
      setCreating(true)
      
      if (!newRequest.name.trim()) {
        throw new Error('Request name is required')
      }
      
      if (newRequest.requiredCredentials.some(cred => !cred.type.trim())) {
        throw new Error('All credential types must be specified')
      }

      const response = await fetch('/api/presentations/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newRequest.name,
          description: newRequest.description || undefined,
          requiredCredentials: newRequest.requiredCredentials.filter(cred => cred.type.trim()),
          expiresAt: newRequest.expiresAt || undefined
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create request')
      }
      
      toast.success('Presentation request created successfully')
      setNewRequest({
        name: '',
        description: '',
        requiredCredentials: [{ type: '', issuer: '', required: true }],
        expiresAt: ''
      })
      fetchRequests()
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create request')
    } finally {
      setCreating(false)
    }
  }

  const verifySubmission = async (submissionId: string) => {
    try {
      setVerifying(submissionId)
      
      const response = await fetch(`/api/presentations/submissions/${submissionId}/verify`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to verify submission')
      }
      
      toast.success('Presentation verified successfully')
      fetchSubmissions()
    } catch (error) {
      console.error('Error verifying submission:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to verify submission')
    } finally {
      setVerifying(null)
    }
  }

  const addCredentialRequirement = () => {
    setNewRequest(prev => ({
      ...prev,
      requiredCredentials: [...prev.requiredCredentials, { type: '', issuer: '', required: true }]
    }))
  }

  const removeCredentialRequirement = (index: number) => {
    setNewRequest(prev => ({
      ...prev,
      requiredCredentials: prev.requiredCredentials.filter((_, i) => i !== index)
    }))
  }

  const updateCredentialRequirement = (index: number, field: string, value: string | boolean) => {
    setNewRequest(prev => ({
      ...prev,
      requiredCredentials: prev.requiredCredentials.map((cred, i) => 
        i === index ? { ...cred, [field]: value } : cred
      )
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.presentationRequest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Presentation Manager</h2>
        <p className="text-muted-foreground">
          Create presentation requests and manage submissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests">Presentation Requests</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Create Request Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Presentation Request</span>
              </CardTitle>
              <CardDescription>
                Define what credentials you need from presenters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Request Name</Label>
                  <Input
                    id="name"
                    value={newRequest.name}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Employee Verification"
                  />
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newRequest.expiresAt}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this presentation request is for..."
                />
              </div>
              
              <div>
                <Label>Required Credentials</Label>
                <div className="space-y-2">
                  {newRequest.requiredCredentials.map((cred, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded">
                      <div className="flex-1">
                        <Input
                          value={cred.type}
                          onChange={(e) => updateCredentialRequirement(index, 'type', e.target.value)}
                          placeholder="Credential type (e.g., EmployeeCredential)"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={cred.issuer}
                          onChange={(e) => updateCredentialRequirement(index, 'issuer', e.target.value)}
                          placeholder="Issuer DID (optional)"
                        />
                      </div>
                      {newRequest.requiredCredentials.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCredentialRequirement(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addCredentialRequirement}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credential Requirement
                  </Button>
                </div>
              </div>
              
              <Button onClick={createRequest} disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Request
              </Button>
            </CardContent>
          </Card>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Presentation Requests</CardTitle>
              <CardDescription>
                Manage your presentation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No presentation requests found</p>
                  <p className="text-sm">Create your first request to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{request.name}</h3>
                          {request.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.description}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span>
                          <p className="text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {request.expiresAt && (
                          <div>
                            <span className="font-medium">Expires:</span>
                            <p className="text-muted-foreground">
                              {new Date(request.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium">Submissions:</span>
                          <p className="text-muted-foreground">
                            {request._count.submissions}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="font-medium text-sm">Required Credentials:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {request.requiredCredentials.map((cred, index) => (
                            <Badge key={index} variant="outline">
                              {cred.type}
                              {cred.issuer && ` (${cred.issuer.slice(0, 20)}...)`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Presentation Submissions</CardTitle>
              <CardDescription>
                Review and verify submitted presentations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search submissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4" />
                  <p>No submissions found</p>
                  <p className="text-sm">Submissions will appear here when users respond to your requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{submission.presentationRequest.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {submission.submittedBy.name} ({submission.submittedBy.email})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(submission.status)}
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">Submitted:</span>
                          <p className="text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        
                        {submission.verifiedAt && (
                          <div>
                            <span className="font-medium">Verified:</span>
                            <p className="text-muted-foreground">
                              {new Date(submission.verifiedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {submission.verificationResult?.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Verification Error:</strong> {submission.verificationResult.error}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Presentation
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Presentation Details</DialogTitle>
                              <DialogDescription>
                                Submitted for: {submission.presentationRequest.name}
                              </DialogDescription>
                            </DialogHeader>
                            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                              {JSON.stringify(submission.presentation, null, 2)}
                            </pre>
                          </DialogContent>
                        </Dialog>
                        
                        {submission.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => verifySubmission(submission.id)}
                            disabled={verifying === submission.id}
                          >
                            {verifying === submission.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}