'use client'

import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SchemasPage() {
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
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
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
            <Input placeholder="Search schemas..." className="pl-10" />
          </div>
        </div>

        {/* Empty State */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No Schemas Found</CardTitle>
            <CardDescription>
              Create your first credential schema to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Schema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
