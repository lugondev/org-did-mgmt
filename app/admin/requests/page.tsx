'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Check, X, Clock, Filter, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Interface for credential request
interface CredentialRequest {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  credentialType: string
  organizationName: string
  purpose: string
  additionalInfo?: string
  documents?: Array<{
    name: string
    size: number
    type: string
  }>
}

// Credential type labels
const CREDENTIAL_TYPE_LABELS: Record<string, string> = {
  education: 'Education Certificate',
  employment: 'Employment Verification',
  professional: 'Professional License',
  identity: 'Identity Verification',
  skill: 'Skill Certification',
  membership: 'Membership Credential',
  other: 'Other'
}

/**
 * Admin Requests Management Page
 * Allows administrators to view and manage credential requests
 */
export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<CredentialRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<CredentialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<CredentialRequest | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewerName, setReviewerName] = useState('Admin User')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  /**
   * Fetch credential requests from API
   */
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/request-credential')
      const result = await response.json()
      
      if (response.ok) {
        setRequests(result.data || [])
      } else {
        console.error('Failed to fetch requests:', result.message)
        toast.error('Failed to load requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Error loading requests')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Filter requests based on search query and status
   */
  const filterRequests = () => {
    let filtered = [...requests]
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(req => 
        req.fullName.toLowerCase().includes(query) ||
        req.email.toLowerCase().includes(query) ||
        req.organizationName.toLowerCase().includes(query) ||
        req.id.toLowerCase().includes(query)
      )
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter)
    }
    
    setFilteredRequests(filtered)
  }

  /**
   * Handle request review (approve/reject)
   */
  const handleReviewSubmit = async () => {
    if (!selectedRequest) return
    
    setIsSubmittingReview(true)
    
    try {
      const response = await fetch('/api/request-credential', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: reviewAction === 'approve' ? 'approved' : 'rejected',
          notes: reviewNotes,
          reviewedBy: reviewerName
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, ...result.data }
            : req
        ))
        
        // Close dialog and reset
        setReviewDialogOpen(false)
        setSelectedRequest(null)
        setReviewNotes('')
        
        toast.success(`Request ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`)
      } else {
        throw new Error(result.message || 'Failed to update request')
      }
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Failed to update request')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'pending': return 'secondary'
      default: return 'outline'
    }
  }

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Load requests on component mount
  useEffect(() => {
    fetchRequests()
  }, [])

  // Filter requests when search query or status filter changes
  useEffect(() => {
    filterRequests()
  }, [requests, searchQuery, statusFilter])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Credential Requests Management
          </h1>
          <p className="text-gray-600">
            Review and manage verifiable credential requests from users.
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, organization, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchRequests} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{requests.length}</div>
              <p className="text-sm text-gray-600">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </div>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === 'rejected').length}
              </div>
              <p className="text-sm text-gray-600">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Credential Requests ({filteredRequests.length})</CardTitle>
            <CardDescription>
              Click on a request to view details and take action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No requests found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Credential Type</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {request.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.fullName}</div>
                            <div className="text-sm text-gray-500">{request.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CREDENTIAL_TYPE_LABELS[request.credentialType] || request.credentialType}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.organizationName}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Request Details - {request.id}</DialogTitle>
                                  <DialogDescription>
                                    Complete information for this credential request
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {/* Personal Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Personal Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div><strong>Full Name:</strong> {request.fullName}</div>
                                      <div><strong>Email:</strong> {request.email}</div>
                                      {request.phone && <div><strong>Phone:</strong> {request.phone}</div>}
                                      {request.dateOfBirth && <div><strong>Date of Birth:</strong> {request.dateOfBirth}</div>}
                                    </div>
                                    {request.address && (
                                      <div className="mt-2 text-sm"><strong>Address:</strong> {request.address}</div>
                                    )}
                                  </div>
                                  
                                  {/* Credential Information */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Credential Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Type:</strong> {CREDENTIAL_TYPE_LABELS[request.credentialType]}</div>
                                      <div><strong>Organization:</strong> {request.organizationName}</div>
                                      <div><strong>Purpose:</strong> {request.purpose}</div>
                                      {request.additionalInfo && (
                                        <div><strong>Additional Info:</strong> {request.additionalInfo}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Supporting Documents */}
                                  {request.documents && request.documents.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-3">Supporting Documents</h4>
                                      <div className="space-y-2">
                                        {request.documents.map((doc, index) => (
                                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm font-medium">{doc.name}</span>
                                            <div className="text-xs text-gray-500">
                                              {doc.type} • {formatFileSize(doc.size)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Review Information */}
                                  {request.reviewedAt && (
                                    <div>
                                      <h4 className="font-semibold mb-3">Review Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Status:</strong> 
                                          <Badge variant={getStatusBadgeVariant(request.status)} className="ml-2">
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                          </Badge>
                                        </div>
                                        <div><strong>Reviewed At:</strong> {new Date(request.reviewedAt).toLocaleString()}</div>
                                        {request.reviewedBy && <div><strong>Reviewed By:</strong> {request.reviewedBy}</div>}
                                        {request.notes && <div><strong>Notes:</strong> {request.notes}</div>}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => {
                                    setSelectedRequest(request)
                                    setReviewAction('approve')
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedRequest(request)
                                    setReviewAction('reject')
                                    setReviewDialogOpen(true)
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Request
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve' 
                  ? 'Approve this credential request and notify the applicant.'
                  : 'Reject this credential request and provide a reason.'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Request Summary</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Applicant:</strong> {selectedRequest.fullName}</div>
                    <div><strong>Email:</strong> {selectedRequest.email}</div>
                    <div><strong>Type:</strong> {CREDENTIAL_TYPE_LABELS[selectedRequest.credentialType]}</div>
                    <div><strong>Organization:</strong> {selectedRequest.organizationName}</div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reviewerName">Reviewer Name</Label>
                  <Input
                    id="reviewerName"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reviewNotes">
                    {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                  </Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={reviewAction === 'approve' 
                      ? 'Add any notes about the approval...'
                      : 'Please provide a reason for rejection...'}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview || (reviewAction === 'reject' && !reviewNotes.trim())}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmittingReview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {reviewAction === 'approve' ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                    {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}