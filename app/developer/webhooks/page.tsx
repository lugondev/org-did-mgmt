'use client'

import {
  Webhook,
  Plus,
  Play,
  Trash2,
  Edit,
  Copy,
  AlertCircle,
  CheckCircle,
  XCircle,
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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const webhooks = [
  {
    id: '1',
    name: 'Credential Issued Webhook',
    url: 'https://api.example.com/webhooks/credential-issued',
    events: ['credential.issued', 'credential.updated'],
    status: 'active',
    lastDelivery: '2 minutes ago',
    successRate: 98.5,
    totalDeliveries: 1234,
  },
  {
    id: '2',
    name: 'Verification Webhook',
    url: 'https://api.example.com/webhooks/verification',
    events: ['verification.completed', 'verification.failed'],
    status: 'active',
    lastDelivery: '15 minutes ago',
    successRate: 99.2,
    totalDeliveries: 856,
  },
  {
    id: '3',
    name: 'Schema Events',
    url: 'https://api.example.com/webhooks/schema',
    events: ['schema.created', 'schema.updated'],
    status: 'inactive',
    lastDelivery: 'Never',
    successRate: 0,
    totalDeliveries: 0,
  },
]

const availableEvents = [
  {
    category: 'Credentials',
    events: [
      {
        name: 'credential.issued',
        description: 'Triggered when a credential is issued',
      },
      {
        name: 'credential.updated',
        description: 'Triggered when a credential is updated',
      },
      {
        name: 'credential.revoked',
        description: 'Triggered when a credential is revoked',
      },
    ],
  },
  {
    category: 'Verification',
    events: [
      {
        name: 'verification.requested',
        description: 'Triggered when verification is requested',
      },
      {
        name: 'verification.completed',
        description: 'Triggered when verification is completed',
      },
      {
        name: 'verification.failed',
        description: 'Triggered when verification fails',
      },
    ],
  },
  {
    category: 'Schemas',
    events: [
      {
        name: 'schema.created',
        description: 'Triggered when a schema is created',
      },
      {
        name: 'schema.updated',
        description: 'Triggered when a schema is updated',
      },
      {
        name: 'schema.deleted',
        description: 'Triggered when a schema is deleted',
      },
    ],
  },
]

const recentDeliveries = [
  {
    id: '1',
    webhook: 'Credential Issued Webhook',
    event: 'credential.issued',
    status: 'success',
    timestamp: '2 minutes ago',
    responseCode: 200,
    responseTime: '145ms',
  },
  {
    id: '2',
    webhook: 'Verification Webhook',
    event: 'verification.completed',
    status: 'success',
    timestamp: '15 minutes ago',
    responseCode: 200,
    responseTime: '89ms',
  },
  {
    id: '3',
    webhook: 'Credential Issued Webhook',
    event: 'credential.updated',
    status: 'failed',
    timestamp: '1 hour ago',
    responseCode: 500,
    responseTime: '2.3s',
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    default:
      return 'default'
  }
}

export default function WebhooksPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Webhooks
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Manage webhook endpoints for real-time notifications
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="events">Available Events</TabsTrigger>
            <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input placeholder="Search webhooks..." className="max-w-sm" />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            {/* Webhooks List */}
            <div className="space-y-4">
              {webhooks.map(webhook => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue">
                          <Webhook className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {webhook.name}
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {webhook.url}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(webhook.status) as any}>
                          {webhook.status}
                        </Badge>
                        <Switch checked={webhook.status === 'active'} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <div className="text-sm text-didmgmt-text-secondary mb-1">
                          Events
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map(event => (
                            <Badge
                              key={event}
                              variant="outline"
                              className="text-xs"
                            >
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-didmgmt-text-secondary mb-1">
                          Last Delivery
                        </div>
                        <div className="text-sm font-medium">
                          {webhook.lastDelivery}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-didmgmt-text-secondary mb-1">
                          Success Rate
                        </div>
                        <div className="text-sm font-medium">
                          {webhook.successRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-didmgmt-text-secondary mb-1">
                          Total Deliveries
                        </div>
                        <div className="text-sm font-medium">
                          {webhook.totalDeliveries.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="mr-2 h-4 w-4" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Webhook Events</CardTitle>
                <CardDescription>
                  Events that can trigger webhook notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availableEvents.map(category => (
                    <div key={category.category}>
                      <h3 className="font-medium text-didmgmt-text-primary mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-2">
                        {category.events.map(event => (
                          <div
                            key={event.name}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div>
                              <div className="font-mono text-sm font-medium">
                                {event.name}
                              </div>
                              <div className="text-sm text-didmgmt-text-secondary">
                                {event.description}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              View Payload
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Deliveries</CardTitle>
                    <CardDescription>
                      Latest webhook delivery attempts and their status
                    </CardDescription>
                  </div>
                  <Button variant="outline">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDeliveries.map(delivery => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(delivery.status)}
                        <div>
                          <div className="font-medium text-sm">
                            {delivery.webhook}
                          </div>
                          <div className="text-sm text-didmgmt-text-secondary">
                            Event:{' '}
                            <span className="font-mono">{delivery.event}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-didmgmt-text-secondary">
                            Response
                          </div>
                          <div className="font-medium">
                            {delivery.responseCode}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-didmgmt-text-secondary">
                            Time
                          </div>
                          <div className="font-medium">
                            {delivery.responseTime}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-didmgmt-text-secondary">
                            Delivered
                          </div>
                          <div className="font-medium">
                            {delivery.timestamp}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
