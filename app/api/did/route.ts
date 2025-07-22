import { NextRequest, NextResponse } from 'next/server'
import { createDIDDocument, resolveDIDDocument } from '@/lib/did'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/did - Get all DID documents for current user
 */
export async function GET(request: NextRequest) {
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

    const didDocuments = await prisma.dIDDocument.findMany({
      where: { userId: user.id },
      include: {
        keys: true,
        _count: {
          select: {
            issuedCredentials: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      didDocuments: didDocuments.map(doc => ({
        id: doc.id,
        did: doc.did,
        method: doc.method,
        controller: doc.controller,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        keyCount: doc.keys.length,
        issuedCredentials: doc._count.issuedCredentials
      }))
    })
  } catch (error) {
    console.error('Error fetching DID documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/did - Create a new DID document
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

    const { didDocument } = await createDIDDocument(user.id)

    return NextResponse.json({
      message: 'DID document created successfully',
      didDocument: {
        id: didDocument.id,
        did: didDocument.did,
        method: didDocument.method,
        controller: didDocument.controller,
        status: didDocument.status,
        createdAt: didDocument.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating DID document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}