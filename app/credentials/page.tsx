'use client'

import { useState, useEffect } from 'react'
import { Search, Download, RotateCcw, Trash2, Plus, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Credential {
  id: string
  issuer: string
  type: string
  createdDate: string
  issueDate: string
  expiresAt: string
  revoked: boolean
  persistent: boolean
  zkp: boolean
}

interface CredentialRequest {
  id: string
  fullName: string
  email: string
  phone?: string
  credentialType: string
  organizationName: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  adminNotes?: string
  documents?: {
    id: string
    fileName: string
    fileSize: number
    fileType: string
  }[]
}

const mockCredentials: Credential[] = [
  {
    id: 'https://creds-test',
    issuer: 'AlphaTrue',
    type: 'AgeCredential',
    createdDate: '9/3/2025',
    issueDate: '9/3/2025',
    expiresAt: '',
    revoked: false,
    persistent: false,
    zkp: false,
  },
  {
    id: 'https://creds-test',
    issuer: 'AlphaTrue',
    type: 'AgeCredential',
    createdDate: '7/1/2025',
    issueDate: '7/1/2025',
    expiresAt: '',
    revoked: false,
    persistent: false,
    zkp: true,
  },
  {
    id: 'https://creds-test',
    issuer: 'AlphaTrue',
    type: 'AgeCredential',
    createdDate: '7/1/2025',
    issueDate: '7/1/2025',
    expiresAt: '',
    revoked: false,
    persistent: false,
    zkp: false,
  },
]

export default function CredentialsPage() {
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('issued')
  const [batchIssueOpen, setBatchIssueOpen] = useState(false)
  const [batchMethod, setBatchMethod] = useState<'csv' | 'json' | 'manual'>('csv')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState('')
  const [manualRecipients, setManualRecipients] = useState('')
  const [selectedSchema, setSelectedSchema] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [singleIssueOpen, setSingleIssueOpen] = useState(false)
  const [singleRecipientEmail, setSingleRecipientEmail] = useState('')
  const [singleRecipientName, setSingleRecipientName] = useState('')
  const [singleCredentialData, setSingleCredentialData] = useState('')
  
  // State for requested credentials
  const [requestedCredentials, setRequestedCredentials] = useState<CredentialRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [requestsError, setRequestsError] = useState<string | null>(null)

  /**
   * Fetch requested credentials from API
   */
  const fetchRequestedCredentials = async () => {
    setIsLoadingRequests(true)
    setRequestsError(null)
    
    try {
      const response = await fetch('/api/request-credential')
      
      if (!response.ok) {
        throw new Error('Failed to fetch requested credentials')
      }
      
      const data = await response.json()
      setRequestedCredentials(data.requests || [])
    } catch (error) {
      console.error('Error fetching requested credentials:', error)
      setRequestsError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoadingRequests(false)
    }
  }

  /**
   * Load requested credentials on component mount and when activeTab changes
   */
  useEffect(() => {
    if (activeTab === 'requested') {
      fetchRequestedCredentials()
    }
  }, [activeTab])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCredentials(mockCredentials.map(cred => cred.id))
    } else {
      setSelectedCredentials([])
    }
  }

  const handleSelectCredential = (credentialId: string, checked: boolean) => {
    if (checked) {
      setSelectedCredentials(prev => [...prev, credentialId])
    } else {
      setSelectedCredentials(prev => prev.filter(id => id !== credentialId))
    }
  }

  const isAllSelected = selectedCredentials.length === mockCredentials.length
  const isIndeterminate =
    selectedCredentials.length > 0 &&
    selectedCredentials.length < mockCredentials.length

  // Handle CSV file upload
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    }
  }

  // Handle batch issue submission
  const handleBatchIssue = async () => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form
      setCsvFile(null)
      setJsonData('')
      setManualRecipients('')
      setSelectedSchema('')
      setBatchIssueOpen(false)
      
      // Show success message (you can implement toast notification here)
      toast.success('Batch credentials issued successfully!')
    } catch (error) {
      toast.error('Error issuing credentials')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset batch issue form
  const resetBatchForm = () => {
    setCsvFile(null)
    setJsonData('')
    setManualRecipients('')
    setSelectedSchema('')
    setBatchMethod('csv')
  }

  // Handle single credential issue
  const handleSingleIssue = async () => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Reset form
      setSingleRecipientEmail('')
      setSingleRecipientName('')
      setSingleCredentialData('')
      setSelectedSchema('')
      setSingleIssueOpen(false)
      
      toast.success('Credential issued successfully!')
    } catch (error) {
      toast.error('Error issuing credential')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset single issue form
  const resetSingleForm = () => {
    setSingleRecipientEmail('')
    setSingleRecipientName('')
    setSingleCredentialData('')
    setSelectedSchema('')
  }

  // Download CSV template
  const downloadCsvTemplate = () => {
    const csvContent = 'email,name,age,additional_data\nuser1@example.com,John Doe,25,"Sample data"\nuser2@example.com,Jane Smith,30,"Another sample"'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch_credentials_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Credentials
            </h1>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-didmgmt-gray text-xs text-didmgmt-text-secondary">
              ?
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={singleIssueOpen} onOpenChange={setSingleIssueOpen}>
              <DialogTrigger asChild>
                <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" onClick={() => resetSingleForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Issue credential
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Issue Single Credential</DialogTitle>
                  <DialogDescription>
                    Issue a credential to a single recipient.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Schema Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credential Schema</label>
                    <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a credential schema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="age-credential">Age Credential</SelectItem>
                        <SelectItem value="identity-credential">Identity Credential</SelectItem>
                        <SelectItem value="education-credential">Education Credential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipient Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Email</label>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={singleRecipientEmail}
                      onChange={(e) => setSingleRecipientEmail(e.target.value)}
                    />
                  </div>

                  {/* Recipient Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Name</label>
                    <Input
                      placeholder="John Doe"
                      value={singleRecipientName}
                      onChange={(e) => setSingleRecipientName(e.target.value)}
                    />
                  </div>

                  {/* Credential Data */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credential Data (JSON)</label>
                    <Textarea
                      placeholder='{\n  "age": 25,\n  "verified": true\n}'
                      value={singleCredentialData}
                      onChange={(e) => setSingleCredentialData(e.target.value)}
                      className="min-h-[100px] font-mono text-sm"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSingleIssueOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSingleIssue}
                    disabled={!selectedSchema || !singleRecipientEmail || !singleRecipientName || isProcessing}
                    className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
                  >
                    {isProcessing ? 'Issuing...' : 'Issue Credential'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={batchIssueOpen} onOpenChange={setBatchIssueOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => resetBatchForm()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Batch issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Batch Issue Credentials</DialogTitle>
                  <DialogDescription>
                    Issue multiple credentials at once using CSV, JSON, or manual input.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Schema Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credential Schema</label>
                    <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a credential schema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="age-credential">Age Credential</SelectItem>
                        <SelectItem value="identity-credential">Identity Credential</SelectItem>
                        <SelectItem value="education-credential">Education Credential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Method Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Input Method</label>
                    <Tabs value={batchMethod} onValueChange={(value) => setBatchMethod(value as 'csv' | 'json' | 'manual')}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                        <TabsTrigger value="json">JSON Data</TabsTrigger>
                        <TabsTrigger value="manual">Manual Input</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="csv" className="space-y-4">
                         <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <label className="text-sm font-medium">Upload CSV File</label>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={downloadCsvTemplate}
                               className="text-xs"
                             >
                               <Download className="mr-1 h-3 w-3" />
                               Download Template
                             </Button>
                           </div>
                           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                             <input
                               type="file"
                               accept=".csv"
                               onChange={handleCsvUpload}
                               className="hidden"
                               id="csv-upload"
                             />
                             <label htmlFor="csv-upload" className="cursor-pointer">
                               <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                               <p className="text-sm text-gray-600">
                                 {csvFile ? csvFile.name : 'Click to upload CSV file'}
                               </p>
                               <p className="text-xs text-gray-500 mt-1">
                                 Expected format: email, name, age, additional_data
                               </p>
                             </label>
                           </div>
                         </div>
                       </TabsContent>
                      
                      <TabsContent value="json" className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">JSON Data</label>
                          <Textarea
                            placeholder={`[\n  {\n    "email": "user1@example.com",\n    "name": "John Doe",\n    "age": 25\n  },\n  {\n    "email": "user2@example.com",\n    "name": "Jane Smith",\n    "age": 30\n  }\n]`}
                            value={jsonData}
                            onChange={(e) => setJsonData(e.target.value)}
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Recipients (one per line)</label>
                          <Textarea
                            placeholder="user1@example.com\nuser2@example.com\nuser3@example.com"
                            value={manualRecipients}
                            onChange={(e) => setManualRecipients(e.target.value)}
                            className="min-h-[150px]"
                          />
                          <p className="text-xs text-gray-500">
                            Enter email addresses, one per line
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setBatchIssueOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBatchIssue}
                    disabled={!selectedSchema || isProcessing || (
                      batchMethod === 'csv' && !csvFile ||
                      batchMethod === 'json' && !jsonData.trim() ||
                      batchMethod === 'manual' && !manualRecipients.trim()
                    )}
                    className="bg-didmgmt-blue hover:bg-didmgmt-blue/90"
                  >
                    {isProcessing ? 'Processing...' : 'Issue Credentials'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="issued" className="px-6">
              Issued
            </TabsTrigger>
            <TabsTrigger value="requested" className="px-6">
              Requested
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issued" className="mt-6">
            {/* Actions Bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Copy Credential Ids
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>

              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-didmgmt-text-secondary" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Credential ID</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Revoked</TableHead>
                    <TableHead>Persistent</TableHead>
                    <TableHead>ZKP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCredentials.map((credential, index) => (
                    <TableRow key={`${credential.id}-${index}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCredentials.includes(credential.id)}
                          onCheckedChange={checked =>
                            handleSelectCredential(
                              credential.id,
                              checked as boolean
                            )
                          }
                          aria-label={`Select credential ${credential.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm text-didmgmt-blue">
                        {credential.id}
                      </TableCell>
                      <TableCell>{credential.issuer}</TableCell>
                      <TableCell>{credential.type}</TableCell>
                      <TableCell>{credential.createdDate}</TableCell>
                      <TableCell>{credential.issueDate}</TableCell>
                      <TableCell>{credential.expiresAt || '-'}</TableCell>
                      <TableCell>
                        {credential.revoked ? (
                          <span className="text-red-600">✗</span>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {credential.persistent ? (
                          <span className="text-red-600">✗</span>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {credential.zkp ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-didmgmt-text-secondary">
                Rows per page: 20
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-didmgmt-text-secondary">
                  1-3 of 3
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>
                    ‹
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    ›
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requested">
            {isLoadingRequests ? (
              <div className="flex h-64 items-center justify-center text-didmgmt-text-secondary">
                Loading requested credentials...
              </div>
            ) : requestsError ? (
              <div className="flex h-64 items-center justify-center text-red-500">
                Error: {requestsError}
              </div>
            ) : requestedCredentials.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-didmgmt-text-secondary">
                No requested credentials found.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => {}}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Credential Type</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Purpose</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestedCredentials.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Checkbox
                            checked={false}
                            onCheckedChange={() => {}}
                            aria-label={`Select request ${request.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{request.fullName}</TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{request.credentialType}</TableCell>
                        <TableCell>{request.organizationName}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              {
                                'bg-yellow-100 text-yellow-800': request.status === 'pending',
                                'bg-green-100 text-green-800': request.status === 'approved',
                                'bg-red-100 text-red-800': request.status === 'rejected',
                              }
                            )}
                          >
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.purpose}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
