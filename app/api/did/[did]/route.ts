import { NextRequest, NextResponse } from 'next/server'
import { resolveDIDDocument } from '@/lib/did'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/did/[did] - Resolve a specific DID document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  try {
    const { did } = params
    
    if (!did) {
      return NextResponse.json({ error: 'DID parameter is required' }, { status: 400 })
    }

    // Decode the DID (it might be URL encoded)
    const decodedDID = decodeURIComponent(did)
    
    // Resolve the DID document
    const document = await resolveDIDDocument(decodedDID)
    
    if (!document) {
      return NextResponse.json({ error: 'DID document not found' }, { status: 404 })
    }

    return NextResponse.json({
      document,
      resolved: true,
      resolvedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resolving DID document:', error)
    return NextResponse.json(
      { 
        error: 'Failed to resolve DID document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/did/[did] - Update DID document status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  try {
    const { did } = params
    const body = await request.json()
    const { status } = body
    
    if (!did) {
      return NextResponse.json({ error: 'DID parameter is required' }, { status: 400 })
    }

    if (!status || !['ACTIVE', 'REVOKED', 'DEACTIVATED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (ACTIVE, REVOKED, DEACTIVATED)' },
        { status: 400 }
      )
    }

    const decodedDID = decodeURIComponent(did)
    
    const updatedDocument = await prisma.dIDDocument.update({
      where: { did: decodedDID },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        keys: true
      }
    })

    return NextResponse.json({
      message: 'DID document status updated successfully',
      didDocument: {
        id: updatedDocument.id,
        did: updatedDocument.did,
        status: updatedDocument.status,
        updatedAt: updatedDocument.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating DID document:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'DID document not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/did/[did] - Deactivate a DID document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { did: string } }
) {
  try {
    const { did } = params
    
    if (!did) {
      return NextResponse.json({ error: 'DID parameter is required' }, { status: 400 })
    }

    const decodedDID = decodeURIComponent(did)
    
    // Instead of deleting, we deactivate the DID
    const deactivatedDocument = await prisma.dIDDocument.update({
      where: { did: decodedDID },
      data: { 
        status: 'DEACTIVATED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'DID document deactivated successfully',
      didDocument: {
        id: deactivatedDocument.id,
        did: deactivatedDocument.did,
        status: deactivatedDocument.status,
        updatedAt: deactivatedDocument.updatedAt
      }
    })
  } catch (error) {
    console.error('Error deactivating DID document:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'DID document not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}