import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/partners/[id]
 * Get a specific partner by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        connections: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: partner
    })
  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/ecosystem/partners/[id]
 * Update partner information or connection status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, name, type, email, website, description, credentialsExchanged } = body

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id }
    })

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (email !== undefined) updateData.email = email
    if (website !== undefined) updateData.website = website
    if (description !== undefined) updateData.description = description
    if (credentialsExchanged !== undefined) updateData.credentialsExchanged = credentialsExchanged
    
    // Handle status change
    if (status !== undefined) {
      updateData.status = status
      if (status === 'connected') {
        updateData.lastActivity = new Date()
      }
    }

    // Update partner
    const updatedPartner = await prisma.partner.update({
      where: { id },
      data: updateData,
      include: {
        connections: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // If status changed, create a connection record
    if (status !== undefined && status !== existingPartner.status) {
      await prisma.partnerConnection.create({
        data: {
          partnerId: id,
          status: status === 'connected' ? 'approved' : status === 'disconnected' ? 'rejected' : 'pending',
          approvedBy: status === 'connected' ? 'admin@example.com' : undefined, // In real app, get from auth context
          notes: `Status changed to ${status}`
        }
      })
    }

    // Update ecosystem stats
    await updateEcosystemStats()

    return NextResponse.json({
      success: true,
      data: updatedPartner
    })
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ecosystem/partners/[id]
 * Delete a partner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id }
    })

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Delete partner (connections will be deleted due to cascade)
    await prisma.partner.delete({
      where: { id }
    })

    // Update ecosystem stats
    await updateEcosystemStats()

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
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