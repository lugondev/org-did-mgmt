'use client'

import { useState, useEffect } from 'react'
import {
  Partner,
  Network,
  PartnerConnection,
  EcosystemStats,
  ApiResponse,
  PaginatedResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  CreateNetworkRequest,
  UpdateNetworkRequest,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  PartnerFilters,
  NetworkFilters,
  ConnectionFilters
} from '@/types/ecosystem'

// Partners Hook
export function usePartners(filters?: PartnerFilters) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchPartners = async (newFilters?: PartnerFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      const currentFilters = { ...filters, ...newFilters }
      
      Object.entries(currentFilters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/ecosystem/partners?${params}`)
      const result: PaginatedResponse<Partner> = await response.json()

      if (result.success && result.data) {
        setPartners(result.data.partners || [])
        setPagination(result.data.pagination)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch partners')
      }
    } catch (err) {
      setError('Failed to fetch partners')
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPartner = async (data: CreatePartnerRequest): Promise<Partner | null> => {
    try {
      const response = await fetch('/api/ecosystem/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result: ApiResponse<Partner> = await response.json()

      if (result.success && result.data) {
        await fetchPartners() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to create partner')
        return null
      }
    } catch (err) {
      setError('Failed to create partner')
      console.error('Error creating partner:', err)
      return null
    }
  }

  const updatePartner = async (id: string, data: UpdatePartnerRequest): Promise<Partner | null> => {
    try {
      const response = await fetch(`/api/ecosystem/partners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result: ApiResponse<Partner> = await response.json()

      if (result.success && result.data) {
        await fetchPartners() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to update partner')
        return null
      }
    } catch (err) {
      setError('Failed to update partner')
      console.error('Error updating partner:', err)
      return null
    }
  }

  const deletePartner = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/ecosystem/partners/${id}`, {
        method: 'DELETE'
      })
      const result: ApiResponse<any> = await response.json()

      if (result.success) {
        await fetchPartners() // Refresh list
        return true
      } else {
        setError(result.error || 'Failed to delete partner')
        return false
      }
    } catch (err) {
      setError('Failed to delete partner')
      console.error('Error deleting partner:', err)
      return false
    }
  }

  useEffect(() => {
    fetchPartners()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    partners,
    loading,
    error,
    pagination,
    fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
    refetch: () => fetchPartners()
  }
}

// Networks Hook
export function useNetworks(filters?: NetworkFilters) {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchNetworks = async (newFilters?: NetworkFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      const currentFilters = { ...filters, ...newFilters }
      
      Object.entries(currentFilters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/ecosystem/networks?${params}`)
      const result: PaginatedResponse<Network> = await response.json()

      if (result.success && result.data) {
        setNetworks(result.data.networks || [])
        setPagination(result.data.pagination)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch networks')
      }
    } catch (err) {
      setError('Failed to fetch networks')
      console.error('Error fetching networks:', err)
    } finally {
      setLoading(false)
    }
  }

  const createNetwork = async (data: CreateNetworkRequest): Promise<Network | null> => {
    try {
      const response = await fetch('/api/ecosystem/networks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result: ApiResponse<Network> = await response.json()

      if (result.success && result.data) {
        await fetchNetworks() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to create network')
        return null
      }
    } catch (err) {
      setError('Failed to create network')
      console.error('Error creating network:', err)
      return null
    }
  }

  const updateNetwork = async (id: string, data: UpdateNetworkRequest): Promise<Network | null> => {
    try {
      const response = await fetch(`/api/ecosystem/networks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result: ApiResponse<Network> = await response.json()

      if (result.success && result.data) {
        await fetchNetworks() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to update network')
        return null
      }
    } catch (err) {
      setError('Failed to update network')
      console.error('Error updating network:', err)
      return null
    }
  }

  const joinNetwork = async (id: string): Promise<Network | null> => {
    try {
      const response = await fetch(`/api/ecosystem/networks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' })
      })
      const result: ApiResponse<Network> = await response.json()

      if (result.success && result.data) {
        await fetchNetworks() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to join network')
        return null
      }
    } catch (err) {
      setError('Failed to join network')
      console.error('Error joining network:', err)
      return null
    }
  }

  useEffect(() => {
    fetchNetworks()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    networks,
    loading,
    error,
    pagination,
    fetchNetworks,
    createNetwork,
    updateNetwork,
    joinNetwork,
    refetch: () => fetchNetworks()
  }
}

// Ecosystem Stats Hook
export function useEcosystemStats() {
  const [stats, setStats] = useState<EcosystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ecosystem/stats')
      const result: ApiResponse<EcosystemStats> = await response.json()

      if (result.success && result.data) {
        setStats(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch stats')
      }
    } catch (err) {
      setError('Failed to fetch stats')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/ecosystem/stats', {
        method: 'POST'
      })
      const result: ApiResponse<EcosystemStats> = await response.json()

      if (result.success && result.data) {
        setStats(result.data)
        setError(null)
        return true
      } else {
        setError(result.error || 'Failed to refresh stats')
        return false
      }
    } catch (err) {
      setError('Failed to refresh stats')
      console.error('Error refreshing stats:', err)
      return false
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
    refetch: fetchStats
  }
}

// Connections Hook
export function useConnections(filters?: ConnectionFilters) {
  const [connections, setConnections] = useState<PartnerConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchConnections = async (newFilters?: ConnectionFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      const currentFilters = { ...filters, ...newFilters }
      
      Object.entries(currentFilters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/ecosystem/connections?${params}`)
      const result: PaginatedResponse<PartnerConnection> = await response.json()

      if (result.success && result.data) {
        setConnections(result.data.connections || [])
        setPagination(result.data.pagination)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch connections')
      }
    } catch (err) {
      setError('Failed to fetch connections')
      console.error('Error fetching connections:', err)
    } finally {
      setLoading(false)
    }
  }

  const createConnection = async (data: CreateConnectionRequest): Promise<PartnerConnection | null> => {
    try {
      const response = await fetch('/api/ecosystem/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result: ApiResponse<PartnerConnection> = await response.json()

      if (result.success && result.data) {
        await fetchConnections() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to create connection')
        return null
      }
    } catch (err) {
      setError('Failed to create connection')
      console.error('Error creating connection:', err)
      return null
    }
  }

  const updateConnection = async (id: string, data: UpdateConnectionRequest): Promise<PartnerConnection | null> => {
    try {
      const response = await fetch(`/api/ecosystem/connections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result: ApiResponse<PartnerConnection> = await response.json()

      if (result.success && result.data) {
        await fetchConnections() // Refresh list
        return result.data
      } else {
        setError(result.error || 'Failed to update connection')
        return null
      }
    } catch (err) {
      setError('Failed to update connection')
      console.error('Error updating connection:', err)
      return null
    }
  }

  useEffect(() => {
    fetchConnections()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connections,
    loading,
    error,
    pagination,
    fetchConnections,
    createConnection,
    updateConnection,
    refetch: () => fetchConnections()
  }
}