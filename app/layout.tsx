import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Layout } from '@/components/layout/layout'
import { SessionProvider } from '@/components/providers/session-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OrgDID - Digital Identity & Credentials Platform',
  description:
    'Secure digital identity and verifiable credentials platform powered by DID technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Layout>{children}</Layout>
          <Toaster position="top-right" richColors />
        </SessionProvider>
      </body>
    </html>
  )
}
