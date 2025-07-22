'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Download, 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface BatchRecipient {
  id: string
  email: string
  name: string
  did?: string
  credentialData: Record<string, any>
  status: 'pending' | 'processing' | 'issued' | 'failed'
  error?: string
  credentialId?: string
}

interface BatchJob {
  id: string
  name: string
  schemaId: string
  schemaName: string
  totalRecipients: number
  processedCount: number
  successCount: number
  failedCount: number
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed'
  createdAt: string
  startedAt?: string
  completedAt?: string
  recipients: BatchRecipient[]
}

interface BatchIssuerProps {
  schemas: Array<{
    id: string
    name: string
    description: string
    schema: any
  }>
  className?: string
}

/**
 * Advanced batch credential issuance component
 * Supports CSV import, progress tracking, and error handling
 */
export function BatchIssuer({ schemas, className }: BatchIssuerProps) {
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([])
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedSchema, setSelectedSchema] = useState('')
  const [jobName, setJobName] = useState('')
  const [recipients, setRecipients] = useState<BatchRecipient[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle CSV file upload and parsing
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        
        const parsedRecipients: BatchRecipient[] = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim())
          const credentialData: Record<string, any> = {}
          
          headers.forEach((header, i) => {
            if (values[i]) {
              credentialData[header] = values[i]
            }
          })

          return {
            id: `recipient-${index}`,
            email: credentialData.email || '',
            name: credentialData.name || credentialData.fullName || '',
            did: credentialData.did,
            credentialData,
            status: 'pending'
          }
        })

        setRecipients(parsedRecipients)
        toast.success(`Loaded ${parsedRecipients.length} recipients from CSV`)
      } catch (error) {
        toast.error('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  /**
   * Download CSV template for batch import
   */
  const downloadTemplate = () => {
    const schema = schemas.find(s => s.id === selectedSchema)
    if (!schema) {
      toast.error('Please select a schema first')
      return
    }

    // Generate CSV headers based on schema properties
    const headers = ['email', 'name', 'did', ...Object.keys(schema.schema.properties || {})]
    const csvContent = headers.join(',') + '\n'
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-template-${schema.name}.csv`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Template downloaded')
  }

  /**
   * Create new batch job
   */
  const createBatchJob = async () => {
    if (!selectedSchema || !jobName || recipients.length === 0) {
      toast.error('Please fill all required fields and upload recipients')
      return
    }

    setIsCreating(true)
    try {
      const schema = schemas.find(s => s.id === selectedSchema)!
      const newJob: BatchJob = {
        id: `job-${Date.now()}`,
        name: jobName,
        schemaId: selectedSchema,
        schemaName: schema.name,
        totalRecipients: recipients.length,
        processedCount: 0,
        successCount: 0,
        failedCount: 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        recipients: [...recipients]
      }

      setBatchJobs(prev => [newJob, ...prev])
      setCurrentJob(newJob)
      
      // Reset form
      setJobName('')
      setSelectedSchema('')
      setRecipients([])
      setShowCreateDialog(false)
      
      toast.success('Batch job created successfully')
    } catch (error) {
      toast.error('Failed to create batch job')
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Start batch processing
   */
  const startBatchProcessing = async (job: BatchJob) => {
    if (job.status === 'running') return

    setIsProcessing(true)
    const updatedJob = {
      ...job,
      status: 'running' as const,
      startedAt: new Date().toISOString()
    }
    
    setBatchJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j))
    setCurrentJob(updatedJob)

    // Simulate batch processing
    for (let i = 0; i < job.recipients.length; i++) {
      if (updatedJob.status !== 'running') break

      const recipient = job.recipients[i]
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simulate random success/failure (90% success rate)
        const success = Math.random() > 0.1
        
        if (success) {
          recipient.status = 'issued'
          recipient.credentialId = `cred-${Date.now()}-${i}`
          updatedJob.successCount++
        } else {
          recipient.status = 'failed'
          recipient.error = 'Failed to issue credential'
          updatedJob.failedCount++
        }
        
        updatedJob.processedCount++
        
        // Update state
        setBatchJobs(prev => prev.map(j => j.id === job.id ? { ...updatedJob } : j))
        setCurrentJob({ ...updatedJob })
        
      } catch (error) {
        recipient.status = 'failed'
        recipient.error = 'Processing error'
        updatedJob.failedCount++
        updatedJob.processedCount++
      }
    }

    // Mark job as completed
    const completedJob: BatchJob = {
      ...updatedJob,
      status: 'completed',
      completedAt: new Date().toISOString()
    }
    
    setBatchJobs(prev => prev.map(j => j.id === job.id ? completedJob : j))
    setCurrentJob(completedJob)
    setIsProcessing(false)
    
    toast.success(`Batch job completed: ${updatedJob.successCount}/${updatedJob.recipients.length} credentials issued`)
  }

  /**
   * Pause batch processing
   */
  const pauseBatchProcessing = (job: BatchJob) => {
    const updatedJob = { ...job, status: 'paused' as const }
    setBatchJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j))
    setCurrentJob(updatedJob)
    setIsProcessing(false)
    toast.info('Batch processing paused')
  }

  /**
   * Get status badge color
   */
  const getStatusBadge = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'error'> = {
      draft: 'secondary',
      running: 'default',
      paused: 'outline',
      completed: 'success',
      failed: 'destructive'
    }
    return variants[status] || 'secondary'
  }

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />
      case 'issued': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Batch Credential Issuance</h2>
          <p className="text-muted-foreground">Issue credentials to multiple recipients efficiently</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              New Batch Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Batch Issuance Job</DialogTitle>
              <DialogDescription>
                Upload a CSV file with recipient data to issue credentials in batch
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Job Name */}
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  placeholder="Enter job name"
                />
              </div>

              {/* Schema Selection */}
              <div className="space-y-2">
                <Label htmlFor="schema-select">Credential Schema</Label>
                <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schema" />
                  </SelectTrigger>
                  <SelectContent>
                    {schemas.map((schema) => (
                      <SelectItem key={schema.id} value={schema.id}>
                        {schema.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Download */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  disabled={!selectedSchema}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="csv-upload">Upload Recipients CSV</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>

              {/* Recipients Preview */}
              {recipients.length > 0 && (
                <div className="space-y-2">
                  <Label>Recipients Preview ({recipients.length} total)</Label>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {recipients.slice(0, 5).map((recipient, index) => (
                      <div key={index} className="text-sm py-1">
                        {recipient.name} ({recipient.email})
                      </div>
                    ))}
                    {recipients.length > 5 && (
                      <div className="text-sm text-muted-foreground py-1">
                        ... and {recipients.length - 5} more
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createBatchJob}
                  disabled={isCreating || !selectedSchema || !jobName || recipients.length === 0}
                >
                  {isCreating ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Batch Jobs List */}
      <div className="grid gap-4">
        {batchJobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {job.name}
                    <Badge variant={getStatusBadge(job.status)}>
                      {job.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Schema: {job.schemaName} • {job.totalRecipients} recipients
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {job.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => startBatchProcessing(job)}
                      disabled={isProcessing}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {job.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pauseBatchProcessing(job)}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  {job.status === 'paused' && (
                    <Button
                      size="sm"
                      onClick={() => startBatchProcessing(job)}
                      disabled={isProcessing}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress */}
              {job.status !== 'draft' && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.processedCount}/{job.totalRecipients}</span>
                  </div>
                  <Progress 
                    value={(job.processedCount / job.totalRecipients) * 100} 
                    className="w-full"
                  />
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {job.successCount} issued
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {job.failedCount} failed
                    </span>
                  </div>
                </div>
              )}

              {/* Recipients Table */}
              {job.recipients.length > 0 && (
                <div className="space-y-2">
                  <Label>Recipients Status</Label>
                  <ScrollArea className="h-48 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {job.recipients.map((recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell>{recipient.name}</TableCell>
                            <TableCell>{recipient.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(recipient.status)}
                                <span className="capitalize">{recipient.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {recipient.error && (
                                <span className="text-red-500 text-sm">
                                  {recipient.error}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {batchJobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Batch Jobs</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first batch job to issue credentials to multiple recipients at once.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              Create Batch Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}