'use client'

import { WebhookManager } from '@/components/webhooks/webhook-manager'

export default function WebhooksPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-didmgmt-text-primary">
          Webhooks
        </h1>
        <p className="text-didmgmt-text-secondary">
          Manage webhook endpoints for real-time notifications
        </p>
      </div>
      <WebhookManager />
    </div>
  )
}
