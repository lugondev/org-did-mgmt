import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  requiredCredentials: z.array(z.object({
    type: z.string().min(1, 'Credential type is required'),
    issuer: z.string().optional(),
    required: z.boolean().default(true)
  })).min(1, 'At least one credential requirement is needed'),
  expiresAt: z.string().datetime().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      author: {
        email: session.user.email
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Get requests with pagination
    const [requests, total] = await Promise.all([
      prisma.presentationRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              submissions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.presentationRequest.count({ where })
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching presentation requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentation requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRequestSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for duplicate name
    const existingRequest = await prisma.presentationRequest.findFirst({
      where: {
        name: validatedData.name,
        requesterId: user.id
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A presentation request with this name already exists' },
        { status: 409 }
      )
    }

    // Create presentation request
    const presentationRequest = await prisma.presentationRequest.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        query: validatedData.requiredCredentials,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        status: 'active',
        requesterId: user.id
      },
      include: {
        requester: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Presentation request created successfully',
      request: {
        id: presentationRequest.id,
        name: presentationRequest.name,
        description: presentationRequest.description,
        status: presentationRequest.status,
        createdAt: presentationRequest.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating presentation request:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create presentation request' },
      { status: 500 }
    )
  }
}