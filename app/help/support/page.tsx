'use client'

import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  FileText,
  Bug,
  Lightbulb,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const supportChannels = [
  {
    title: 'Email Support',
    description: 'Get help via email with detailed responses',
    icon: Mail,
    contact: 'support@didmgmt.com',
    responseTime: 'Within 24 hours',
    availability: '24/7',
    action: 'Send Email',
  },
  {
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: MessageSquare,
    contact: 'Available in app',
    responseTime: 'Immediate',
    availability: 'Mon-Fri, 9AM-6PM PST',
    action: 'Start Chat',
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with our technical experts',
    icon: Phone,
    contact: '+1 (555) 123-4567',
    responseTime: 'Immediate',
    availability: 'Mon-Fri, 9AM-6PM PST',
    action: 'Call Now',
  },
]

const supportCategories = [
  {
    value: 'technical',
    label: 'Technical Issue',
    icon: Bug,
    description: 'API errors, integration problems, bugs',
  },
  {
    value: 'account',
    label: 'Account & Billing',
    icon: FileText,
    description: 'Account settings, billing questions, subscriptions',
  },
  {
    value: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    description: 'Suggest new features or improvements',
  },
  {
    value: 'general',
    label: 'General Question',
    icon: HelpCircle,
    description: 'General inquiries and how-to questions',
  },
]

const recentTickets = [
  {
    id: 'TRV-2024-001',
    subject: 'API authentication error',
    category: 'Technical Issue',
    status: 'In Progress',
    priority: 'High',
    created: '2 hours ago',
    lastUpdate: '30 minutes ago',
  },
  {
    id: 'TRV-2024-002',
    subject: 'Billing question about enterprise plan',
    category: 'Account & Billing',
    status: 'Resolved',
    priority: 'Medium',
    created: '1 day ago',
    lastUpdate: '4 hours ago',
  },
  {
    id: 'TRV-2024-003',
    subject: 'Feature request: Bulk credential export',
    category: 'Feature Request',
    status: 'Under Review',
    priority: 'Low',
    created: '3 days ago',
    lastUpdate: '1 day ago',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Resolved':
      return 'bg-green-100 text-green-800'
    case 'In Progress':
      return 'bg-blue-100 text-blue-800'
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800'
    case 'Open':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800'
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'Low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function SupportPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Support Center
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Get help from our support team
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/help/docs">
                <FileText className="mr-2 h-4 w-4" />
                Documentation
              </Link>
            </Button>
            <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Live Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="channels">Support Channels</TabsTrigger>
          </TabsList>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Support Request</CardTitle>
                    <CardDescription>
                      Describe your issue and we'll get back to you as soon as
                      possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Category
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {supportCategories.map(category => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  <div className="flex items-center gap-2">
                                    <category.icon className="h-4 w-4" />
                                    {category.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Priority
                          </label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Subject
                        </label>
                        <Input placeholder="Brief description of your issue" />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Description
                        </label>
                        <Textarea
                          placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                          rows={6}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="your.email@company.com"
                        />
                      </div>

                      <Button className="w-full bg-didmgmt-blue hover:bg-didmgmt-blue/90">
                        <Send className="mr-2 h-4 w-4" />
                        Submit Request
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Support Info */}
              <div className="space-y-6">
                {/* Response Times */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Urgent</span>
                        <Badge className="bg-red-100 text-red-800">
                          2 hours
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          4 hours
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medium</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          12 hours
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low</span>
                        <Badge className="bg-green-100 text-green-800">
                          24 hours
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Support Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {supportCategories.map(category => {
                        const Icon = category.icon
                        return (
                          <div
                            key={category.value}
                            className="flex items-start gap-3"
                          >
                            <Icon className="h-4 w-4 text-didmgmt-blue mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">
                                {category.label}
                              </div>
                              <div className="text-xs text-didmgmt-text-secondary">
                                {category.description}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/help/docs">
                          <FileText className="mr-2 h-4 w-4" />
                          Browse Documentation
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Live Chat
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Schedule a Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>
                  Track the status of your support requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">
                              {ticket.subject}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {ticket.id}
                            </Badge>
                          </div>
                          <p className="text-sm text-didmgmt-text-secondary">
                            {ticket.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status}
                          </Badge>
                          <Badge
                            className={`text-xs ${getPriorityColor(ticket.priority)}`}
                          >
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-didmgmt-text-secondary">
                        <div className="flex items-center gap-4">
                          <span>Created {ticket.created}</span>
                          <span>Last update {ticket.lastUpdate}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {supportChannels.map(channel => {
                const Icon = channel.icon
                return (
                  <Card
                    key={channel.title}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {channel.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {channel.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-didmgmt-text-secondary" />
                            <span className="text-sm">
                              {channel.responseTime}
                            </span>
                          </div>
                          <div className="text-sm text-didmgmt-text-secondary">
                            Available: {channel.availability}
                          </div>
                          <div className="text-sm font-medium">
                            {channel.contact}
                          </div>
                        </div>
                        <Button className="w-full">{channel.action}</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
                <CardDescription>
                  Other ways to get help and stay informed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Self-Service</h4>
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/help/docs">
                          <FileText className="mr-2 h-4 w-4" />
                          Documentation
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        FAQ
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Video Tutorials
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Community</h4>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Community Forum
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Release Notes
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Bug className="mr-2 h-4 w-4" />
                        Report a Bug
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
