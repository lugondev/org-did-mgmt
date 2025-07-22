import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/verification/requests/[id]
 * Get a specific verification request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        credential: {
          select: {
            id: true,
            type: true,
            issuer: true,
            data: true,
            issuedAt: true,
            expiresAt: true
          }
        },
        requester: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!verificationRequest) {
      return NextResponse.json(
        { success: false, error: 'Verification request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: verificationRequest
    })
  } catch (error) {
    console.error('Error fetching verification request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification request' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/verification/requests/[id]
 * Update verification request status (approve/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, reviewerId, reviewNotes, verificationResult } = body

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be approved, rejected, or pending' },
        { status: 400 }
      )
    }

    // Check if verification request exists
    const existingRequest = await prisma.verificationRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Verification request not found' },
        { status: 404 }
      )
    }

    // Update verification request
    const updatedRequest = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        reviewerId,
        reviewNotes,
        reviewedAt: status !== 'pending' ? new Date() : null
      },
      include: {
        credential: {
          select: {
            type: true,
            issuer: true
          }
        },
        requester: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRequest
    })
  } catch (error) {
    console.error('Error updating verification request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update verification request' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/verification/requests/[id]
 * Delete a verification request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if verification request exists
    const existingRequest = await prisma.verificationRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Verification request not found' },
        { status: 404 }
      )
    }

    // Delete verification request
    await prisma.verificationRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Verification request deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting verification request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete verification request' },
      { status: 500 }
    )
  }
}