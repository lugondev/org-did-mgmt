'use client'

import { Building, Plus, Users, Settings, Shield } from 'lucide-react'
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

const organizationData = {
  name: "Gulon's Team",
  type: 'Enterprise',
  status: 'Active',
  members: 12,
  credentialsIssued: 1234,
  verificationRequests: 856,
  description: 'Digital identity and credential management organization',
}

const teamMembers = [
  {
    id: '1',
    name: 'Gulon',
    email: 'Gulon@example.com',
    role: 'Admin',
    avatar: '/placeholder-avatar.jpg',
    status: 'active',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    avatar: '/placeholder-avatar.jpg',
    status: 'active',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Analyst',
    avatar: '/placeholder-avatar.jpg',
    status: 'pending',
  },
]

export default function OrganizationPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Organization Profiles
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Manage your organization settings and team members
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
            <Settings className="mr-2 h-4 w-4" />
            Organization Settings
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Organization Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-didmgmt-blue">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{organizationData.name}</CardTitle>
                      <CardDescription>
                        {organizationData.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success">{organizationData.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-didmgmt-text-primary">
                      {organizationData.members}
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Team Members
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-didmgmt-text-primary">
                      {organizationData.credentialsIssued.toLocaleString()}
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Credentials Issued
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-didmgmt-text-primary">
                      {organizationData.verificationRequests}
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Verifications
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage your organization's team members and their roles
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-didmgmt-blue text-white">
                            {member.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-didmgmt-text-primary">
                            {member.name}
                          </div>
                          <div className="text-sm text-didmgmt-text-secondary">
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            member.status === 'active' ? 'success' : 'warning'
                          }
                        >
                          {member.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common organization management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Organization Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="mr-2 h-4 w-4" />
                    Billing & Plans
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organization Type */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-didmgmt-text-secondary">
                      Plan Type:
                    </span>
                    <Badge className="bg-didmgmt-blue">
                      {organizationData.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-didmgmt-text-secondary">
                      Status:
                    </span>
                    <Badge variant="success">{organizationData.status}</Badge>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
