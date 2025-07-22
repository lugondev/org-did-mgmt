'use client'

import { useState } from 'react'
import { Send, FileText, User, Calendar, Building, Mail, Phone, MapPin, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Interface for credential request form data
interface CredentialRequestForm {
  // Personal Information
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  
  // Credential Information
  credentialType: string
  organizationName: string
  purpose: string
  additionalInfo: string
  
  // Supporting Documents
  documents: File[]
}

// Available credential types
const CREDENTIAL_TYPES = [
  { value: 'education', label: 'Education Certificate', description: 'Academic degrees, diplomas, certificates' },
  { value: 'employment', label: 'Employment Verification', description: 'Work experience, job titles, employment history' },
  { value: 'professional', label: 'Professional License', description: 'Professional certifications, licenses' },
  { value: 'identity', label: 'Identity Verification', description: 'Government ID, citizenship, residency' },
  { value: 'skill', label: 'Skill Certification', description: 'Technical skills, competencies' },
  { value: 'membership', label: 'Membership Credential', description: 'Organization membership, club membership' },
  { value: 'other', label: 'Other', description: 'Custom credential type' }
]

/**
 * Request Credential Page Component
 * Allows users to submit requests for verifiable credentials
 */
export default function RequestCredentialPage() {
  const [formData, setFormData] = useState<CredentialRequestForm>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    credentialType: '',
    organizationName: '',
    purpose: '',
    additionalInfo: '',
    documents: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: keyof CredentialRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  /**
   * Handle file upload for supporting documents
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has invalid type. Only PDF, JPG, PNG are allowed.`)
        return false
      }
      return true
    })
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }))
  }

  /**
   * Remove uploaded document
   */
  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.credentialType) newErrors.credentialType = 'Credential type is required'
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required'
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Prepare request data
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address || undefined,
        credentialType: formData.credentialType,
        organizationName: formData.organizationName,
        purpose: formData.purpose,
        additionalInfo: formData.additionalInfo || undefined,
        documents: formData.documents.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      }
      
      // Submit request to API
      const response = await fetch('/api/request-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit request')
      }
      
      console.log('Credential request submitted successfully:', result)
      setSubmitSuccess(true)
      
      // Reset form after successful submission
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        credentialType: '',
        organizationName: '',
        purpose: '',
        additionalInfo: '',
        documents: []
      })
      
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Get selected credential type details
   */
  const getSelectedCredentialType = () => {
    return CREDENTIAL_TYPES.find(type => type.value === formData.credentialType)
  }

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Request Submitted Successfully!</CardTitle>
            <CardDescription className="text-lg">
              Your verifiable credential request has been submitted and is being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                You will receive an email notification once your request is processed.
                This typically takes 1-3 business days.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setSubmitSuccess(false)}>
                  Submit Another Request
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/credentials'}>
                  View My Credentials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request Verifiable Credential
          </h1>
          <p className="text-gray-600">
            Submit a request to receive a verifiable digital credential. 
            Please provide accurate information and supporting documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="credential">Credential Details</TabsTrigger>
              <TabsTrigger value="documents">Supporting Documents</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Provide your personal details for credential verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your full address"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credential Details Tab */}
            <TabsContent value="credential" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Credential Details
                  </CardTitle>
                  <CardDescription>
                    Specify the type of credential you're requesting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="credentialType">Credential Type *</Label>
                    <Select value={formData.credentialType} onValueChange={(value) => handleInputChange('credentialType', value)}>
                      <SelectTrigger className={errors.credentialType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select credential type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CREDENTIAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.credentialType && <p className="text-sm text-red-500 mt-1">{errors.credentialType}</p>}
                    
                    {getSelectedCredentialType() && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <Badge variant="secondary" className="mb-2">{getSelectedCredentialType()?.label}</Badge>
                        <p className="text-sm text-gray-600">{getSelectedCredentialType()?.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="organizationName">Issuing Organization *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder="Name of the organization that should issue this credential"
                      className={errors.organizationName ? 'border-red-500' : ''}
                    />
                    {errors.organizationName && <p className="text-sm text-red-500 mt-1">{errors.organizationName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="purpose">Purpose of Request *</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      placeholder="Explain why you need this credential and how it will be used"
                      rows={3}
                      className={errors.purpose ? 'border-red-500' : ''}
                    />
                    {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      placeholder="Any additional information that might help process your request"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Supporting Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Supporting Documents
                  </CardTitle>
                  <CardDescription>
                    Upload documents that support your credential request (PDF, JPG, PNG - Max 10MB each)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="documents">Upload Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB each</p>
                      <Input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById('documents')?.click()}
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  
                  {/* Uploaded Files List */}
                  {formData.documents.length > 0 && (
                    <div>
                      <Label>Uploaded Documents ({formData.documents.length})</Label>
                      <div className="space-y-2 mt-2">
                        {formData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ready to Submit?</h3>
                  <p className="text-sm text-gray-600">Review your information and submit your credential request</p>
                </div>
                <div className="flex gap-3">
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">
                        Preview Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Request Preview</DialogTitle>
                        <DialogDescription>
                          Review your credential request before submitting
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>Name:</strong> {formData.fullName || 'Not provided'}</div>
                            <div><strong>Email:</strong> {formData.email || 'Not provided'}</div>
                            <div><strong>Phone:</strong> {formData.phone || 'Not provided'}</div>
                            <div><strong>Date of Birth:</strong> {formData.dateOfBirth || 'Not provided'}</div>
                          </div>
                          {formData.address && (
                            <div className="mt-2 text-sm"><strong>Address:</strong> {formData.address}</div>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Credential Details</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Type:</strong> {getSelectedCredentialType()?.label || 'Not selected'}</div>
                            <div><strong>Organization:</strong> {formData.organizationName || 'Not provided'}</div>
                            <div><strong>Purpose:</strong> {formData.purpose || 'Not provided'}</div>
                            {formData.additionalInfo && (
                              <div><strong>Additional Info:</strong> {formData.additionalInfo}</div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Supporting Documents</h4>
                          <div className="text-sm">
                            {formData.documents.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1">
                                {formData.documents.map((file, index) => (
                                  <li key={index}>{file.name}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">No documents uploaded</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}