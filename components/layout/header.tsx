'use client'

import { useState } from 'react'
import { Bell, LogOut, User, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success',
      title: 'Credential Issued Successfully',
      message: 'Age credential has been issued to john.doe@example.com',
      timestamp: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Verification Request Pending',
      message: 'TechCorp Solutions is requesting age verification',
      timestamp: '15 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'New Schema Created',
      message: 'Professional Certificate schema has been created',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Credential Revoked',
      message: 'Security breach detected - credential revoked',
      timestamp: '2 hours ago',
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  /**
   * Handle mark notification as read
   */
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  /**
   * Handle clear notification
   */
  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  /**
   * Get notification icon
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  /**
   * Handle profile
   */
  const handleProfile = () => {
    // Navigate to organization page for profile management
    window.location.href = '/organization'
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-didmgmt-text-secondary">
                  No notifications
                </div>
              ) : (
                <ScrollArea className="h-64">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b border-border last:border-b-0 hover:bg-accent cursor-pointer",
                        !notification.read && "bg-blue-50/50"
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClearNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-didmgmt-text-secondary mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-didmgmt-text-secondary">
                              {notification.timestamp}
                            </span>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
                <DropdownMenuItem onClick={handleProfile}>
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
