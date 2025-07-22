import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/verification/requests
 * Fetch all verification requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where = status ? { status } : {}

    const [requests, total] = await Promise.all([
      prisma.verificationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          credential: {
            select: {
              type: true,
              issuer: true
            }
          },
          requester: {
            select: {
              email: true,
              name: true
            }
          }
        }
      }),
      prisma.verificationRequest.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching verification requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification requests' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/verification/requests
 * Create a new verification request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentialId, requesterId, verificationPolicyId, metadata } = body

    // Validate required fields
    if (!credentialId || !requesterId) {
      return NextResponse.json(
        { success: false, error: 'credentialId and requesterId are required' },
        { status: 400 }
      )
    }

    // Check if credential exists
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId }
    })

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential not found' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: requesterId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        credentialId,
        requesterId,
        verificationPolicyId,
        status: 'pending',
        metadata: metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        credential: {
          select: {
            type: true,
            issuer: true
          }
        },
        requester: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: verificationRequest
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating verification request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create verification request' },
      { status: 500 }
    )
  }
}