import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/networks
 * Fetch all available networks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (type && type !== 'all') {
      where.type = type
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [networks, total] = await Promise.all([
      prisma.network.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.network.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        networks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching networks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch networks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ecosystem/networks
 * Create a new network
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, members } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Network name is required' },
        { status: 400 }
      )
    }

    // Check if network already exists
    const existingNetwork = await prisma.network.findFirst({
      where: { name }
    })

    if (existingNetwork) {
      return NextResponse.json(
        { success: false, error: 'Network with this name already exists' },
        { status: 409 }
      )
    }

    // Create new network
    const network = await prisma.network.create({
      data: {
        name,
        description: description || null,
        type: type || 'Public',
        members: members || 0,
        isJoined: false
      }
    })

    return NextResponse.json({
      success: true,
      data: network
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating network:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create network' },
      { status: 500 }
    )
  }
}