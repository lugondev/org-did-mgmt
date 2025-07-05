'use client'

import { Shield, Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
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

const verificationRequests = [
  {
    id: '1',
    credentialType: 'Age Credential',
    requester: 'john.doe@example.com',
    status: 'pending',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    credentialType: 'Education Credential',
    requester: 'jane.smith@example.com',
    status: 'verified',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    credentialType: 'Identity Credential',
    requester: 'bob.wilson@example.com',
    status: 'failed',
    timestamp: '3 hours ago',
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'pending':
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'verified':
      return <Badge variant="success">Verified</Badge>
    case 'failed':
      return <Badge variant="error">Failed</Badge>
    case 'pending':
    default:
      return <Badge variant="warning">Pending</Badge>
  }
}

export default function VerificationPage() {
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
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Verification Policy
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Verification Requests</TabsTrigger>
            <TabsTrigger value="policies">Verification Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="space-y-4">
              {verificationRequests.map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <CardTitle className="text-lg">
                            {request.credentialType}
                          </CardTitle>
                          <CardDescription>
                            Requested by {request.requester}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <span className="text-sm text-didmgmt-text-secondary">
                          {request.timestamp}
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
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
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
                <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Policy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
