import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/webhooks/[id]/test - Send test webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if webhook exists
    const webhook = await prisma.webhook.findUnique({
      where: {
        id: (await params).id
      }
    })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    if (!webhook.isActive) {
      return NextResponse.json(
        { error: 'Webhook is not active' },
        { status: 400 }
      )
    }

    // Create test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from your DID issuer system',
        webhookId: webhook.id,
        webhookName: webhook.name
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DID-Issuer-Webhook/1.0',
      ...(webhook.headers as Record<string, string> || {})
    }

    // Add signature if secret is provided
    if (webhook.secret) {
      const crypto = require('crypto')
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(testPayload))
        .digest('hex')
      headers['X-Webhook-Signature'] = `sha256=${signature}`
    }

    let webhookLog: any
    let success = false
    let statusCode: number | undefined
    let error: string | undefined
    let response: string | undefined

    try {
      // Send webhook
      const webhookResponse = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(webhook.timeout * 1000)
      })

      statusCode = webhookResponse.status
      response = await webhookResponse.text()
      success = webhookResponse.ok

      if (!success) {
        error = `HTTP ${statusCode}: ${response}`
      }
    } catch (fetchError: any) {
      error = fetchError.message
      statusCode = 0
    }

    // Log the webhook delivery
    webhookLog = await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: 'webhook.test',
        url: webhook.url,
        status: success ? 'success' : 'failed',
        statusCode,
        response: success ? response : undefined,
        error: success ? undefined : error,
        retryCount: 0
      }
    })

    // Update webhook last triggered time
    await prisma.webhook.update({
      where: {
        id: webhook.id
      },
      data: {
        lastTriggered: new Date(),
        status: success ? 'active' : 'failed'
      }
    })

    return NextResponse.json({
      success,
      statusCode,
      response: success ? 'Test webhook sent successfully' : error,
      logId: webhookLog.id
    })
  } catch (error) {
    console.error('Error sending test webhook:', error)
    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    )
  }
}