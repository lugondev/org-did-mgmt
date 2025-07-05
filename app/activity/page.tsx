'use client'

import {
  Activity,
  CreditCard,
  Shield,
  Users,
  FileText,
  Clock,
  Filter,
  Download,
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

const activityStats = {
  totalActivities: 1234,
  todayActivities: 45,
  credentialIssued: 234,
  verificationsCompleted: 156,
}

const recentActivities = [
  {
    id: '1',
    type: 'credential_issued',
    title: 'Credential Issued',
    description: 'Age Credential issued to John Doe',
    user: 'System',
    timestamp: '2 minutes ago',
    status: 'success',
    details: {
      credentialId: 'cred-12345',
      recipient: 'john.doe@example.com',
    },
  },
  {
    id: '2',
    type: 'verification_request',
    title: 'Verification Request',
    description: 'Age verification requested by TechCorp',
    user: 'Jane Smith',
    timestamp: '15 minutes ago',
    status: 'pending',
    details: {
      requestId: 'ver-67890',
      organization: 'TechCorp Solutions',
    },
  },
  {
    id: '3',
    type: 'schema_created',
    title: 'Schema Created',
    description: 'New Professional Certificate schema created',
    user: 'Admin',
    timestamp: '1 hour ago',
    status: 'success',
    details: {
      schemaId: 'schema-abc123',
      schemaName: 'Professional Certificate',
    },
  },
  {
    id: '4',
    type: 'user_login',
    title: 'User Login',
    description: 'User logged in from new device',
    user: 'Gulon',
    timestamp: '2 hours ago',
    status: 'info',
    details: {
      device: 'MacBook Pro',
      location: 'Ho Chi Minh City, Vietnam',
    },
  },
  {
    id: '5',
    type: 'credential_revoked',
    title: 'Credential Revoked',
    description: 'Age Credential revoked for security reasons',
    user: 'Security Team',
    timestamp: '3 hours ago',
    status: 'warning',
    details: {
      credentialId: 'cred-54321',
      reason: 'Security breach detected',
    },
  },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'credential_issued':
    case 'credential_revoked':
      return CreditCard
    case 'verification_request':
      return Shield
    case 'schema_created':
      return FileText
    case 'user_login':
      return Users
    default:
      return Activity
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
      return 'destructive'
    case 'pending':
      return 'secondary'
    default:
      return 'default'
  }
}

export default function ActivityPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Activity
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Monitor all system activities and user actions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-didmgmt-blue" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Total Activities
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {activityStats.totalActivities.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Today's Activities
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {activityStats.todayActivities}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Credentials Issued
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {activityStats.credentialIssued}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Verifications
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {activityStats.verificationsCompleted}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Activities</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <Input placeholder="Search activities..." className="w-64" />
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest system activities and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map(activity => {
                    const Icon = getActivityIcon(activity.type)
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue/10">
                          <Icon className="h-5 w-5 text-didmgmt-blue" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-didmgmt-text-primary">
                              {activity.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getStatusColor(activity.status) as any}
                              >
                                {activity.status}
                              </Badge>
                              <span className="text-xs text-didmgmt-text-secondary">
                                {activity.timestamp}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-didmgmt-text-secondary">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-didmgmt-text-secondary">
                            <span>By: {activity.user}</span>
                            {Object.entries(activity.details).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="px-2 py-1 bg-accent rounded"
                                >
                                  {key}: {value}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Credential Activities</CardTitle>
                <CardDescription>
                  Activities related to credential issuance and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities
                    .filter(activity => activity.type.includes('credential'))
                    .map(activity => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue/10">
                            <Icon className="h-5 w-5 text-didmgmt-blue" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <Badge
                                variant={getStatusColor(activity.status) as any}
                              >
                                {activity.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-didmgmt-text-secondary">
                              {activity.description}
                            </p>
                            <span className="text-xs text-didmgmt-text-secondary">
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Verification Activities</CardTitle>
                <CardDescription>
                  Activities related to credential verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities
                    .filter(activity => activity.type.includes('verification'))
                    .map(activity => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue/10">
                            <Icon className="h-5 w-5 text-didmgmt-blue" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <Badge
                                variant={getStatusColor(activity.status) as any}
                              >
                                {activity.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-didmgmt-text-secondary">
                              {activity.description}
                            </p>
                            <span className="text-xs text-didmgmt-text-secondary">
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Activities</CardTitle>
                <CardDescription>
                  System-level activities and administrative actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities
                    .filter(activity =>
                      ['schema_created', 'user_login'].includes(activity.type)
                    )
                    .map(activity => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue/10">
                            <Icon className="h-5 w-5 text-didmgmt-blue" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{activity.title}</h4>
                              <Badge
                                variant={getStatusColor(activity.status) as any}
                              >
                                {activity.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-didmgmt-text-secondary">
                              {activity.description}
                            </p>
                            <span className="text-xs text-didmgmt-text-secondary">
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
