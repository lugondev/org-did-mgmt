import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/verification/policies
 * Fetch all verification policies
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const where = status ? { status } : {}

    const [policies, total] = await Promise.all([
      prisma.verificationPolicy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.verificationPolicy.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        policies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching verification policies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification policies' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/verification/policies
 * Create a new verification policy
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      credentialTypes,
      requiredAttributes,
      validityPeriod,
      autoApprove,
      requireManualReview
    } = body

    // Validate required fields
    if (!name || !description || !credentialTypes || credentialTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'name, description, and credentialTypes are required'
        },
        { status: 400 }
      )
    }

    // Validate validity period
    const validityDays = parseInt(validityPeriod)
    if (isNaN(validityDays) || validityDays <= 0) {
      return NextResponse.json(
        { success: false, error: 'validityPeriod must be a positive number' },
        { status: 400 }
      )
    }

    // Check if policy with same name already exists
    const existingPolicy = await prisma.verificationPolicy.findFirst({
      where: {
        name
      }
    })

    if (existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'A policy with this name already exists' },
        { status: 409 }
      )
    }

    // Create verification policy
    const verificationPolicy = await prisma.verificationPolicy.create({
      data: {
        name,
        description,
        credentialTypes,
        requiredAttributes: requiredAttributes || [],
        validityPeriod: validityDays,
        autoApprove: autoApprove || false,
        requireManualReview: requireManualReview || true,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      data: verificationPolicy
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating verification policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create verification policy' },
      { status: 500 }
    )
  }
}