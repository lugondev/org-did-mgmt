'use client'

import { Palette, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function DesignerPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Designer
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Design and customize your credential templates
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            New Design
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Empty State */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-didmgmt-blue/10">
              <Palette className="h-8 w-8 text-didmgmt-blue" />
            </div>
            <CardTitle>Credential Designer</CardTitle>
            <CardDescription>
              Create beautiful, branded credential designs that reflect your
              organization's identity
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Start Designing
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
