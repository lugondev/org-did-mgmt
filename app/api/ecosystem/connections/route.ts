import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/connections
 * Fetch all partner connections with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const partnerId = searchParams.get('partnerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (partnerId) {
      where.partnerId = partnerId
    }

    const [connections, total] = await Promise.all([
      prisma.partnerConnection.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          partner: {
            select: {
              id: true,
              name: true,
              type: true,
              email: true,
              status: true
            }
          }
        }
      }),
      prisma.partnerConnection.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        connections,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ecosystem/connections
 * Create a new partner connection request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { partnerId, notes, requestedBy } = body

    // Validate required fields
    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Check if partner exists
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId }
    })

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Check if there's already a pending connection
    const existingConnection = await prisma.partnerConnection.findFirst({
      where: {
        partnerId,
        status: 'pending'
      }
    })

    if (existingConnection) {
      return NextResponse.json(
        { success: false, error: 'A pending connection request already exists for this partner' },
        { status: 409 }
      )
    }

    // Create new connection request
    const connection = await prisma.partnerConnection.create({
      data: {
        partnerId,
        status: 'pending',
        requestedBy: requestedBy || 'system',
        notes: notes || 'Connection request'
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: connection
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create connection' },
      { status: 500 }
    )
  }
}