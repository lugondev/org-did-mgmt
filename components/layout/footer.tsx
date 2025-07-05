'use client'

import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

/**
 * Footer component
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        'border-t border-border bg-background px-6 py-4',
        className
      )}
    >
      <div className="flex items-center justify-between text-sm text-didmgmt-text-secondary">
        <div className="flex items-center gap-4">
          <span>© 2024 OrgDID. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-didmgmt-text-primary">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-didmgmt-text-primary">
            Terms of Service
          </a>
          <a href="#" className="hover:text-didmgmt-text-primary">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}
