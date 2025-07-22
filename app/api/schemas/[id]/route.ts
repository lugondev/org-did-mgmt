import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/schemas/[id] - Get a specific credential schema
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Schema ID is required' }, { status: 400 })
    }

    const schema = await prisma.credentialSchema.findUnique({
      where: { id },
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
            name: true,
            description: true,
            status: true,
            createdAt: true
          }
        },
        credentials: {
          select: {
            id: true,
            type: true,
            issuer: true,
            issuedAt: true,
            expiresAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            credentials: true,
            templates: true
          }
        }
      }
    })
    
    if (!schema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 })
    }

    return NextResponse.json({
      schema: {
        id: schema.id,
        name: schema.name,
        description: schema.description,
        type: schema.type,
        version: schema.version,
        status: schema.status,
        schema: schema.schema,
        context: schema.context,
        author: schema.author,
        templates: schema.templates,
        recentCredentials: schema.credentials,
        stats: {
          totalCredentials: schema._count.credentials,
          totalTemplates: schema._count.templates
        },
        createdAt: schema.createdAt,
        updatedAt: schema.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching schema:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/schemas/[id] - Update a credential schema
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const {
      name,
      description,
      type,
      version,
      schema: schemaData,
      context,
      status
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Schema ID is required' }, { status: 400 })
    }

    // Check if schema exists and user has permission
    const existingSchema = await prisma.credentialSchema.findUnique({
      where: { id }
    })

    if (!existingSchema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 })
    }

    if (existingSchema.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate schema format if provided
    if (schemaData && (typeof schemaData !== 'object' || !schemaData.type || !schemaData.properties)) {
      return NextResponse.json(
        { error: 'Invalid schema format. Must be a valid JSON Schema.' },
        { status: 400 }
      )
    }

    // Check if trying to change version to existing one
    if (version && version !== existingSchema.version) {
      const duplicateSchema = await prisma.credentialSchema.findFirst({
        where: {
          name: name || existingSchema.name,
          version,
          authorId: user.id,
          id: { not: id }
        }
      })

      if (duplicateSchema) {
        return NextResponse.json(
          { error: 'Schema with this name and version already exists' },
          { status: 409 }
        )
      }
    }

    const updatedSchema = await prisma.credentialSchema.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(version && { version }),
        ...(schemaData && { schema: schemaData }),
        ...(context && { context }),
        ...(status && { status }),
        updatedAt: new Date()
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
      message: 'Schema updated successfully',
      schema: {
        id: updatedSchema.id,
        name: updatedSchema.name,
        description: updatedSchema.description,
        type: updatedSchema.type,
        version: updatedSchema.version,
        status: updatedSchema.status,
        author: updatedSchema.author,
        updatedAt: updatedSchema.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating schema:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/schemas/[id] - Delete a credential schema
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Schema ID is required' }, { status: 400 })
    }

    // Check if schema exists and user has permission
    const existingSchema = await prisma.credentialSchema.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            credentials: true,
            templates: true
          }
        }
      }
    })

    if (!existingSchema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 })
    }

    if (existingSchema.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if schema is being used
    if (existingSchema._count.credentials > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete schema that has issued credentials. Consider archiving instead.',
          credentialCount: existingSchema._count.credentials
        },
        { status: 409 }
      )
    }

    // Delete associated templates first
    await prisma.credentialTemplate.deleteMany({
      where: { schemaId: id }
    })

    // Delete the schema
    await prisma.credentialSchema.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Schema deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting schema:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}