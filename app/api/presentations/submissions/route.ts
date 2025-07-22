import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { verifyPresentation } from '@/lib/did'

const createSubmissionSchema = z.object({
  presentationRequestId: z.string().min(1, 'Presentation request ID is required'),
  presentation: z.object({
    '@context': z.array(z.string()),
    type: z.array(z.string()),
    verifiableCredential: z.array(z.any()),
    proof: z.any()
  })
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
    const requestId = searchParams.get('requestId') || ''
    const skip = (page - 1) * limit

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause - only show submissions for user's requests
    const where: any = {
      presentationRequest: {
        authorId: user.id
      }
    }

    if (search) {
      where.OR = [
        {
          presentationRequest: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          submittedBy: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (requestId) {
      where.presentationRequestId = requestId
    }

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      prisma.presentationSubmission.findMany({
        where,
        include: {
          submitter: {
            select: {
              name: true,
              email: true
            }
          },
          request: {
            select: {
              name: true,
              description: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.presentationSubmission.count({ where })
    ])

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching presentation submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presentation submissions' },
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
    const validatedData = createSubmissionSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get presentation request
    const presentationRequest = await prisma.presentationRequest.findUnique({
      where: { id: validatedData.presentationRequestId }
    })

    if (!presentationRequest) {
      return NextResponse.json(
        { error: 'Presentation request not found' },
        { status: 404 }
      )
    }

    // Check if request is still active
    if (presentationRequest.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Presentation request is not active' },
        { status: 400 }
      )
    }

    // Check if request has expired
    if (presentationRequest.expiresAt && new Date() > presentationRequest.expiresAt) {
      return NextResponse.json(
        { error: 'Presentation request has expired' },
        { status: 400 }
      )
    }

    // Check if user already submitted for this request
    const existingSubmission = await prisma.presentationSubmission.findFirst({
      where: {
        requestId: validatedData.presentationRequestId,
        submitterId: user.id
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted a presentation for this request' },
        { status: 409 }
      )
    }

    // Validate that the presentation contains required credentials
    const requiredCredentials = presentationRequest.query as any[]
    const presentedCredentials = validatedData.presentation.verifiableCredential

    for (const required of requiredCredentials) {
      if (required.required) {
        const hasRequiredType = presentedCredentials.some((cred: any) => {
          const credTypes = Array.isArray(cred.type) ? cred.type : [cred.type]
          const hasType = credTypes.includes(required.type)
          
          if (required.issuer) {
            return hasType && cred.issuer === required.issuer
          }
          
          return hasType
        })

        if (!hasRequiredType) {
          return NextResponse.json(
            { error: `Missing required credential type: ${required.type}` },
            { status: 400 }
          )
        }
      }
    }

    // Create submission
    const submission = await prisma.presentationSubmission.create({
      data: {
        requestId: validatedData.presentationRequestId,
        submitterId: user.id,
        presentation: validatedData.presentation,
        status: 'pending',
        submittedAt: new Date()
      },
      include: {
        submitter: {
          select: {
            name: true,
            email: true
          }
        },
        request: {
          select: {
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Presentation submitted successfully',
      submission
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating presentation submission:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create presentation submission' },
      { status: 500 }
    )
  }
}