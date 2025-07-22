'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CreditCard,
  Layers,
  Palette,
  Shield,
  Building,
  Network,
  Activity,
  Code,
  HelpCircle,
  ChevronDown,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'DID Management',
    href: '/did',
    icon: Shield,
  },
  {
    title: 'Credentials',
    href: '/credentials',
    icon: CreditCard,
  },
  {
    title: 'Schemas',
    href: '/schemas',
    icon: Layers,
  },
  {
    title: 'Designer',
    href: '/designer',
    icon: Palette,
  },
  {
    title: 'Verification',
    href: '/verification',
    icon: Shield,
  },
  {
    title: 'Organization Profiles',
    href: '/organization',
    icon: Building,
  },
  {
    title: 'Ecosystem',
    href: '/ecosystem',
    icon: Network,
  },
  {
    title: 'Activity',
    href: '/activity',
    icon: Activity,
  },
  {
    title: 'Developer',
    href: '/developer',
    icon: Code,
    children: [
      {
        title: 'API Documentation',
        href: '/developer/api',
        icon: Code,
      },
      {
        title: 'Webhooks',
        href: '/developer/webhooks',
        icon: Code,
      },
    ],
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
    children: [
      {
        title: 'Documentation',
        href: '/help/docs',
        icon: HelpCircle,
      },
      {
        title: 'Support',
        href: '/help/support',
        icon: MessageSquare,
      },
    ],
  },
]

/**
 * Sidebar navigation component
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  // Handle speak to expert
  const handleSpeakToExpert = () => {
    // Open support page in new tab or navigate to help section
    window.open('/help/support', '_blank')
  }

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className={cn('didmgmt-sidebar w-64 h-full', className)}>
      <div className="p-4">
        {/* Speak to an Expert */}
        <div className="mb-6">
          <button 
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-background p-3 text-sm hover:bg-accent"
            onClick={handleSpeakToExpert}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Speak to an Expert</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.includes(item.title)
            const itemIsActive = isActive(item.href)

            return (
              <div key={item.title}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      'didmgmt-nav-item w-full justify-between',
                      itemIsActive && 'active'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn('didmgmt-nav-item', itemIsActive && 'active')}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                )}

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children?.map(child => {
                      const ChildIcon = child.icon
                      const childIsActive = isActive(child.href)

                      return (
                        <Link
                          key={child.title}
                          href={child.href}
                          className={cn(
                            'didmgmt-nav-item text-sm',
                            childIsActive && 'active'
                          )}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
