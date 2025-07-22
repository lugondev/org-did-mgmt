import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/connections/[id]
 * Get a specific connection by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const connection = await prisma.partnerConnection.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
            email: true,
            website: true,
            description: true,
            status: true,
            credentialsExchanged: true,
            lastActivity: true
          }
        }
      }
    })

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: connection
    })
  } catch (error) {
    console.error('Error fetching connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connection' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/ecosystem/connections/[id]
 * Update connection status (approve/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, approvedBy, rejectedBy, notes } = body

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    // Check if connection exists
    const existingConnection = await prisma.partnerConnection.findUnique({
      where: { id },
      include: { partner: true }
    })

    if (!existingConnection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (notes !== undefined) updateData.notes = notes

    if (status === 'approved') {
      updateData.approvedBy = approvedBy || 'admin@example.com' // In real app, get from auth context
      updateData.approvedAt = new Date()
    } else if (status === 'rejected') {
      updateData.rejectedBy = rejectedBy || 'admin@example.com' // In real app, get from auth context
      updateData.rejectedAt = new Date()
    }

    // Update connection
    const updatedConnection = await prisma.partnerConnection.update({
      where: { id },
      data: updateData,
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

    // Update partner status based on connection status
    if (status === 'approved') {
      await prisma.partner.update({
        where: { id: existingConnection.partnerId },
        data: {
          status: 'connected',
          lastActivity: new Date()
        }
      })
    } else if (status === 'rejected') {
      await prisma.partner.update({
        where: { id: existingConnection.partnerId },
        data: {
          status: 'disconnected'
        }
      })
    }

    // Update ecosystem stats
    await updateEcosystemStats()

    return NextResponse.json({
      success: true,
      data: updatedConnection
    })
  } catch (error) {
    console.error('Error updating connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update connection' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ecosystem/connections/[id]
 * Delete a connection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if connection exists
    const existingConnection = await prisma.partnerConnection.findUnique({
      where: { id }
    })

    if (!existingConnection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Delete connection
    await prisma.partnerConnection.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Connection deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete connection' },
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