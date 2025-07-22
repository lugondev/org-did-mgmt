import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const toggleWebhookSchema = z.object({
  isActive: z.boolean()
})

// PATCH /api/webhooks/[id]/toggle - Toggle webhook active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = toggleWebhookSchema.parse(body)

    // Check if webhook exists
    const existingWebhook = await prisma.webhook.findUnique({
      where: {
        id: params.id
      }
    })

    if (!existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    const webhook = await prisma.webhook.update({
      where: {
        id: params.id
      },
      data: {
        isActive,
        status: isActive ? 'active' : 'inactive',
        updatedAt: new Date()
      }
    })

    return NextResponse.json(webhook)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error toggling webhook status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle webhook status' },
      { status: 500 }
    )
  }
}