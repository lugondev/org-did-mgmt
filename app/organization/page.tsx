'use client'

import { useState, useEffect } from 'react'
import { Building, Plus, Users, Settings, Shield, Save, Upload, Trash2, Activity, AlertCircle, CheckCircle, Clock, X, MoreHorizontal, Edit, Eye, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { InviteMemberDialog } from '@/components/organization/invite-member-dialog'
import { OrganizationDIDManagement } from '@/components/organization/organization-did-management'

// Mock data removed - now using real data from API

// Types
interface Organization {
  id: string;
  name: string;
  description?: string;
  type: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  settings?: any;
  did?: string;
  createdAt: string;
  updatedAt: string;
  members: OrganizationMember[];
  _count: {
    members: number;
    apiKeys: number;
    activityLogs: number;
  };
}

interface OrganizationMember {
  id: string;
  role: string;
  permissions: string[];
  status: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface OrganizationInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviter: {
    name: string;
    email: string;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  status: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrganizationPage() {
  // State management
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Security settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [ssoEnabled, setSsoEnabled] = useState(false)
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true)
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false)
  const [ipWhitelist, setIpWhitelist] = useState('')
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackNotifications, setSlackNotifications] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  
  // Remove unused invite member state since we now use InviteMemberDialog component
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    ssoEnabled: false,
    auditLogs: true,
    ipWhitelistEnabled: false,
    ipWhitelist: '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackIntegration: false,
    webhookUrl: '',
  });

  // Fetch organization data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setLoading(true);
        
        // Fetch organization data from API
        const orgResponse = await fetch('/api/organizations/1', {
          headers: {
            'x-user-id': 'temp-user-id', // TODO: Get from auth
          },
        });
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setOrganization(orgData);
          setMembers(orgData.members || []);
        } else {
          // Fallback to mock data if API fails
          setOrganization({
            id: '1',
            name: "Gulon's Team",
            description: 'Digital identity and credential management organization',
            type: 'Enterprise',
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: [],
            _count: {
              members: 0,
              apiKeys: 5,
              activityLogs: 150,
            },
          });
        }
        
      } catch (err) {
        setError('Failed to fetch organization data');
        console.error('Error fetching organization:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, []);
  
  // API functions
  const updateOrganization = async (data: Partial<Organization>) => {
    try {
      const response = await fetch(`/api/organizations?id=${organization?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'temp-user-id', // TODO: Get from auth
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      const result = await response.json();
      setOrganization(result.organization);
      return result;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  const inviteMember = async (inviteData: { email: string; role: string; message?: string }) => {
    try {
      const response = await fetch(`/api/organizations/${organization?.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'temp-user-id', // TODO: Get from auth
        },
        body: JSON.stringify(inviteData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      const result = await response.json();
      // Refresh invitations list
      fetchInvitations();
      return result;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/organizations/${organization?.id}/invitations`, {
        headers: {
          'x-user-id': 'temp-user-id', // TODO: Get from auth
        },
      });

      if (response.ok) {
        const result = await response.json();
        setInvitations(result.invitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(`/api/organizations/${organization?.id}/activity?limit=10`, {
        headers: {
          'x-user-id': 'temp-user-id', // TODO: Get from auth
        },
      });

      if (response.ok) {
        const result = await response.json();
        setActivityLogs(result.activityLogs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  // Event handlers
  const handleSaveSettings = async () => {
    if (!organization) return;
    
    setLoading(true)
    try {
      await updateOrganization({
        name: organization.name,
        description: organization.description,
        type: organization.type,
        logo: organization.logo,
      });
      toast.success('Organization settings saved successfully!')
      setSettingsOpen(false)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle manage team
  const handleManageTeam = () => {
    // Navigate to team management section
    const teamSection = document.getElementById('team-section')
    if (teamSection) {
      teamSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Handle security settings
  const handleSecuritySettings = () => {
    // Navigate to security settings section
    const securitySection = document.getElementById('security-section')
    if (securitySection) {
      securitySection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Handle upgrade plan
  const handleUpgradePlan = () => {
    // Navigate to billing section
    const billingSection = document.getElementById('billing-section')
    if (billingSection) {
      billingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Handle billing and plans
  const handleBillingPlans = () => {
    // Navigate to billing section
    const billingSection = document.getElementById('billing-section')
    if (billingSection) {
      billingSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const logoData = e.target?.result as string;
        try {
          await updateOrganization({ logo: logoData });
          setOrganization(prev => prev ? { ...prev, logo: logoData } : null);
          toast.success('Logo uploaded successfully!');
        } catch (error) {
          toast.error('Failed to upload logo');
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Fetch additional data when organization is loaded
  useEffect(() => {
    if (organization?.id) {
      fetchInvitations();
      fetchActivityLogs();
    }
  }, [organization?.id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Organization not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
          
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Organization Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organization._count.members}</div>
                  <p className="text-xs text-muted-foreground">+{members.filter(m => m.status === 'active').length} active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credentials Issued</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organization?._count?.activityLogs || 0}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verification Requests</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activityLogs.filter(log => log.action === 'verify_credential').length}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organization._count.apiKeys}</div>
                  <p className="text-xs text-muted-foreground">Manage access keys</p>
                </CardContent>
              </Card>
            </div>

            {/* Organization Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-didmgmt-blue">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{organization.name}</CardTitle>
                      <CardDescription>
                        {organization.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success">{organization.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-didmgmt-text-primary">
                      {organization._count.members}
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Team Members
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-didmgmt-text-primary">
                      {activityLogs.filter(log => log.action === 'issue_credential').length.toLocaleString()}
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Credentials Issued
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-didmgmt-text-primary">
                      {activityLogs.filter(log => log.action === 'verify_credential').length}
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
                    <CardTitle>Team Members ({members.length})</CardTitle>
                    <CardDescription>
                      Manage your organization's team members and their roles
                    </CardDescription>
                  </div>
                  <InviteMemberDialog 
                    organizationId={organization?.id || ''} 
                    onInviteSent={() => {
                      fetchInvitations()
                      fetchActivityLogs()
                    }} 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members yet</p>
                      <p className="text-sm">Invite your first team member to get started</p>
                    </div>
                  ) : (
                    members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-didmgmt-blue text-white">
                              {member.user.name
                                ? member.user.name.split(' ').map(n => n[0]).join('')
                                : member.user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-didmgmt-text-primary">
                              {member.user.name || member.user.email}
                            </div>
                            <div className="text-sm text-didmgmt-text-secondary">
                              {member.user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              member.status === 'active' ? 'success' : 
                              member.status === 'suspended' ? 'destructive' : 'warning'
                            }
                          >
                            {member.status === 'active' ? 'Active' : 
                             member.status === 'suspended' ? 'Suspended' : 'Pending'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">{member.role}</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={member.role === 'owner'}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Pending Invitations */}
                {invitations.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-4">Pending Invitations ({invitations.length})</h4>
                    <div className="space-y-3">
                      {invitations.map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gray-100">
                                {invitation.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{invitation.email}</div>
                              <div className="text-sm text-muted-foreground">
                                Invited by {invitation.inviter.name || invitation.inviter.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">{invitation.role}</Badge>
                            <Badge variant={invitation.status === 'pending' ? 'secondary' : 'destructive'}>
                              {invitation.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Track important events and changes in your organization
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                      <p className="text-sm">Activity will appear here as your team uses the platform</p>
                    </div>
                  ) : (
                    activityLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            log.action.includes('created') ? 'bg-green-500' :
                            log.action.includes('updated') ? 'bg-blue-500' :
                            log.action.includes('deleted') ? 'bg-red-500' :
                            'bg-gray-500'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium">{log.user?.name || log.user?.email || 'System'}</span> {log.action}
                            {log.resource && (
                              <span className="text-muted-foreground"> on {log.resource}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {log.details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant={log.status === 'success' ? 'default' : log.status === 'error' ? 'destructive' : 'secondary'}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
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
                  <Button variant="outline" className="w-full justify-start" onClick={handleManageTeam}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleSecuritySettings}>
                    <Shield className="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Organization Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Organization Settings</DialogTitle>
                        <DialogDescription>
                          Manage your organization's configuration, security, and preferences.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="general">General</TabsTrigger>
                          <TabsTrigger value="did">DID Config</TabsTrigger>
                          <TabsTrigger value="security">Security</TabsTrigger>
                          <TabsTrigger value="notifications">Notifications</TabsTrigger>
                          <TabsTrigger value="billing">Billing</TabsTrigger>
                        </TabsList>
                        
                        {/* General Settings Tab */}
                        <TabsContent value="general" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Organization Information</CardTitle>
                              <CardDescription>
                                Basic information about your organization
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Organization Name</label>
                                  <Input
                                    value={organization?.name || ''}
                                    onChange={(e) => setOrganization(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    placeholder="Enter organization name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Organization Type</label>
                                  <Select value={organization?.type || ''} onValueChange={(value) => setOrganization(prev => prev ? { ...prev, type: value } : null)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                                      <SelectItem value="Business">Business</SelectItem>
                                      <SelectItem value="Startup">Startup</SelectItem>
                                      <SelectItem value="Non-profit">Non-profit</SelectItem>
                                      <SelectItem value="Educational">Educational</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                  value={organization?.description || ''}
                                  onChange={(e) => setOrganization(prev => prev ? { ...prev, description: e.target.value } : null)}
                                  placeholder="Describe your organization"
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Organization Logo</label>
                                <div className="flex items-center gap-4">
                                  {organization?.logo && (
                                    <img src={organization.logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                                  )}
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                      <label className="cursor-pointer">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleLogoUpload}
                                          className="hidden"
                                        />
                                      </label>
                                    </Button>
                                    {organization?.logo && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOrganization(prev => prev ? { ...prev, logo: undefined } : null)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        {/* DID Configuration Tab */}
                        <TabsContent value="did" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>DID Configuration</CardTitle>
                              <CardDescription>
                                Manage Decentralized Identifiers for your organization
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <OrganizationDIDManagement 
                                 organizationId={organization?.id || ''} 
                                 className="" 
                               />
                             </CardContent>
                          </Card>
                        </TabsContent>
                        
                        {/* Security Settings Tab */}
                        <TabsContent value="security" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Security Settings</CardTitle>
                              <CardDescription>
                                Configure security features for your organization
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Two-Factor Authentication</label>
                                  <p className="text-sm text-muted-foreground">
                                    Require 2FA for all organization members
                                  </p>
                                </div>
                                <Switch
                                  checked={twoFactorEnabled}
                                  onCheckedChange={setTwoFactorEnabled}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Single Sign-On (SSO)</label>
                                  <p className="text-sm text-muted-foreground">
                                    Enable SSO integration for your organization
                                  </p>
                                </div>
                                <Switch
                                  checked={ssoEnabled}
                                  onCheckedChange={setSsoEnabled}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Audit Logs</label>
                                  <p className="text-sm text-muted-foreground">
                                    Track all organization activities
                                  </p>
                                </div>
                                <Switch
                                  checked={auditLogsEnabled}
                                  onCheckedChange={setAuditLogsEnabled}
                                />
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <label className="text-sm font-medium">IP Whitelist</label>
                                    <p className="text-sm text-muted-foreground">
                                      Restrict access to specific IP addresses
                                    </p>
                                  </div>
                                  <Switch
                                    checked={ipWhitelistEnabled}
                                    onCheckedChange={setIpWhitelistEnabled}
                                  />
                                </div>
                                {ipWhitelistEnabled && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Allowed IP Addresses</label>
                                    <Textarea
                                      value={ipWhitelist}
                                      onChange={(e) => setIpWhitelist(e.target.value)}
                                      placeholder="Enter IP addresses (one per line)\ne.g. 192.168.1.1\n10.0.0.0/8"
                                      rows={4}
                                    />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        {/* Notifications Settings Tab */}
                        <TabsContent value="notifications" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Notification Settings</CardTitle>
                              <CardDescription>
                                Configure how you receive notifications
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Email Notifications</label>
                                  <p className="text-sm text-muted-foreground">
                                    Receive notifications via email
                                  </p>
                                </div>
                                <Switch
                                  checked={emailNotifications}
                                  onCheckedChange={setEmailNotifications}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <label className="text-sm font-medium">Slack Notifications</label>
                                  <p className="text-sm text-muted-foreground">
                                    Send notifications to Slack channel
                                  </p>
                                </div>
                                <Switch
                                  checked={slackNotifications}
                                  onCheckedChange={setSlackNotifications}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Webhook URL</label>
                                <Input
                                  value={webhookUrl}
                                  onChange={(e) => setWebhookUrl(e.target.value)}
                                  placeholder="https://hooks.slack.com/services/..."
                                  type="url"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Optional: Webhook URL for custom integrations
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        {/* Billing Settings Tab */}
                        <TabsContent value="billing" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Billing & Subscription</CardTitle>
                              <CardDescription>
                                Manage your subscription and billing information
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Current Plan</label>
                                  <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h3 className="font-semibold">{organization?.type || 'Enterprise'}</h3>
                                        <p className="text-sm text-muted-foreground">$99/month</p>
                                      </div>
                                      <Badge variant="success">{organization?.status || 'Active'}</Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Usage This Month</label>
                                  <div className="p-4 border rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Credentials Issued</span>
                                      <span>{activityLogs.filter(log => log.action === 'issue_credential').length}/5000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>Team Members</span>
                                      <span>{organization?._count?.members || 0}/50</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span>API Calls</span>
                                      <span>12,456/100,000</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="outline">Change Plan</Button>
                                <Button variant="outline">View Invoices</Button>
                                <Button variant="outline">Update Payment Method</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSettings} disabled={loading}>
                          {loading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="w-full justify-start" onClick={handleBillingPlans}>
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
                      {organization?.type || 'Enterprise'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-didmgmt-text-secondary">
                      Status:
                    </span>
                    <Badge variant="success">{organization?.status || 'Active'}</Badge>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" onClick={handleUpgradePlan}>
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Note: Invite Member functionality is now handled by InviteMemberDialog component */}
    </div>
  )
}
