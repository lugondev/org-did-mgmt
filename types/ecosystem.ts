// Ecosystem Types
export interface Partner {
  id: string
  name: string
  type: string
  email: string
  website?: string
  description?: string
  logo?: string
  status: 'pending' | 'connected' | 'disconnected'
  credentialsExchanged: number
  lastActivity?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  connections?: PartnerConnection[]
}

export interface Network {
  id: string
  name: string
  description?: string
  type: 'Public' | 'Private' | 'Consortium' | 'Government'
  members: number
  isJoined: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface PartnerConnection {
  id: string
  partnerId: string
  status: 'pending' | 'approved' | 'rejected'
  requestedBy?: string
  approvedBy?: string
  approvedAt?: Date | string
  rejectedBy?: string
  rejectedAt?: Date | string
  notes?: string
  createdAt: Date | string
  updatedAt: Date | string
  partner?: Partner
}

export interface EcosystemStats {
  id: string
  totalPartners: number
  activeConnections: number
  credentialExchanges: number
  verificationRequests: number
  updatedAt: Date | string
  // Enhanced stats (calculated)
  recentPartners?: number
  recentConnections?: number
  networkCount?: number
  growthRate?: number
  connectionRate?: number
  averageCredentialsPerPartner?: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    partners?: T[]
    networks?: T[]
    connections?: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// Form Types
export interface CreatePartnerRequest {
  name: string
  type: string
  email: string
  website?: string
  description?: string
}

export interface UpdatePartnerRequest {
  name?: string
  type?: string
  email?: string
  website?: string
  description?: string
  status?: 'pending' | 'connected' | 'disconnected'
  credentialsExchanged?: number
}

export interface CreateNetworkRequest {
  name: string
  description?: string
  type?: 'Public' | 'Private' | 'Consortium' | 'Government'
  members?: number
}

export interface UpdateNetworkRequest {
  name?: string
  description?: string
  type?: 'Public' | 'Private' | 'Consortium' | 'Government'
  members?: number
  isJoined?: boolean
  action?: 'join' | 'leave'
}

export interface CreateConnectionRequest {
  partnerId: string
  notes?: string
  requestedBy?: string
}

export interface UpdateConnectionRequest {
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  rejectedBy?: string
  notes?: string
}

// Filter Types
export interface PartnerFilters {
  status?: string
  type?: string
  search?: string
  page?: number
  limit?: number
}

export interface NetworkFilters {
  type?: string
  search?: string
  page?: number
  limit?: number
}

export interface ConnectionFilters {
  status?: string
  partnerId?: string
  page?: number
  limit?: number
}

// Constants
export const PARTNER_TYPES = [
  'Technology',
  'Education',
  'Healthcare',
  'Finance',
  'Government',
  'Non-Profit',
  'Enterprise'
] as const

export const PARTNER_STATUSES = [
  'pending',
  'connected',
  'disconnected'
] as const

export const NETWORK_TYPES = [
  'Public',
  'Private',
  'Consortium',
  'Government'
] as const

export const CONNECTION_STATUSES = [
  'pending',
  'approved',
  'rejected'
] as const

export type PartnerType = typeof PARTNER_TYPES[number]
export type PartnerStatus = typeof PARTNER_STATUSES[number]
export type NetworkType = typeof NETWORK_TYPES[number]
export type ConnectionStatus = typeof CONNECTION_STATUSES[number]