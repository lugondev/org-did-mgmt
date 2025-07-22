import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/schemas - Get all credential schemas
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type) {
      where.type = type
    }
    
    if (status) {
      where.status = status
    }

    const [schemas, total] = await Promise.all([
      prisma.credentialSchema.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          templates: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              credentials: true,
              templates: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.credentialSchema.count({ where })
    ])

    return NextResponse.json({
      schemas: schemas.map(schema => ({
        id: schema.id,
        name: schema.name,
        description: schema.description,
        type: schema.type,
        version: schema.version,
        status: schema.status,
        author: schema.author,
        credentialCount: schema._count.credentials,
        templateCount: schema._count.templates,
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching schemas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/schemas - Create a new credential schema
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      type,
      version = '1.0.0',
      schema,
      context = ['https://www.w3.org/2018/credentials/v1']
    } = body

    if (!name || !description || !type || !schema) {
      return NextResponse.json(
        { error: 'name, description, type, and schema are required' },
        { status: 400 }
      )
    }

    // Validate schema format
    if (typeof schema !== 'object' || !schema.type || !schema.properties) {
      return NextResponse.json(
        { error: 'Invalid schema format. Must be a valid JSON Schema.' },
        { status: 400 }
      )
    }

    // Check if schema with same name and version exists
    const existingSchema = await prisma.credentialSchema.findFirst({
      where: {
        name,
        version,
        authorId: user.id
      }
    })

    if (existingSchema) {
      return NextResponse.json(
        { error: 'Schema with this name and version already exists' },
        { status: 409 }
      )
    }

    const credentialSchema = await prisma.credentialSchema.create({
      data: {
        name,
        description,
        type,
        version,
        schema,
        context,
        authorId: user.id,
        status: 'DRAFT'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Schema created successfully',
      schema: {
        id: credentialSchema.id,
        name: credentialSchema.name,
        description: credentialSchema.description,
        type: credentialSchema.type,
        version: credentialSchema.version,
        status: credentialSchema.status,
        author: credentialSchema.author,
        createdAt: credentialSchema.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating schema:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}