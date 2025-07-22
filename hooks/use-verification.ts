import { useState, useEffect, useCallback } from 'react'

// Types for verification functionality
export interface VerificationRequest {
  id: string
  credentialId: string
  requesterId: string
  verificationPolicyId?: string
  status: 'pending' | 'approved' | 'rejected'
  metadata?: Record<string, any>
  reviewerId?: string
  reviewNotes?: string
  verificationResult?: Record<string, any>
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  credential?: {
    id: string
    type: string
    issuer: string
    data?: Record<string, any>
    issuedAt: string
    expiresAt?: string
  }
  requester?: {
    id: string
    email: string
    name?: string
  }
  reviewer?: {
    email: string
    name?: string
  }
  verificationPolicy?: {
    id: string
    name: string
    description: string
    credentialTypes: string[]
    requiredAttributes: string[]
    autoApprove: boolean
    requireManualReview: boolean
  }
}

export interface VerificationPolicy {
  id: string
  name: string
  description: string
  credentialTypes: string[]
  requiredAttributes: string[]
  validityPeriod: number
  autoApprove: boolean
  requireManualReview: boolean
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface UseVerificationRequestsResult {
  requests: VerificationRequest[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  fetchRequests: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>
  approveRequest: (id: string, reviewNotes?: string) => Promise<boolean>
  rejectRequest: (id: string, reviewNotes?: string) => Promise<boolean>
  getRequestDetails: (id: string) => Promise<VerificationRequest | null>
  createRequest: (data: {
    credentialId: string
    requesterId: string
    verificationPolicyId?: string
    metadata?: Record<string, any>
  }) => Promise<VerificationRequest | null>
}

interface UseVerificationPoliciesResult {
  policies: VerificationPolicy[]
  loading: boolean
  error: string | null
  pagination: PaginationInfo | null
  fetchPolicies: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>
  createPolicy: (data: {
    name: string
    description: string
    credentialTypes: string[]
    requiredAttributes?: string[]
    validityPeriod: string
    autoApprove?: boolean
    requireManualReview?: boolean
  }) => Promise<VerificationPolicy | null>
  updatePolicy: (id: string, data: Partial<VerificationPolicy>) => Promise<VerificationPolicy | null>
  deletePolicy: (id: string) => Promise<boolean>
  getPolicyDetails: (id: string) => Promise<VerificationPolicy | null>
}

/**
 * Custom hook for managing verification requests
 */
export function useVerificationRequests(): UseVerificationRequestsResult {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  /**
   * Fetch verification requests from API
   */
  const fetchRequests = useCallback(async (params?: {
    status?: string
    page?: number
    limit?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())

      const response = await fetch(`/api/verification/requests?${searchParams}`)
      const result: ApiResponse<{
        requests: VerificationRequest[]
        pagination: PaginationInfo
      }> = await response.json()

      if (result.success && result.data) {
        setRequests(result.data.requests)
        setPagination(result.data.pagination)
      } else {
        setError(result.error || 'Failed to fetch verification requests')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching verification requests:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Approve a verification request
   */
  const approveRequest = useCallback(async (
    id: string,
    reviewNotes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/verification/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'verified',
          reviewNotes
        })
      })

      const result: ApiResponse<VerificationRequest> = await response.json()

      if (result.success && result.data) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === id ? result.data! : req
        ))
        return true
      } else {
        setError(result.error || 'Failed to approve request')
        return false
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error approving request:', err)
      return false
    }
  }, [])

  /**
   * Reject a verification request
   */
  const rejectRequest = useCallback(async (
    id: string,
    reviewNotes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/verification/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'failed',
          reviewNotes
        })
      })

      const result: ApiResponse<VerificationRequest> = await response.json()

      if (result.success && result.data) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === id ? result.data! : req
        ))
        return true
      } else {
        setError(result.error || 'Failed to reject request')
        return false
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error rejecting request:', err)
      return false
    }
  }, [])

  /**
   * Get detailed information about a verification request
   */
  const getRequestDetails = useCallback(async (
    id: string
  ): Promise<VerificationRequest | null> => {
    try {
      const response = await fetch(`/api/verification/requests/${id}`)
      const result: ApiResponse<VerificationRequest> = await response.json()

      if (result.success && result.data) {
        return result.data
      } else {
        setError(result.error || 'Failed to fetch request details')
        return null
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching request details:', err)
      return null
    }
  }, [])

  /**
   * Create a new verification request
   */
  const createRequest = useCallback(async (data: {
    credentialId: string
    requesterId: string
    verificationPolicyId?: string
    metadata?: Record<string, any>
  }): Promise<VerificationRequest | null> => {
    try {
      const response = await fetch('/api/verification/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<VerificationRequest> = await response.json()

      if (result.success && result.data) {
        // Add to local state
        setRequests(prev => [result.data!, ...prev])
        return result.data
      } else {
        setError(result.error || 'Failed to create verification request')
        return null
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error creating verification request:', err)
      return null
    }
  }, [])

  return {
    requests,
    loading,
    error,
    pagination,
    fetchRequests,
    approveRequest,
    rejectRequest,
    getRequestDetails,
    createRequest
  }
}

/**
 * Custom hook for managing verification policies
 */
export function useVerificationPolicies(): UseVerificationPoliciesResult {
  const [policies, setPolicies] = useState<VerificationPolicy[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)

  /**
   * Fetch verification policies from API
   */
  const fetchPolicies = useCallback(async (params?: {
    status?: string
    page?: number
    limit?: number
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.status) searchParams.append('status', params.status)
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.limit) searchParams.append('limit', params.limit.toString())

      const response = await fetch(`/api/verification/policies?${searchParams}`)
      const result: ApiResponse<{
        policies: VerificationPolicy[]
        pagination: PaginationInfo
      }> = await response.json()

      if (result.success && result.data) {
        setPolicies(result.data.policies)
        setPagination(result.data.pagination)
      } else {
        setError(result.error || 'Failed to fetch verification policies')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching verification policies:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new verification policy
   */
  const createPolicy = useCallback(async (data: {
    name: string
    description: string
    credentialTypes: string[]
    requiredAttributes?: string[]
    validityPeriod: string
    autoApprove?: boolean
    requireManualReview?: boolean
  }): Promise<VerificationPolicy | null> => {
    try {
      const response = await fetch('/api/verification/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<VerificationPolicy> = await response.json()

      if (result.success && result.data) {
        // Add to local state
        setPolicies(prev => [result.data!, ...prev])
        return result.data
      } else {
        setError(result.error || 'Failed to create verification policy')
        return null
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error creating verification policy:', err)
      return null
    }
  }, [])

  /**
   * Update a verification policy
   */
  const updatePolicy = useCallback(async (
    id: string,
    data: Partial<VerificationPolicy>
  ): Promise<VerificationPolicy | null> => {
    try {
      const response = await fetch(`/api/verification/policies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result: ApiResponse<VerificationPolicy> = await response.json()

      if (result.success && result.data) {
        // Update local state
        setPolicies(prev => prev.map(policy => 
          policy.id === id ? result.data! : policy
        ))
        return result.data
      } else {
        setError(result.error || 'Failed to update verification policy')
        return null
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error updating verification policy:', err)
      return null
    }
  }, [])

  /**
   * Delete a verification policy
   */
  const deletePolicy = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/verification/policies/${id}`, {
        method: 'DELETE'
      })

      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        // Remove from local state
        setPolicies(prev => prev.filter(policy => policy.id !== id))
        return true
      } else {
        setError(result.error || 'Failed to delete verification policy')
        return false
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error deleting verification policy:', err)
      return false
    }
  }, [])

  /**
   * Get detailed information about a verification policy
   */
  const getPolicyDetails = useCallback(async (
    id: string
  ): Promise<VerificationPolicy | null> => {
    try {
      const response = await fetch(`/api/verification/policies/${id}`)
      const result: ApiResponse<VerificationPolicy> = await response.json()

      if (result.success && result.data) {
        return result.data
      } else {
        setError(result.error || 'Failed to fetch policy details')
        return null
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching policy details:', err)
      return null
    }
  }, [])

  return {
    policies,
    loading,
    error,
    pagination,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    getPolicyDetails
  }
}