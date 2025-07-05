'use client'

import {
  Network,
  Plus,
  Users,
  Building,
  Globe,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
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

const ecosystemStats = {
  totalPartners: 24,
  activeConnections: 18,
  credentialExchanges: 1567,
  verificationRequests: 892,
}

const partners = [
  {
    id: '1',
    name: 'University of Technology',
    type: 'Educational Institution',
    status: 'connected',
    logo: '/placeholder-logo.jpg',
    description: 'Leading technology university issuing digital diplomas',
    credentialsExchanged: 234,
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'TechCorp Solutions',
    type: 'Enterprise',
    status: 'connected',
    logo: '/placeholder-logo.jpg',
    description: 'Technology company for professional certifications',
    credentialsExchanged: 156,
    lastActivity: '1 day ago',
  },
  {
    id: '3',
    name: 'Healthcare Alliance',
    type: 'Healthcare',
    status: 'pending',
    logo: '/placeholder-logo.jpg',
    description: 'Healthcare network for medical credentials',
    credentialsExchanged: 0,
    lastActivity: 'Never',
  },
]

const availableNetworks = [
  {
    id: '1',
    name: 'Global Education Network',
    description: 'International network for educational credentials',
    members: 156,
    type: 'Public',
  },
  {
    id: '2',
    name: 'Professional Certification Hub',
    description: 'Network for professional skill certifications',
    members: 89,
    type: 'Public',
  },
  {
    id: '3',
    name: 'Healthcare Credentials Network',
    description: 'Specialized network for healthcare professionals',
    members: 67,
    type: 'Private',
  },
]

export default function EcosystemPage() {
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
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
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
                {ecosystemStats.totalPartners}
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
                {ecosystemStats.activeConnections}
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
                {ecosystemStats.credentialExchanges.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Verifications
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {ecosystemStats.verificationRequests}
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
                <Input placeholder="Search partners..." className="max-w-sm" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            {/* Partners List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {partners.map(partner => (
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
                      <Badge
                        variant={
                          partner.status === 'connected' ? 'success' : 'warning'
                        }
                        className="text-xs"
                      >
                        {partner.status}
                      </Badge>
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
                          {partner.lastActivity}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="networks" className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input placeholder="Search networks..." className="max-w-sm" />
              </div>
              <Button variant="outline">Filter by Type</Button>
            </div>

            {/* Available Networks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableNetworks.map(network => (
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
                      <Badge
                        variant={
                          network.type === 'Public' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {network.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-didmgmt-text-secondary mb-4">
                      {network.description}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Learn More
                      </Button>
                      <Button size="sm" className="flex-1">
                        Join Network
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
