import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/verification/policies/[id]
 * Get a specific verification policy by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const verificationPolicy = await prisma.verificationPolicy.findUnique({
      where: { id }
    })

    if (!verificationPolicy) {
      return NextResponse.json(
        { success: false, error: 'Verification policy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: verificationPolicy
    })
  } catch (error) {
    console.error('Error fetching verification policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification policy' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/verification/policies/[id]
 * Update a verification policy
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      credentialTypes,
      requiredAttributes,
      validityPeriod,
      autoApprove,
      requireManualReview,
      status
    } = body

    // Check if verification policy exists
    const existingPolicy = await prisma.verificationPolicy.findUnique({
      where: { id }
    })

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Verification policy not found' },
        { status: 404 }
      )
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be active or inactive' },
        { status: 400 }
      )
    }

    // Validate validity period if provided
    if (validityPeriod !== undefined) {
      const validityDays = parseInt(validityPeriod)
      if (isNaN(validityDays) || validityDays <= 0) {
        return NextResponse.json(
          { success: false, error: 'validityPeriod must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Check if policy with same name already exists (excluding current policy)
    if (name && name !== existingPolicy.name) {
      const duplicatePolicy = await prisma.verificationPolicy.findFirst({
        where: {
          name,
          id: { not: id }
        }
      })

      if (duplicatePolicy) {
        return NextResponse.json(
          { success: false, error: 'A policy with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (credentialTypes !== undefined) updateData.credentialTypes = credentialTypes
    if (requiredAttributes !== undefined) updateData.requiredAttributes = requiredAttributes
    if (validityPeriod !== undefined) updateData.validityPeriod = parseInt(validityPeriod)
    if (autoApprove !== undefined) updateData.autoApprove = autoApprove
    if (requireManualReview !== undefined) updateData.requireManualReview = requireManualReview
    if (status !== undefined) updateData.status = status

    // Update verification policy
    const updatedPolicy = await prisma.verificationPolicy.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedPolicy
    })
  } catch (error) {
    console.error('Error updating verification policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update verification policy' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/verification/policies/[id]
 * Delete a verification policy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if verification policy exists
    const existingPolicy = await prisma.verificationPolicy.findUnique({
      where: { id }
    })

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Verification policy not found' },
        { status: 404 }
      )
    }

    // Note: Since there's no direct relation in schema, we'll allow deletion
    // In a production environment, you might want to add proper relations

    // Delete verification policy
    await prisma.verificationPolicy.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Verification policy deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting verification policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete verification policy' },
      { status: 500 }
    )
  }
}