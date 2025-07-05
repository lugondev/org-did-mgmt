'use client'

import { useState } from 'react'
import { Search, Download, RotateCcw, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Issue credentials
          </Button>
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
            <div className="flex h-64 items-center justify-center text-didmgmt-text-secondary">
              No requested credentials found.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
