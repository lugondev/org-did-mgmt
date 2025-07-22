'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Plus, FileText, Edit, Trash2, Eye, Search } from 'lucide-react'
import { toast } from 'sonner'

interface CredentialSchema {
  id: string
  name: string
  description: string
  type: string
  version: string
  status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED'
  author: {
    id: string
    name: string
    email: string
  }
  credentialCount: number
  templateCount: number
  createdAt: string
  updatedAt: string
}

interface SchemaFormData {
  name: string
  description: string
  type: string
  version: string
  schema: any
  context: string[]
}

interface SchemaManagementProps {
  className?: string
}

export function SchemaManagement({ className }: SchemaManagementProps) {
  const [schemas, setSchemas] = useState<CredentialSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedSchema, setSelectedSchema] = useState<CredentialSchema | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState<SchemaFormData>({
    name: '',
    description: '',
    type: '',
    version: '1.0.0',
    schema: {
      type: 'object',
      properties: {
        credentialSubject: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The identifier of the credential subject'
            }
          },
          required: ['id']
        }
      },
      required: ['credentialSubject']
    },
    context: ['https://www.w3.org/2018/credentials/v1']
  })

  useEffect(() => {
    fetchSchemas()
  }, [searchTerm, statusFilter, typeFilter])

  const fetchSchemas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      
      const response = await fetch(`/api/schemas?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch schemas')
      }
      const data = await response.json()
      setSchemas(data.schemas)
    } catch (error) {
      console.error('Error fetching schemas:', error)
      toast.error('Failed to load schemas')
    } finally {
      setLoading(false)
    }
  }

  const createSchema = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/schemas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create schema')
      }
      
      toast.success('Schema created successfully')
      setShowCreateDialog(false)
      resetForm()
      await fetchSchemas()
    } catch (error) {
      console.error('Error creating schema:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create schema')
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '',
      version: '1.0.0',
      schema: {
        type: 'object',
        properties: {
          credentialSubject: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The identifier of the credential subject'
              }
            },
            required: ['id']
          }
        },
        required: ['credentialSubject']
      },
      context: ['https://www.w3.org/2018/credentials/v1']
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'DEPRECATED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSchemas = schemas.filter(schema => {
    const matchesSearch = schema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schema.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || schema.status === statusFilter
    const matchesType = typeFilter === 'all' || schema.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading schemas...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Schema Management</h2>
          <p className="text-muted-foreground">
            Create and manage credential schemas for your verifiable credentials
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Schema</DialogTitle>
              <DialogDescription>
                Define a new credential schema with JSON Schema format
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., University Degree"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., UniversityDegreeCredential"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this credential schema represents"
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <Label htmlFor="schema">JSON Schema</Label>
                <Textarea
                  id="schema"
                  value={JSON.stringify(formData.schema, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setFormData({ ...formData, schema: parsed })
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="font-mono text-sm"
                  rows={15}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createSchema} disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Schema
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search schemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DEPRECATED">Deprecated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="EducationCredential">Education</SelectItem>
            <SelectItem value="EmploymentCredential">Employment</SelectItem>
            <SelectItem value="IdentityCredential">Identity</SelectItem>
            <SelectItem value="CertificationCredential">Certification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSchemas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schemas Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {schemas.length === 0 
                ? "Create your first credential schema to define the structure of your verifiable credentials."
                : "No schemas match your current filters. Try adjusting your search criteria."
              }
            </p>
            {schemas.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Schema
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredSchemas.map((schema) => (
            <Card key={schema.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{schema.name}</span>
                      <Badge className={getStatusColor(schema.status)}>
                        {schema.status}
                      </Badge>
                      <Badge variant="outline">v{schema.version}</Badge>
                    </CardTitle>
                    <CardDescription>{schema.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{schema.credentialCount}</div>
                    <div className="text-sm text-muted-foreground">Credentials</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{schema.templateCount}</div>
                    <div className="text-sm text-muted-foreground">Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Type: {schema.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Author: {schema.author.name}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(schema.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated: {new Date(schema.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}