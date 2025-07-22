'use client'

import { DialogTrigger } from '@/components/ui/dialog'
import { useState, useMemo, useEffect } from 'react'
import { Shield, Plus, CheckCircle, XCircle, Clock, X, AlertCircle, FileText } from 'lucide-react'
import { useVerificationRequests, useVerificationPolicies } from '@/hooks/use-verification'
import { toast } from 'sonner'
import type { VerificationRequest, VerificationPolicy } from '@/hooks/use-verification'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

// Type definitions for form data
interface PolicyFormData {
  name: string
  description: string
  credentialTypes: string[]
  requiredAttributes: string[]
  validityPeriod: string
  autoApprove: boolean
  requireManualReview: boolean
}

// Static data removed - now using API hooks

/**
 * Get the appropriate icon for verification status
 * @param status - The verification status
 * @returns JSX element representing the status icon
 */
const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />
  }
}

/**
 * Get the appropriate badge for verification status
 * @param status - The verification status
 * @returns JSX element representing the status badge
 */
const getStatusBadge = (status: string): JSX.Element => {
  switch (status) {
    case 'approved':
      return <Badge variant="success">Approved</Badge>
    case 'rejected':
      return <Badge variant="error">Rejected</Badge>
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

export default function VerificationPage(): JSX.Element {
  const [createPolicyDialogOpen, setCreatePolicyDialogOpen] = useState<boolean>(false)
  const [editPolicyDialogOpen, setEditPolicyDialogOpen] = useState<boolean>(false)
  const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState<boolean>(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState<boolean>(false)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<VerificationPolicy | null>(null)
  const [approveNotes, setApproveNotes] = useState<string>('')
  const [rejectNotes, setRejectNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Use verification hooks
  const {
    requests: verificationRequests,
    loading: requestsLoading,
    error: requestsError,
    fetchRequests,
    approveRequest,
    rejectRequest,
    getRequestDetails
  } = useVerificationRequests()
  
  const {
    policies,
    loading: policiesLoading,
    error: policiesError,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    getPolicyDetails
  } = useVerificationPolicies()

  // Fetch data on component mount
  useEffect(() => {
    fetchRequests()
    fetchPolicies()
  }, [fetchRequests, fetchPolicies])

  // Memoized filtered policies count for better performance
  const activePolicies = useMemo<number>(
    () => policies.filter(policy => policy.status === 'active').length,
    [policies]
  )

  // Memoized pending requests count for better performance
  const pendingRequests = useMemo<number>(
    () => verificationRequests.filter(request => request.status === 'pending').length,
    [verificationRequests]
  )
  
  // Form state
  const [policyData, setPolicyData] = useState<PolicyFormData>({
    name: '',
    description: '',
    credentialTypes: [],
    requiredAttributes: [],
    validityPeriod: '30',
    autoApprove: false,
    requireManualReview: true
  })

  /**
   * Handle opening the create policy dialog
   */
  const handleCreatePolicy = (): void => {
    setCreatePolicyDialogOpen(true)
  }

  /**
   * Handle opening the edit policy dialog
   */
  const handleEditPolicy = async (policy: VerificationPolicy): Promise<void> => {
    const details = await getPolicyDetails(policy.id)
    if (details) {
      setSelectedPolicy(details)
      setPolicyData({
        name: details.name,
        description: details.description,
        credentialTypes: details.credentialTypes,
        requiredAttributes: details.requiredAttributes,
        validityPeriod: details.validityPeriod.toString(),
        autoApprove: details.autoApprove,
        requireManualReview: details.requireManualReview
      })
      setEditPolicyDialogOpen(true)
    }
  }

  /**
   * Handle opening the delete policy dialog
   */
  const handleDeletePolicy = (policy: VerificationPolicy): void => {
    setSelectedPolicy(policy)
    setDeletePolicyDialogOpen(true)
  }

  /**
   * Handle confirming policy deletion
   */
  const handleConfirmDeletePolicy = async (): Promise<void> => {
    if (!selectedPolicy) return
    
    setIsLoading(true)
    try {
      const success = await deletePolicy(selectedPolicy.id)
      if (success) {
        setDeletePolicyDialogOpen(false)
        setSelectedPolicy(null)
        toast.success('Policy deleted successfully!')
      } else {
        toast.error('Failed to delete policy. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting policy:', error)
      toast.error('Failed to delete policy. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle adding a credential type to the policy
   * @param type - The credential type to add
   */
  const handleAddCredentialType = (type: string): void => {
    if (type && !policyData.credentialTypes.includes(type)) {
      setPolicyData(prev => ({
        ...prev,
        credentialTypes: [...prev.credentialTypes, type]
      }))
    }
  }

  /**
   * Handle removing a credential type from the policy
   * @param type - The credential type to remove
   */
  const handleRemoveCredentialType = (type: string): void => {
    setPolicyData(prev => ({
      ...prev,
      credentialTypes: prev.credentialTypes.filter(t => t !== type)
    }))
  }

  /**
   * Handle adding a required attribute to the policy
   * @param attribute - The attribute to add
   */
  const handleAddAttribute = (attribute: string): void => {
    if (attribute && !policyData.requiredAttributes.includes(attribute)) {
      setPolicyData(prev => ({
        ...prev,
        requiredAttributes: [...prev.requiredAttributes, attribute]
      }))
    }
  }

  /**
   * Handle removing a required attribute from the policy
   * @param attribute - The attribute to remove
   */
  const handleRemoveAttribute = (attribute: string): void => {
    setPolicyData(prev => ({
      ...prev,
      requiredAttributes: prev.requiredAttributes.filter(a => a !== attribute)
    }))
  }

  /**
   * Handle form submission for creating a new verification policy
   */
  const handleSubmitPolicy = async (): Promise<void> => {
    // Basic validation
    if (!policyData.name.trim()) {
      toast.error('Policy name is required')
      return
    }
    
    if (!policyData.description.trim()) {
      toast.error('Policy description is required')
      return
    }
    
    if (policyData.credentialTypes.length === 0) {
      toast.error('At least one credential type is required')
      return
    }
    
    setIsLoading(true)
    try {
      const result = await createPolicy(policyData)
      
      if (result) {
        setCreatePolicyDialogOpen(false)
        setPolicyData({
          name: '',
          description: '',
          credentialTypes: [],
          requiredAttributes: [],
          validityPeriod: '30',
          autoApprove: false,
          requireManualReview: true
        })
        toast.success('Policy created successfully!')
      } else {
        toast.error(policiesError || 'Failed to create policy. Please try again.')
      }
    } catch (error) {
      console.error('Error creating policy:', error)
      toast.error('Failed to create policy. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle form submission for updating an existing verification policy
   */
  const handleUpdatePolicy = async (): Promise<void> => {
    if (!selectedPolicy) return
    
    // Basic validation
    if (!policyData.name.trim()) {
      toast.error('Policy name is required')
      return
    }
    
    if (!policyData.description.trim()) {
      toast.error('Policy description is required')
      return
    }
    
    if (policyData.credentialTypes.length === 0) {
      toast.error('At least one credential type is required')
      return
    }
    
    setIsLoading(true)
    try {
      const result = await updatePolicy(selectedPolicy.id, {
        name: policyData.name,
        description: policyData.description,
        credentialTypes: policyData.credentialTypes,
        requiredAttributes: policyData.requiredAttributes,
        validityPeriod: parseInt(policyData.validityPeriod),
        autoApprove: policyData.autoApprove,
        requireManualReview: policyData.requireManualReview
      })
      
      if (result) {
        setEditPolicyDialogOpen(false)
        setSelectedPolicy(null)
        setPolicyData({
          name: '',
          description: '',
          credentialTypes: [],
          requiredAttributes: [],
          validityPeriod: '30',
          autoApprove: false,
          requireManualReview: true
        })
        toast.success('Policy updated successfully!')
      } else {
        toast.error(policiesError || 'Failed to update policy. Please try again.')
      }
    } catch (error) {
      console.error('Error updating policy:', error)
      toast.error('Failed to update policy. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Handle opening approve dialog
   * @param request - The request to approve
   */
  const handleOpenApprove = (request: VerificationRequest): void => {
    setSelectedRequest(request)
    setApproveNotes('')
    setApproveDialogOpen(true)
  }

  /**
   * Handle approving a verification request
   */
  const handleApprove = async (): Promise<void> => {
    if (!selectedRequest) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verification/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          reviewNotes: approveNotes.trim() || undefined,
          reviewerId: 'admin@example.com', // In real app, get from auth context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve request')
      }

      // Refresh the data
      await fetchRequests()
      
      setApproveDialogOpen(false)
      setApproveNotes('')
      setSelectedRequest(null)
      toast.success('Request approved successfully!')
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Handle opening reject dialog
   * @param request - The request to reject
   */
  const handleOpenReject = (request: VerificationRequest): void => {
    setSelectedRequest(request)
    setRejectNotes('')
    setRejectDialogOpen(true)
  }

  /**
   * Handle rejecting a verification request
   */
  const handleReject = async (): Promise<void> => {
    if (!selectedRequest) return
    
    if (!rejectNotes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verification/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          reviewNotes: rejectNotes.trim(),
          reviewerId: 'admin@example.com', // In real app, get from auth context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject request')
      }

      // Refresh the data
      await fetchRequests()
      
      setRejectDialogOpen(false)
      setRejectNotes('')
      setSelectedRequest(null)
      toast.success('Request rejected successfully!')
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Handle viewing details of a verification request
   * @param request - The request to view details for
   */
  const handleViewDetails = async (request: VerificationRequest): Promise<void> => {
    const details = await getRequestDetails(request.id)
    if (details) {
      setSelectedRequest(details)
      setDetailsDialogOpen(true)
    }
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Verification
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Manage credential verification requests and policies
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" onClick={handleCreatePolicy}>
            <Plus className="mr-2 h-4 w-4" />
            Create Verification Policy
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
               <FileText className="h-4 w-4 text-didmgmt-text-secondary" />
             </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requestsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  verificationRequests.length
                )}
              </div>
              <p className="text-xs text-didmgmt-text-secondary">
                All verification requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-didmgmt-text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 {requestsLoading ? (
                   <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                 ) : (
                   pendingRequests
                 )}
               </div>
              <p className="text-xs text-didmgmt-text-secondary">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
              <Shield className="h-4 w-4 text-didmgmt-text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 {policiesLoading ? (
                   <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                 ) : (
                   activePolicies
                 )}
               </div>
              <p className="text-xs text-didmgmt-text-secondary">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Verification Requests</TabsTrigger>
            <TabsTrigger value="policies">Verification Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              {/* Loading state */}
              {requestsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-didmgmt-blue mx-auto mb-2"></div>
                    <p className="text-sm text-didmgmt-text-secondary">Loading verification requests...</p>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {requestsError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="flex items-center gap-2 pt-6">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">{requestsError}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => fetchRequests()}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Empty state */}
              {!requestsLoading && !requestsError && verificationRequests.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 text-didmgmt-text-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No verification requests</h3>
                    <p className="text-didmgmt-text-secondary">There are no verification requests at the moment.</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Requests list */}
              {!requestsLoading && verificationRequests.map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {request.credential?.type || 'Unknown Credential'}
                          </CardTitle>
                          <CardDescription>
                            Requested by {request.requester?.email || 'Unknown User'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <span className="text-sm text-didmgmt-text-secondary">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  {request.status === 'pending' && (
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleOpenApprove(request)}
                          disabled={requestsLoading}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenReject(request)}
                          disabled={requestsLoading}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewDetails(request)}
                          disabled={requestsLoading}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policies">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Verification Policies</h3>
                <Dialog open={createPolicyDialogOpen} onOpenChange={setCreatePolicyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
                      disabled={policiesLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Policy
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              {/* Loading state */}
              {policiesLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-didmgmt-blue mx-auto mb-2"></div>
                    <p className="text-sm text-didmgmt-text-secondary">Loading verification policies...</p>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {policiesError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="flex items-center gap-2 pt-6">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">{policiesError}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => fetchPolicies()}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Empty state */}
              {!policiesLoading && !policiesError && policies.length === 0 && (
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-didmgmt-blue/10">
                      <Shield className="h-8 w-8 text-didmgmt-blue" />
                    </div>
                    <CardTitle>Verification Policies</CardTitle>
                    <CardDescription>
                      Create and manage automated verification policies for
                      different credential types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" onClick={handleCreatePolicy}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Policy
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Policies list */}
              {!policiesLoading && policies.map(policy => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{policy.name}</CardTitle>
                        <CardDescription>{policy.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                          {policy.status}
                        </Badge>
                        <span className="text-sm text-didmgmt-text-secondary">
                          {new Date(policy.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Credential Types</h4>
                        <div className="flex flex-wrap gap-1">
                          {policy.credentialTypes.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {policy.requiredAttributes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Required Attributes</h4>
                          <div className="flex flex-wrap gap-1">
                            {policy.requiredAttributes.map(attr => (
                              <Badge key={attr} variant="secondary" className="text-xs">
                                {attr}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-didmgmt-text-secondary">
                          <span>Validity: {policy.validityPeriod} days</span>
                          {policy.autoApprove && <span>Auto-approve enabled</span>}
                          {policy.requireManualReview && <span>Manual review required</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPolicy(policy)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePolicy(policy)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve Request Modal */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Verification Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this verification request?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Credential Type:</p>
                <p className="text-sm text-gray-600">{selectedRequest.credential?.type || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Requester:</p>
                <p className="text-sm text-gray-600">{selectedRequest.requester?.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approve-notes">Approval Notes (Optional)</Label>
                <Textarea
                  id="approve-notes"
                  placeholder="Add any notes for this approval..."
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleApprove}
              disabled={isLoading}
            >
              {isLoading ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Modal */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Credential Type:</p>
                <p className="text-sm text-gray-600">{selectedRequest.credential?.type || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Requester:</p>
                <p className="text-sm text-gray-600">{selectedRequest.requester?.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-notes">Rejection Reason *</Label>
                <Textarea
                  id="reject-notes"
                  placeholder="Please explain why this request is being rejected..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isLoading || !rejectNotes.trim()}
            >
              {isLoading ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Verification Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this verification request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Request ID</p>
                  <p className="text-sm text-gray-600 font-mono">{selectedRequest.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRequest.status)}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Requester Information</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Email: {selectedRequest.requester?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Name: {selectedRequest.requester?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Credential Information</p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Type: {selectedRequest.credential?.type || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Issuer: {selectedRequest.credential?.issuer || 'N/A'}</p>
                  {selectedRequest.credential?.issuedAt && (
                    <p className="text-sm text-gray-600">
                      Issued: {new Date(selectedRequest.credential.issuedAt).toLocaleDateString()}
                    </p>
                  )}
                  {selectedRequest.credential?.expiresAt && (
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(selectedRequest.credential.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedRequest.reviewNotes && (
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <p className="text-sm font-medium mb-1">Review Notes</p>
                   <p className="text-sm text-gray-600">{selectedRequest.reviewNotes}</p>
                 </div>
               )}
               
               {selectedRequest.reviewerId && (
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <p className="text-sm font-medium mb-1">Review Information</p>
                   <div className="space-y-1">
                     <p className="text-sm text-gray-600">Reviewer ID: {selectedRequest.reviewerId}</p>
                     {selectedRequest.reviewedAt && (
                       <p className="text-sm text-gray-600">
                         Reviewed at: {new Date(selectedRequest.reviewedAt).toLocaleString()}
                       </p>
                     )}
                   </div>
                 </div>
               )}
              
              {selectedRequest.credential?.data && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Credential Data</p>
                  <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-32">
                    {JSON.stringify(selectedRequest.credential.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    handleOpenApprove(selectedRequest)
                  }}
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setDetailsDialogOpen(false)
                    handleOpenReject(selectedRequest)
                  }}
                >
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Policy Dialog */}
      <Dialog open={createPolicyDialogOpen} onOpenChange={setCreatePolicyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Verification Policy</DialogTitle>
            <DialogDescription>
              Define rules and requirements for automatic credential verification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="policy-name">Policy Name</Label>
                <Input
                  id="policy-name"
                  placeholder="Enter policy name"
                  value={policyData.name}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="policy-description">Description</Label>
                <Textarea
                  id="policy-description"
                  placeholder="Describe the purpose and scope of this policy"
                  value={policyData.description}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Credential Types */}
            <div className="space-y-3">
              <Label>Supported Credential Types</Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => handleAddCredentialType(value as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identity Credential">Identity Credential</SelectItem>
                    <SelectItem value="Age Credential">Age Credential</SelectItem>
                    <SelectItem value="Education Credential">Education Credential</SelectItem>
                    <SelectItem value="Employment Credential">Employment Credential</SelectItem>
                    <SelectItem value="Address Credential">Address Credential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {policyData.credentialTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {policyData.credentialTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveCredentialType(type)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Required Attributes */}
            <div className="space-y-3">
              <Label>Required Attributes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add required attribute"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAttribute(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              {policyData.requiredAttributes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {policyData.requiredAttributes.map((attr) => (
                    <Badge key={attr} variant="outline" className="flex items-center gap-1">
                      {attr}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveAttribute(attr)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Policy Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="validity-period">Validity Period (days)</Label>
                <Select
                  value={policyData.validityPeriod}
                  onValueChange={(value) => setPolicyData(prev => ({ ...prev, validityPeriod: value as PolicyFormData['validityPeriod'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-approve"
                    checked={policyData.autoApprove}
                    onCheckedChange={(checked) => setPolicyData(prev => ({ ...prev, autoApprove: checked as boolean }))}
                  />
                  <Label htmlFor="auto-approve">Enable automatic approval</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manual-review"
                    checked={policyData.requireManualReview}
                    onCheckedChange={(checked) => setPolicyData(prev => ({ ...prev, requireManualReview: checked as boolean }))}
                  />
                  <Label htmlFor="manual-review">Require manual review for edge cases</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreatePolicyDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPolicy}
              disabled={isLoading || !policyData.name || policyData.credentialTypes.length === 0}
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Policy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Modal */}
      <Dialog open={editPolicyDialogOpen} onOpenChange={setEditPolicyDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Verification Policy</DialogTitle>
            <DialogDescription>
              Update the verification policy settings and requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-policy-name">Policy Name</Label>
                <Input
                  id="edit-policy-name"
                  value={policyData.name}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter policy name"
                />
              </div>

              <div>
                <Label htmlFor="edit-policy-description">Description</Label>
                <Textarea
                  id="edit-policy-description"
                  value={policyData.description}
                  onChange={(e) => setPolicyData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this policy is for"
                  rows={3}
                />
              </div>
            </div>

            {/* Credential Types */}
            <div className="space-y-3">
              <Label>Supported Credential Types</Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => handleAddCredentialType(value as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Add credential type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Identity Credential">Identity Credential</SelectItem>
                    <SelectItem value="Age Credential">Age Credential</SelectItem>
                    <SelectItem value="Education Credential">Education Credential</SelectItem>
                    <SelectItem value="Employment Credential">Employment Credential</SelectItem>
                    <SelectItem value="Address Credential">Address Credential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {policyData.credentialTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {policyData.credentialTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      {type}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveCredentialType(type)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Required Attributes */}
            <div className="space-y-3">
              <Label>Required Attributes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add required attribute"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAttribute(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
              {policyData.requiredAttributes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {policyData.requiredAttributes.map((attr) => (
                    <Badge key={attr} variant="outline" className="flex items-center gap-1">
                      {attr}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveAttribute(attr)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Policy Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-validity-period">Validity Period (days)</Label>
                <Select
                  value={policyData.validityPeriod}
                  onValueChange={(value) => setPolicyData(prev => ({ ...prev, validityPeriod: value as PolicyFormData['validityPeriod'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-auto-approve"
                    checked={policyData.autoApprove}
                    onCheckedChange={(checked) => setPolicyData(prev => ({ ...prev, autoApprove: checked as boolean }))}
                  />
                  <Label htmlFor="edit-auto-approve">Enable automatic approval</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-manual-review"
                    checked={policyData.requireManualReview}
                    onCheckedChange={(checked) => setPolicyData(prev => ({ ...prev, requireManualReview: checked as boolean }))}
                  />
                  <Label htmlFor="edit-manual-review">Require manual review for edge cases</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditPolicyDialogOpen(false)
                setSelectedPolicy(null)
                setPolicyData({
                  name: '',
                  description: '',
                  credentialTypes: [],
                  requiredAttributes: [],
                  validityPeriod: '30',
                  autoApprove: false,
                  requireManualReview: true
                })
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePolicy}
              disabled={isLoading || !policyData.name || policyData.credentialTypes.length === 0}
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Policy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Policy Confirmation Dialog */}
      <Dialog open={deletePolicyDialogOpen} onOpenChange={setDeletePolicyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Verification Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this verification policy? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">Policy to be deleted:</p>
                <p className="text-sm text-red-600">{selectedPolicy.name}</p>
                <p className="text-xs text-red-500 mt-1">{selectedPolicy.description}</p>
              </div>
              {/* Note: Verification request count check removed as _count is not available in current schema */}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletePolicyDialogOpen(false)
                setSelectedPolicy(null)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeletePolicy}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Policy'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
