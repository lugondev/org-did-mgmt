'use client'

import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

/**
 * Header component with logo, test mode toggle, and user info
 */
export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('didmgmt-header h-16 px-6', className)}>
      <div className="flex h-full items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-didmgmt-blue">
            <svg
              className="h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-didmgmt-text-primary">
            didmgmt
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Test mode toggle */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-didmgmt-blue">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
            <span className="text-sm font-medium text-didmgmt-text-primary">
              Test mode
            </span>
            <Switch
              defaultChecked
              className="data-[state=checked]:bg-didmgmt-blue"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-didmgmt-text-secondary hover:text-didmgmt-text-primary">
            <Bell className="h-5 w-5" />
          </button>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-didmgmt-text-primary">
                Gulon
              </div>
              <div className="text-xs text-didmgmt-text-secondary">
                Gulon's Team
              </div>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Gulon" />
              <AvatarFallback className="bg-didmgmt-blue text-white text-sm">
                LL
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
