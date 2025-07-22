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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Shield, CheckCircle, AlertCircle, Settings, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface PolicyRule {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists'
  value: string
  required: boolean
}

interface VerificationPolicy {
  id: string
  name: string
  description: string
  credentialTypes: string[]
  rules: PolicyRule[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PolicyEngineProps {
  className?: string
}

export function PolicyEngine({ className }: PolicyEngineProps) {
  const [policies, setPolicies] = useState<VerificationPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<VerificationPolicy | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credentialTypes: [] as string[],
    rules: [] as PolicyRule[],
    isActive: true
  })

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/verification/policies')
      if (response.ok) {
        const data = await response.json()
        setPolicies(data)
      }
    } catch (error) {
      console.error('Error fetching policies:', error)
      toast.error('Failed to fetch verification policies')
    } finally {
      setLoading(false)
    }
  }

  const createPolicy = async () => {
    try {
      const response = await fetch('/api/verification/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Verification policy created successfully')
        setShowCreateDialog(false)
        resetForm()
        fetchPolicies()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create policy')
      }
    } catch (error) {
      console.error('Error creating policy:', error)
      toast.error('Failed to create verification policy')
    }
  }

  const updatePolicy = async () => {
    if (!editingPolicy) return

    try {
      const response = await fetch(`/api/verification/policies/${editingPolicy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Verification policy updated successfully')
        setEditingPolicy(null)
        resetForm()
        fetchPolicies()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update policy')
      }
    } catch (error) {
      console.error('Error updating policy:', error)
      toast.error('Failed to update verification policy')
    }
  }

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return

    try {
      const response = await fetch(`/api/verification/policies/${policyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Verification policy deleted successfully')
        fetchPolicies()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete policy')
      }
    } catch (error) {
      console.error('Error deleting policy:', error)
      toast.error('Failed to delete verification policy')
    }
  }

  const togglePolicyStatus = async (policyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/verification/policies/${policyId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast.success(`Policy ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchPolicies()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update policy status')
      }
    } catch (error) {
      console.error('Error toggling policy status:', error)
      toast.error('Failed to update policy status')
    }
  }

  const addRule = () => {
    const newRule: PolicyRule = {
      id: `rule_${Date.now()}`,
      field: '',
      operator: 'equals',
      value: '',
      required: true
    }
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }))
  }

  const updateRule = (ruleId: string, updates: Partial<PolicyRule>) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }))
  }

  const removeRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      credentialTypes: [],
      rules: [],
      isActive: true
    })
  }

  const startEdit = (policy: VerificationPolicy) => {
    setEditingPolicy(policy)
    setFormData({
      name: policy.name,
      description: policy.description,
      credentialTypes: policy.credentialTypes,
      rules: policy.rules,
      isActive: policy.isActive
    })
    setShowCreateDialog(true)
  }

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      equals: 'Equals',
      not_equals: 'Not Equals',
      contains: 'Contains',
      not_contains: 'Not Contains',
      greater_than: 'Greater Than',
      less_than: 'Less Than',
      exists: 'Exists',
      not_exists: 'Not Exists'
    }
    return labels[operator] || operator
  }

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
          <h2 className="text-2xl font-bold">Policy Engine</h2>
          <p className="text-muted-foreground">
            Create and manage verification policies for credential validation
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) {
            setEditingPolicy(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Verification Policy' : 'Create New Verification Policy'}
              </DialogTitle>
              <DialogDescription>
                Define rules and conditions for credential verification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter policy name"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Active Policy</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this policy"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="credentialTypes">Credential Types (comma-separated)</Label>
                <Input
                  id="credentialTypes"
                  value={formData.credentialTypes.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    credentialTypes: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  }))}
                  placeholder="e.g., EducationCredential, EmploymentCredential"
                />
              </div>

              {/* Rules Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Verification Rules</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
                
                {formData.rules.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No rules defined. Add rules to specify verification conditions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {formData.rules.map((rule, index) => (
                      <Card key={rule.id}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-3">
                              <Label>Field Path</Label>
                              <Input
                                value={rule.field}
                                onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                                placeholder="credentialSubject.degree"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label>Operator</Label>
                              <Select
                                value={rule.operator}
                                onValueChange={(value: any) => updateRule(rule.id, { operator: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Not Equals</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="not_contains">Not Contains</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                  <SelectItem value="exists">Exists</SelectItem>
                                  <SelectItem value="not_exists">Not Exists</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3">
                              <Label>Value</Label>
                              <Input
                                value={rule.value}
                                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                placeholder="Expected value"
                                disabled={rule.operator === 'exists' || rule.operator === 'not_exists'}
                              />
                            </div>
                            <div className="col-span-2 flex items-center space-x-2">
                              <Switch
                                checked={rule.required}
                                onCheckedChange={(checked) => updateRule(rule.id, { required: checked })}
                              />
                              <Label className="text-sm">Required</Label>
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false)
                  setEditingPolicy(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={editingPolicy ? updatePolicy : createPolicy}>
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Policies Created</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create verification policies to define credential validation rules.
              </p>
            </CardContent>
          </Card>
        ) : (
          policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-base">{policy.name}</CardTitle>
                    <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={policy.isActive}
                      onCheckedChange={(checked) => togglePolicyStatus(policy.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(policy)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePolicy(policy.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{policy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Credential Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {policy.credentialTypes.map((type, index) => (
                        <Badge key={index} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Rules ({policy.rules.length})</h4>
                    {policy.rules.length > 0 ? (
                      <div className="space-y-2">
                        {policy.rules.slice(0, 3).map((rule, index) => (
                          <div key={index} className="text-sm bg-muted p-2 rounded">
                            <span className="font-mono">{rule.field}</span>
                            <span className="mx-2">{getOperatorLabel(rule.operator)}</span>
                            {rule.value && <span className="font-mono">"{rule.value}"</span>}
                            {rule.required && <Badge className="ml-2" variant="secondary">Required</Badge>}
                          </div>
                        ))}
                        {policy.rules.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{policy.rules.length - 3} more rules
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No rules defined</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}