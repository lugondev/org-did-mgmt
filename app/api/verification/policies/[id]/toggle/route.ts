import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TogglePolicyRequest {
  isActive: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: TogglePolicyRequest = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value' },
        { status: 400 }
      )
    }

    // Check if policy exists
    const existingPolicy = await prisma.verificationPolicy.findUnique({
      where: { id: params.id }
    })

    if (!existingPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      )
    }

    const updatedPolicy = await prisma.verificationPolicy.update({
      where: { id: params.id },
      data: {
        status: isActive ? 'active' : 'inactive'
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedPolicy,
      message: `Policy ${isActive ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Error toggling policy status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update policy status' },
      { status: 500 }
    )
  }
}