'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Layers,
  Shield,
  Activity,
  Plus,
  TrendingUp,
} from 'lucide-react'

interface StatCard {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
}

const stats: StatCard[] = [
  {
    title: 'Total Credentials',
    value: '1,234',
    description: 'Issued this month',
    icon: CreditCard,
    trend: '+12%',
  },
  {
    title: 'Active Schemas',
    value: '23',
    description: 'Currently in use',
    icon: Layers,
    trend: '+2',
  },
  {
    title: 'Verifications',
    value: '856',
    description: 'This month',
    icon: Shield,
    trend: '+8%',
  },
  {
    title: 'API Calls',
    value: '12.5K',
    description: 'Last 30 days',
    icon: Activity,
    trend: '+15%',
  },
]

const recentActivities = [
  {
    id: 1,
    type: 'Credential Issued',
    description: 'AgeCredential issued to user@example.com',
    timestamp: '2 minutes ago',
    status: 'success',
  },
  {
    id: 2,
    type: 'Schema Created',
    description: 'New EducationCredential schema created',
    timestamp: '1 hour ago',
    status: 'info',
  },
  {
    id: 3,
    type: 'Verification Request',
    description: 'Identity verification completed',
    timestamp: '3 hours ago',
    status: 'success',
  },
  {
    id: 4,
    type: 'API Key Generated',
    description: 'New API key created for production',
    timestamp: '1 day ago',
    status: 'warning',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Dashboard
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Welcome back! Here's what's happening with your credentials.
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-didmgmt-text-secondary">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-didmgmt-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-didmgmt-text-primary">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-didmgmt-text-secondary">
                      {stat.description}
                    </p>
                    {stat.trend && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          activity.status === 'success'
                            ? 'bg-green-500'
                            : activity.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-didmgmt-text-primary">
                        {activity.type}
                      </p>
                      <p className="text-sm text-didmgmt-text-secondary">
                        {activity.description}
                      </p>
                      <p className="text-xs text-didmgmt-text-secondary">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Issue New Credential
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Layers className="mr-2 h-4 w-4" />
                  Create Schema
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Credential
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
