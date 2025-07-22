import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Valid URL is required'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  isActive: z.boolean().default(true),
  secret: z.string().optional(),
  headers: z.any().optional(),
  retryCount: z.number().min(0).max(10).default(3),
  timeout: z.number().min(1).max(300).default(30)
})

// GET /api/webhooks - Get all webhooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isActive = searchParams.get('isActive')
    const event = searchParams.get('event')

    const skip = (page - 1) * limit

    const where: any = {}
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    if (event) {
      where.events = {
        has: event
      }
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.webhook.count({ where })
    ])

    return NextResponse.json({
      webhooks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}

// POST /api/webhooks - Create new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWebhookSchema.parse(body)

    // Check if webhook with same URL already exists
    const existingWebhook = await prisma.webhook.findFirst({
      where: {
        url: validatedData.url
      }
    })

    if (existingWebhook) {
      return NextResponse.json(
        { error: 'Webhook with this URL already exists' },
        { status: 400 }
      )
    }

    const webhook = await prisma.webhook.create({
      data: {
        name: validatedData.name,
        url: validatedData.url,
        events: validatedData.events,
        isActive: validatedData.isActive,
        secret: validatedData.secret,
        headers: validatedData.headers,
        retryCount: validatedData.retryCount,
        timeout: validatedData.timeout,
        status: 'active'
      }
    })

    return NextResponse.json(webhook, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating webhook:', error)
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    )
  }
}