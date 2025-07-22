'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, Webhook, CheckCircle, AlertCircle, Settings, Trash2, Edit, Send, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  headers?: Record<string, string>
  retryCount: number
  timeout: number
  createdAt: string
  updatedAt: string
  lastTriggered?: string
  status: 'active' | 'inactive' | 'failed'
}

interface WebhookLog {
  id: string
  webhookId: string
  event: string
  url: string
  status: 'success' | 'failed' | 'pending'
  statusCode?: number
  response?: string
  error?: string
  timestamp: string
  retryCount: number
}

interface WebhookManagerProps {
  className?: string
}

const AVAILABLE_EVENTS = [
  'credential.issued',
  'credential.revoked',
  'credential.verified',
  'presentation.requested',
  'presentation.submitted',
  'schema.created',
  'schema.updated',
  'did.created',
  'did.updated'
]

export function WebhookManager({ className }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    isActive: true,
    secret: '',
    headers: {} as Record<string, string>,
    retryCount: 3,
    timeout: 30
  })

  useEffect(() => {
    fetchWebhooks()
    fetchWebhookLogs()
  }, [])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/webhooks')
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error)
      toast.error('Failed to fetch webhooks')
    } finally {
      setLoading(false)
    }
  }

  const fetchWebhookLogs = async () => {
    try {
      const response = await fetch('/api/webhooks/logs')
      if (response.ok) {
        const data = await response.json()
        setWebhookLogs(data)
      }
    } catch (error) {
      console.error('Error fetching webhook logs:', error)
    }
  }

  const createWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Webhook created successfully')
        setShowCreateDialog(false)
        resetForm()
        fetchWebhooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create webhook')
      }
    } catch (error) {
      console.error('Error creating webhook:', error)
      toast.error('Failed to create webhook')
    }
  }

  const updateWebhook = async () => {
    if (!editingWebhook) return

    try {
      const response = await fetch(`/api/webhooks/${editingWebhook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Webhook updated successfully')
        setEditingWebhook(null)
        resetForm()
        fetchWebhooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update webhook')
      }
    } catch (error) {
      console.error('Error updating webhook:', error)
      toast.error('Failed to update webhook')
    }
  }

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Webhook deleted successfully')
        fetchWebhooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete webhook')
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
      toast.error('Failed to delete webhook')
    }
  }

  const toggleWebhookStatus = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast.success(`Webhook ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchWebhooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update webhook status')
      }
    } catch (error) {
      console.error('Error toggling webhook status:', error)
      toast.error('Failed to update webhook status')
    }
  }

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Test webhook sent successfully')
        fetchWebhookLogs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send test webhook')
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      toast.error('Failed to test webhook')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      isActive: true,
      secret: '',
      headers: {},
      retryCount: 3,
      timeout: 30
    })
  }

  const startEdit = (webhook: WebhookEndpoint) => {
    setEditingWebhook(webhook)
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
      secret: webhook.secret || '',
      headers: webhook.headers || {},
      retryCount: webhook.retryCount,
      timeout: webhook.timeout
    })
    setShowCreateDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLogs = selectedWebhook 
    ? webhookLogs.filter(log => log.webhookId === selectedWebhook)
    : webhookLogs

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Webhook Management</h2>
          <p className="text-muted-foreground">
            Configure webhooks to receive real-time notifications about events
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) {
            setEditingWebhook(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}
              </DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter webhook name"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              {/* Events Selection */}
              <div>
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_EVENTS.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={formData.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              events: [...prev.events, event]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              events: prev.events.filter(e => e !== event)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={event} className="text-sm">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retryCount">Retry Count</Label>
                  <Input
                    id="retryCount"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.retryCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, retryCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1"
                    max="300"
                    value={formData.timeout}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secret">Secret (optional)</Label>
                <Input
                  id="secret"
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="Webhook signing secret"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false)
                  setEditingWebhook(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={editingWebhook ? updateWebhook : createWebhook}>
                  {editingWebhook ? 'Update Webhook' : 'Create Webhook'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Webhooks Configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create webhooks to receive real-time notifications about events.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Webhook className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">{webhook.name}</CardTitle>
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={(checked) => toggleWebhookStatus(webhook.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testWebhook(webhook.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(webhook)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Endpoint URL</p>
                        <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Subscribed Events</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event, index) => (
                            <Badge key={index} variant="outline">{event}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Retry Count</p>
                          <p className="text-muted-foreground">{webhook.retryCount}</p>
                        </div>
                        <div>
                          <p className="font-medium">Timeout</p>
                          <p className="text-muted-foreground">{webhook.timeout}s</p>
                        </div>
                        <div>
                          <p className="font-medium">Last Triggered</p>
                          <p className="text-muted-foreground">
                            {webhook.lastTriggered 
                              ? new Date(webhook.lastTriggered).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <Select value={selectedWebhook || 'all'} onValueChange={(value) => {
              setSelectedWebhook(value === 'all' ? null : value)
            }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by webhook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Webhooks</SelectItem>
                {webhooks.map((webhook) => (
                  <SelectItem key={webhook.id} value={webhook.id}>
                    {webhook.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Delivery Logs</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Webhook delivery logs will appear here once events are triggered.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredLogs.slice(0, 50).map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="font-medium">{log.event}</span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {log.url}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {log.error && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                        {log.error}
                      </div>
                    )}
                    {log.statusCode && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Status Code: {log.statusCode}
                        {log.retryCount > 0 && ` • Retries: ${log.retryCount}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}