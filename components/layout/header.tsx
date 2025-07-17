'use client'

import { Bell, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

/**
 * Header component with logo, test mode toggle, and user info
 * Integrates with NextAuth for user authentication
 */
export function Header({ className }: HeaderProps) {
  const { data: session, status } = useSession()

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  /**
   * Get user initials for avatar fallback
   */
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
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
          {status === 'loading' ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            </div>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 p-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-didmgmt-text-primary">
                      {session.user.name || 'User'}
                    </div>
                    <div className="text-xs text-didmgmt-text-secondary">
                      {session.user.email || 'No email'}
                    </div>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={session.user.image || ''} 
                      alt={session.user.name || 'User'} 
                    />
                    <AvatarFallback className="bg-didmgmt-blue text-white text-sm">
                      {getUserInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <a href="/auth/signin">Đăng nhập</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
