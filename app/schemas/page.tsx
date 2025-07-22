'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, X, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Type definitions for better type safety
interface SchemaAttribute {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'email'
  required: boolean
}

interface Schema {
  id: string
  name: string
  description: string
  version: string
  type: 'credential' | 'certificate' | 'license' | 'badge'
  attributes: SchemaAttribute[]
  createdAt: string
  status: 'active' | 'inactive'
}

interface FormData {
  name: string
  description: string
  version: string
  type: 'credential' | 'certificate' | 'license' | 'badge'
  attributes: SchemaAttribute[]
}

export default function SchemasPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false)
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Form state with proper typing
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    version: '1.0.0',
    type: 'credential',
    attributes: [{ name: '', type: 'string', required: true }]
  })

  // Handle create schema
  const handleCreateSchema = (): void => {
    setCreateDialogOpen(true)
  }

  /**
   * Add a new attribute to the schema form
   */
  const handleAddAttribute = (): void => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', type: 'string', required: true }]
    }))
  }

  /**
   * Remove an attribute from the schema form
   * @param index - Index of the attribute to remove
   */
  const handleRemoveAttribute = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }))
  }

  /**
   * Update a specific field of an attribute
   * @param index - Index of the attribute to update
   * @param field - Field name to update
   * @param value - New value for the field
   */
  const handleAttributeChange = (
    index: number, 
    field: keyof SchemaAttribute, 
    value: string | boolean
  ): void => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }

  /**
   * Handle form submission to create a new schema
   */
  const handleSubmit = async (): Promise<void> => {
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Schema name is required')
      return
    }

    if (formData.attributes.some(attr => !attr.name.trim())) {
      toast.error('All attribute names are required')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newSchema: Schema = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      setSchemas(prev => [newSchema, ...prev])
      setCreateDialogOpen(false)
      
      // Reset form to initial state
      setFormData({
        name: '',
        description: '',
        version: '1.0.0',
        type: 'credential',
        attributes: [{ name: '', type: 'string', required: true }]
      })
    } catch (error) {
      console.error('Error creating schema:', error)
      toast.error('Failed to create schema. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Filter schemas based on search term with memoization for performance
   */
  const filteredSchemas = useMemo((): Schema[] => {
    if (!searchTerm.trim()) {
      return schemas
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase()
    return schemas.filter(schema =>
      schema.name.toLowerCase().includes(lowerSearchTerm) ||
      schema.description.toLowerCase().includes(lowerSearchTerm)
    )
  }, [schemas, searchTerm])
  
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Schemas
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Manage your credential schemas and templates
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" onClick={handleCreateSchema}>
            <Plus className="mr-2 h-4 w-4" />
            Create Schema
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-didmgmt-text-secondary" />
            <Input 
              placeholder="Search schemas..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Schemas List or Empty State */}
        {filteredSchemas.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>{schemas.length === 0 ? 'No Schemas Found' : 'No Matching Schemas'}</CardTitle>
              <CardDescription>
                {schemas.length === 0 
                  ? 'Create your first credential schema to get started'
                  : 'Try adjusting your search criteria'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {schemas.length === 0 && (
                <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" onClick={handleCreateSchema}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Schema
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchemas.map(schema => (
              <Card key={schema.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-didmgmt-blue" />
                      <CardTitle className="text-lg">{schema.name}</CardTitle>
                    </div>
                    <Badge variant={schema.status === 'active' ? 'default' : 'secondary'}>
                      {schema.status}
                    </Badge>
                  </div>
                  <CardDescription>{schema.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-didmgmt-text-secondary">
                    <div>Version: {schema.version}</div>
                    <div>Type: {schema.type}</div>
                    <div>Attributes: {schema.attributes.length}</div>
                    <div>Created: {new Date(schema.createdAt).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Schema Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Schema</DialogTitle>
            <DialogDescription>
              Define the structure and attributes for your credential schema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Schema Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., University Degree"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this schema represents..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="type">Schema Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: string) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    type: value as FormData['type']
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credential">Credential</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="badge">Badge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attributes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Schema Attributes</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddAttribute}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Attribute
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        placeholder="Attribute name"
                        value={attribute.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Select 
                        value={attribute.type} 
                        onValueChange={(value: string) => 
                          handleAttributeChange(index, 'type', value as SchemaAttribute['type'])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={attribute.required}
                        onChange={(e) => handleAttributeChange(index, 'required', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Required</span>
                    </div>
                    {formData.attributes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttribute(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.name || isLoading}
              className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
            >
              {isLoading ? 'Creating...' : 'Create Schema'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
