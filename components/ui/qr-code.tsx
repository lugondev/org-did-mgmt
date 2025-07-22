'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, QrCode, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
  data: string
  title?: string
  description?: string
  size?: number
  className?: string
}

/**
 * QR Code Generator component for credential sharing
 * Supports generating QR codes for credentials, presentations, and verification requests
 */
export function QRCodeGenerator({ 
  data, 
  title = "QR Code", 
  description = "Scan this QR code to access the credential",
  size = 256,
  className 
}: QRCodeGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customSize, setCustomSize] = useState(size)

  /**
   * Copy QR code data to clipboard
   */
  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(data)
      toast.success('Data copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy data')
    }
  }

  /**
   * Download QR code as PNG image
   */
  const handleDownload = () => {
    try {
      const canvas = document.querySelector('#qr-code-canvas') as HTMLCanvasElement
      if (canvas) {
        const url = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = `qr-code-${Date.now()}.png`
        link.href = url
        link.click()
        toast.success('QR code downloaded')
      }
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  /**
   * Share QR code using Web Share API
   */
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: description,
          url: data
        })
      } else {
        // Fallback to copying URL
        await handleCopyData()
      }
    } catch (error) {
      toast.error('Failed to share')
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <QrCode className="h-4 w-4 mr-2" />
        Generate QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <QRCodeSVG
                value={data}
                size={customSize}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#000000"
                includeMargin={false}
              />
            </div>

            {/* Size Control */}
            <div className="space-y-2">
              <Label htmlFor="qr-size">QR Code Size</Label>
              <Input
                id="qr-size"
                type="range"
                min="128"
                max="512"
                step="32"
                value={customSize}
                onChange={(e) => setCustomSize(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-center">
                {customSize}x{customSize} pixels
              </div>
            </div>

            {/* Data Preview */}
            <div className="space-y-2">
              <Label>Data Content</Label>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-sm break-all">
                  {data.length > 100 ? `${data.substring(0, 100)}...` : data}
                </code>
              </div>
              <Badge variant="secondary" className="text-xs">
                {data.length} characters
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyData}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface QRCodeDisplayProps {
  data: string
  size?: number
  className?: string
}

/**
 * Simple QR Code display component without dialog
 */
export function QRCodeDisplay({ data, size = 200, className }: QRCodeDisplayProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <QRCodeSVG
        value={data}
        size={size}
        level="M"
        bgColor="#FFFFFF"
        fgColor="#000000"
        includeMargin={false}
      />
    </div>
  )
}

interface CredentialQRProps {
  credentialId: string
  credentialData?: any
  verificationUrl?: string
  className?: string
}

/**
 * Specialized QR Code component for credentials
 * Generates verification URLs and credential sharing links
 */
export function CredentialQR({ 
  credentialId, 
  credentialData, 
  verificationUrl,
  className 
}: CredentialQRProps) {
  // Generate verification URL if not provided
  const defaultVerificationUrl = `${window.location.origin}/verification?credential=${credentialId}`
  const qrData = verificationUrl || defaultVerificationUrl

  return (
    <QRCodeGenerator
      data={qrData}
      title="Credential Verification"
      description="Scan this QR code to verify the credential"
      className={className}
    />
  )
}

interface PresentationQRProps {
  presentationId: string
  requestUrl?: string
  className?: string
}

/**
 * Specialized QR Code component for presentation requests
 * Generates presentation request URLs for mobile wallets
 */
export function PresentationQR({ 
  presentationId, 
  requestUrl,
  className 
}: PresentationQRProps) {
  // Generate presentation request URL if not provided
  const defaultRequestUrl = `${window.location.origin}/presentations/request/${presentationId}`
  const qrData = requestUrl || defaultRequestUrl

  return (
    <QRCodeGenerator
      data={qrData}
      title="Presentation Request"
      description="Scan this QR code to submit your presentation"
      className={className}
    />
  )
}