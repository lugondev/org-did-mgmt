'use client'

import { Header } from './header'
import { Sidebar } from './sidebar'
import { Footer } from './footer'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Main layout component with header, sidebar, and footer
 */
export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}