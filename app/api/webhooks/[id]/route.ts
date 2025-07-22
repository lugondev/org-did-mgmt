import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  url: z.string().url('Valid URL is required').optional(),
  events: z.array(z.string()).min(1, 'At least one event must be selected').optional(),
  isActive: z.boolean().optional(),
  secret: z.string().optional(),
  headers: z.any().optional(),
  retryCount: z.number().min(0).max(10).optional(),
  timeout: z.number().min(1).max(300).optional()
})

// GET /api/webhooks/[id] - Get specific webhook
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json(webhook)
  } catch (error: any) {
    console.error('Error fetching webhook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    )
  }
}

// PUT /api/webhooks/[id] - Update webhook
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const validatedData = updateWebhookSchema.parse(body)

    // Check if webhook exists
    const existingWebhook = await prisma.webhook.findUnique({
      where: {
        id: (await params).id
      }
    })

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Check if URL is being changed and if it conflicts with another webhook
    if (validatedData.url && validatedData.url !== existingWebhook.url) {
      const conflictingWebhook = await prisma.webhook.findFirst({
        where: {
          url: validatedData.url,
          id: {
            not: (await params).id
          }
        }
      })

      if (conflictingWebhook) {
        return NextResponse.json(
          { error: 'Webhook with this URL already exists' },
          { status: 400 }
        )
      }
    }

    const webhook = await prisma.webhook.update({
      where: {
        id: (await params).id
      },
      data: validatedData
    })

    return NextResponse.json(webhook)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    )
  }
}

// DELETE /api/webhooks/[id] - Delete webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if webhook exists
    const existingWebhook = await prisma.webhook.findUnique({
      where: {
        id: (await params).id
      }
    })

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Delete webhook and related logs
    await prisma.$transaction([
      prisma.webhookLog.deleteMany({
        where: {
          webhookId: (await params).id
        }
      }),
      prisma.webhook.delete({
        where: {
          id: (await params).id
        }
      })
    ])

    return NextResponse.json(
      { message: 'Webhook deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    )
  }
}