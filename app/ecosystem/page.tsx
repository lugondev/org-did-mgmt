'use client'

import { useState, useEffect } from 'react'
import {
  Network,
  Plus,
  Users,
  Building,
  Globe,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePartners, useNetworks, useEcosystemStats, useConnections } from '@/hooks/use-ecosystem'
import { 
  Partner, 
  Network as NetworkType, 
  PartnerConnection, 
  PartnerType, 
  PartnerStatus, 
  NetworkType as NetworkTypeEnum,
  ConnectionStatus 
} from '@/types/ecosystem'
// Helper functions for status display
const getStatusIcon = (status: PartnerStatus | ConnectionStatus) => {
  switch (status) {
    case 'approved':
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'rejected':
    case 'disconnected':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: PartnerStatus | ConnectionStatus) => {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'disconnected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function EcosystemPage() {
  // API hooks
  const { 
    partners, 
    loading: partnersLoading, 
    error: partnersError, 
    createPartner, 
    updatePartner, 
    deletePartner 
  } = usePartners()
  
  const { 
    networks, 
    loading: networksLoading, 
    error: networksError, 
    createNetwork, 
    updateNetwork, 
    joinNetwork 
  } = useNetworks()
  
  const { 
    stats, 
    loading: statsLoading, 
    error: statsError, 
    refreshStats 
  } = useEcosystemStats()
  
  const { 
    connections, 
    loading: connectionsLoading, 
    error: connectionsError, 
    createConnection, 
    updateConnection 
  } = useConnections()

  // UI state
  const [connectPartnerDialogOpen, setConnectPartnerDialogOpen] = useState(false)
  const [joinNetworkDialogOpen, setJoinNetworkDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null)
  const [partnerDetailsDialogOpen, setPartnerDetailsDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  
  // Form state for connecting partner
  const [partnerData, setPartnerData] = useState<{
    name: string
    type: PartnerType
    email: string
    description: string
    website: string
  }>({
    name: '',
    type: 'Enterprise',
    email: '',
    description: '',
    website: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Handle connect partner
  const handleConnectPartner = () => {
    setConnectPartnerDialogOpen(true)
  }

  // Handle join network
  const handleJoinNetwork = (network: NetworkType) => {
    setSelectedNetwork(network)
    setJoinNetworkDialogOpen(true)
  }

  // Handle filter partners
  const handleFilterPartners = () => {
    setFilterDialogOpen(true)
  }

  // Handle submit partner connection
  const handleSubmitPartnerConnection = async () => {
    setIsLoading(true)
    try {
      await createPartner(partnerData)
      
      // Show success message
      toast.success(`Partner connection request sent to ${partnerData.name} successfully!`)
      
      // Reset form and close dialog
      setConnectPartnerDialogOpen(false)
      setPartnerData({
        name: '',
        type: 'Enterprise',
        email: '',
        description: '',
        website: ''
      })
    } catch (error) {
      console.error('Error connecting partner:', error)
      toast.error('Failed to send partner connection request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle join network submission
  const handleSubmitJoinNetwork = async () => {
    if (!selectedNetwork) return
    
    try {
      await joinNetwork(selectedNetwork.id)
      
      // Show success message
      toast.success(`Successfully joined ${selectedNetwork.name} network!`)
      
      // Close dialog and reset state
      setJoinNetworkDialogOpen(false)
      setSelectedNetwork(null)
      
      // Refresh networks data to update UI
      // Note: The joinNetwork function should already refresh the data
    } catch (error) {
      console.error('Error joining network:', error)
      toast.error(`Failed to join ${selectedNetwork.name} network. Please try again.`)
    }
  }

  // Filter partners based on search and filters
  const filteredPartners = partners?.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
    const matchesType = typeFilter === 'all' || partner.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) || []

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setFilterDialogOpen(false)
  }

  // Handle view details
  const handleViewDetails = (partnerId: string) => {
    // Find the partner and show detailed information in modal
    const partner = partners?.find(p => p.id === partnerId)
    if (partner) {
      setSelectedPartner(partner)
      setPartnerDetailsDialogOpen(true)
    }
  }

  // Handle connect to partner
  const handleConnect = async (partnerId: string) => {
    try {
      const partner = partners?.find(p => p.id === partnerId)
      const partnerName = partner?.name || 'partner'
      
      await createConnection({ partnerId, notes: 'Connection request from ecosystem page' })
      
      // Show success message
      toast.success(`Connection request sent to ${partnerName} successfully!`)
      
      // Note: The createConnection function should already refresh the data
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('Failed to send connection request. Please try again.')
    }
  }

  // Handle filter networks
  const handleFilterNetworks = () => {
    setFilterDialogOpen(true)
  }

  // Handle learn more
  const handleLearnMore = (networkId: string) => {
    // Find the network and show detailed information
    const network = networks?.find(n => n.id === networkId)
    if (network) {
      toast.info(`Network Details`, {
        description: `Name: ${network.name}\nType: ${network.type}\nMembers: ${network.members}\nStatus: ${network.isJoined ? 'Joined' : 'Not Joined'}`,
        duration: 5000
      })
    }
  }

  // Loading state
  if (partnersLoading || networksLoading || statsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading ecosystem data...</span>
      </div>
    )
  }

  // Error state
  if (partnersError || networksError || statsError) {
    return (
      <div className="flex h-full items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2">Error loading ecosystem data</span>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Ecosystem
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Connect with partners and join credential networks
            </p>
          </div>
          <Button 
            className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            onClick={handleConnectPartner}
          >
            <Plus className="mr-2 h-4 w-4" />
            Connect Partner
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-didmgmt-blue" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Total Partners
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {stats?.totalPartners || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-green-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Active Connections
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {stats?.activeConnections || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Credential Exchanges
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {stats?.credentialExchanges?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Networks Joined
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {stats?.networkCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList>
            <TabsTrigger value="partners">Connected Partners</TabsTrigger>
            <TabsTrigger value="networks">Available Networks</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search partners..." 
                    className="max-w-sm pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleFilterPartners}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Partners List */}
            {filteredPartners.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Partners Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'No partners match your current filters.' 
                      : 'Connect with your first partner to start building your ecosystem.'}
                  </p>
                  {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPartners.map(partner => (
                <Card
                  key={partner.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={partner.logo} alt={partner.name} />
                          <AvatarFallback className="bg-didmgmt-blue text-white">
                            {partner.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {partner.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {partner.type}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(partner.status)}
                        <Badge
                          className={`text-xs ${getStatusColor(partner.status)}`}
                        >
                          {partner.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-didmgmt-text-secondary mb-4">
                      {partner.description}
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-didmgmt-text-secondary">
                          Credentials Exchanged:
                        </span>
                        <span className="font-medium">
                          {partner.credentialsExchanged}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-didmgmt-text-secondary">
                          Last Activity:
                        </span>
                        <span className="font-medium">
                          {partner.lastActivity ? new Date(partner.lastActivity).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDetails(partner.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnect(partner.id)}
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="networks" className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input placeholder="Search networks..." className="max-w-sm" />
              </div>
              <Button variant="outline" onClick={handleFilterNetworks}>Filter by Type</Button>
            </div>

            {/* Available Networks */}
            {networks && networks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Network className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Networks Available</h3>
                  <p className="text-muted-foreground text-center">
                    No networks are currently available to join.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {networks?.map(network => (
                  <Card
                    key={network.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue">
                            <Globe className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {network.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {network.members} members
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {network.isJoined && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <Badge
                            className={`text-xs ${
                              network.type === 'Public' ? 'bg-blue-100 text-blue-800' : 
                              network.type === 'Private' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {network.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-didmgmt-text-secondary mb-4">
                        {network.description}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleLearnMore(network.id)}
                        >
                          Learn More
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleJoinNetwork(network)}
                          disabled={network.isJoined}
                        >
                          {network.isJoined ? 'Joined' : 'Join Network'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Partner Dialog */}
      <Dialog open={connectPartnerDialogOpen} onOpenChange={setConnectPartnerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect New Partner</DialogTitle>
            <DialogDescription>
              Send a connection request to a new partner organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="partner-name">Organization Name</Label>
              <Input
                id="partner-name"
                placeholder="Enter organization name"
                value={partnerData.name}
                onChange={(e) => setPartnerData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="partner-type">Organization Type</Label>
              <Select
                value={partnerData.type}
                onValueChange={(value: PartnerType) => setPartnerData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Nonprofit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="partner-email">Contact Email</Label>
              <Input
                id="partner-email"
                type="email"
                placeholder="contact@organization.com"
                value={partnerData.email}
                onChange={(e) => setPartnerData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="partner-website">Website (Optional)</Label>
              <Input
                id="partner-website"
                placeholder="https://organization.com"
                value={partnerData.website}
                onChange={(e) => setPartnerData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="partner-description">Description</Label>
              <Textarea
                id="partner-description"
                placeholder="Brief description of the partnership purpose"
                value={partnerData.description}
                onChange={(e) => setPartnerData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectPartnerDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPartnerConnection}
              disabled={isLoading || !partnerData.name || !partnerData.type || !partnerData.email}
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Partners</DialogTitle>
            <DialogDescription>
              Filter partners by status and organization type
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disconnected">Disconnected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type-filter">Organization Type</Label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Nonprofit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
            <Button
              onClick={() => setFilterDialogOpen(false)}
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Details Dialog */}
      <Dialog open={partnerDetailsDialogOpen} onOpenChange={setPartnerDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedPartner?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-6">
              {/* Partner Header */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedPartner.logo} alt={selectedPartner.name} />
                  <AvatarFallback className="text-lg">
                    {selectedPartner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{selectedPartner.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(selectedPartner.status)} text-white`}
                    >
                      {getStatusIcon(selectedPartner.status)}
                      {selectedPartner.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{selectedPartner.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                     <span>Type: {selectedPartner.type}</span>
                     <span>•</span>
                     <span>Member since: {new Date(selectedPartner.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2">{selectedPartner.email}</span>
                    </div>
                    {selectedPartner.website && (
                       <div>
                         <span className="font-medium text-gray-600">Website:</span>
                         <a 
                           href={selectedPartner.website} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="ml-2 text-blue-600 hover:underline"
                         >
                           {selectedPartner.website}
                         </a>
                       </div>
                     )}
                  </div>
                </div>

                {/* Activity Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Credentials Exchanged:</span>
                      <span className="ml-2 font-semibold text-green-600">{selectedPartner.credentialsExchanged}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Activity:</span>
                      <span className="ml-2">
                        {selectedPartner.lastActivity 
                          ? new Date(selectedPartner.lastActivity).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div>
                       <span className="font-medium text-gray-600">Created:</span>
                       <span className="ml-2">
                         {new Date(selectedPartner.createdAt).toLocaleDateString()}
                       </span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
               <div className="space-y-3">
                 <h4 className="font-semibold text-gray-900">Additional Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-medium text-gray-600">Partner ID:</span>
                     <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">{selectedPartner.id}</span>
                   </div>
                   <div>
                     <span className="font-medium text-gray-600">Last Updated:</span>
                     <span className="ml-2">{new Date(selectedPartner.updatedAt).toLocaleDateString()}</span>
                   </div>
                 </div>
               </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPartnerDetailsDialogOpen(false)}
            >
              Close
            </Button>
            {selectedPartner && selectedPartner.status !== 'connected' && (
              <Button
                onClick={() => {
                  setPartnerDetailsDialogOpen(false)
                  handleConnect(selectedPartner.id)
                }}
                className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
              >
                Connect
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Network Dialog */}
      <Dialog open={joinNetworkDialogOpen} onOpenChange={setJoinNetworkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join Network</DialogTitle>
            <DialogDescription>
              {selectedNetwork ? `Join the ${selectedNetwork.name} network` : 'Join network'}
            </DialogDescription>
          </DialogHeader>

          {selectedNetwork && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedNetwork.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedNetwork.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{selectedNetwork.type}</Badge>
                  <span className="text-sm text-gray-500">{selectedNetwork.members} members</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                By joining this network, you'll be able to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Connect with other network members</li>
                  <li>Share and verify credentials</li>
                  <li>Participate in network governance</li>
                  <li>Access network-specific features</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJoinNetworkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitJoinNetwork}
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            >
              Join Network
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
