import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/partners
 * Fetch all partners with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (type && type !== 'all') {
      where.type = type
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          connections: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.partner.count({ where })
    ])

    // Format response data
    const formattedPartners = partners.map(partner => ({
      ...partner,
      lastActivity: partner.lastActivity || partner.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        partners: formattedPartners,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ecosystem/partners
 * Create a new partner connection request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, email, website, description } = body

    // Validate required fields
    if (!name || !type || !email) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and email are required' },
        { status: 400 }
      )
    }

    // Check if partner already exists
    const existingPartner = await prisma.partner.findFirst({
      where: {
        OR: [
          { email },
          { name }
        ]
      }
    })

    if (existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner with this name or email already exists' },
        { status: 409 }
      )
    }

    // Create new partner
    const partner = await prisma.partner.create({
      data: {
        name,
        type,
        email,
        website: website || null,
        description: description || null,
        status: 'pending'
      },
      include: {
        connections: true
      }
    })

    // Create initial connection request
    await prisma.partnerConnection.create({
      data: {
        partnerId: partner.id,
        status: 'pending',
        requestedBy: 'system', // In real app, get from auth context
        notes: 'Initial connection request'
      }
    })

    // Update ecosystem stats
    await updateEcosystemStats()

    return NextResponse.json({
      success: true,
      data: partner
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to update ecosystem stats
 */
async function updateEcosystemStats() {
  try {
    const [totalPartners, activeConnections, credentialExchanges, verificationRequests] = await Promise.all([
      prisma.partner.count(),
      prisma.partner.count({ where: { status: 'connected' } }),
      prisma.partner.aggregate({ _sum: { credentialsExchanged: true } }),
      prisma.verificationRequest.count()
    ])

    await prisma.ecosystemStats.upsert({
      where: { id: 'main' },
      update: {
        totalPartners,
        activeConnections,
        credentialExchanges: credentialExchanges._sum.credentialsExchanged || 0,
        verificationRequests,
        updatedAt: new Date()
      },
      create: {
        id: 'main',
        totalPartners,
        activeConnections,
        credentialExchanges: credentialExchanges._sum.credentialsExchanged || 0,
        verificationRequests,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating ecosystem stats:', error)
  }
}