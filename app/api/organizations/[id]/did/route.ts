import { NextRequest, NextResponse } from 'next/server'
import { createDIDDocument } from '@/lib/did'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/organizations/[id]/did - Create DID for organization
 */
export async function POST(
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

    // Check if user is member of organization with admin/owner role
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.id,
        userId: user.id,
        role: { in: ['owner', 'admin'] }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check if organization already has a DID
    const organization = await prisma.organization.findUnique({
      where: { id: params.id }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (organization.did) {
      return NextResponse.json(
        { error: 'Organization already has a DID' },
        { status: 400 }
      )
    }

    // Create DID document for organization
    const { didDocument } = await createDIDDocument(user.id)

    // Update organization with DID
    const updatedOrg = await prisma.organization.update({
      where: { id: params.id },
      data: { did: didDocument.did }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: params.id,
        userId: user.id,
        action: 'create_organization_did',
        resource: 'organization',
        resourceId: params.id,
        details: {
          did: didDocument.did,
          method: didDocument.method
        },
        status: 'success'
      }
    })

    return NextResponse.json({
      message: 'Organization DID created successfully',
      organization: updatedOrg,
      didDocument: {
        id: didDocument.id,
        did: didDocument.did,
        method: didDocument.method,
        status: didDocument.status
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating organization DID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/organizations/[id]/did - Get organization DID information
 */
export async function GET(
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

    // Check if user is member of organization
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: params.id,
        userId: user.id
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.id }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (!organization.did) {
      return NextResponse.json({
        hasDID: false,
        message: 'Organization does not have a DID'
      })
    }

    // Get DID document details
    const didDocument = await prisma.dIDDocument.findUnique({
      where: { did: organization.did },
      include: {
        keys: true,
        _count: {
          select: {
            issuedCredentials: true
          }
        }
      }
    })

    if (!didDocument) {
      return NextResponse.json(
        { error: 'DID document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      hasDID: true,
      organization: {
        id: organization.id,
        name: organization.name,
        did: organization.did
      },
      didDocument: {
        id: didDocument.id,
        did: didDocument.did,
        method: didDocument.method,
        controller: didDocument.controller,
        status: didDocument.status,
        createdAt: didDocument.createdAt,
        updatedAt: didDocument.updatedAt,
        keyCount: didDocument.keys.length,
        issuedCredentials: didDocument._count.issuedCredentials
      }
    })
  } catch (error) {
    console.error('Error fetching organization DID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}