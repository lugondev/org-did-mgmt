'use client'

import { PolicyEngine } from '@/components/verification/policy-engine'

export default function PoliciesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-didmgmt-text-primary">
          Verification Policies
        </h1>
        <p className="text-didmgmt-text-secondary">
          Manage verification policies and rules for credential validation
        </p>
      </div>
      <PolicyEngine />
    </div>
  )
}