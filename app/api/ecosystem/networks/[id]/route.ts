import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/networks/[id]
 * Get a specific network by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const network = await prisma.network.findUnique({
      where: { id }
    })

    if (!network) {
      return NextResponse.json(
        { success: false, error: 'Network not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: network
    })
  } catch (error) {
    console.error('Error fetching network:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch network' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/ecosystem/networks/[id]
 * Update network information or join/leave network
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, type, members, isJoined, action } = body

    // Check if network exists
    const existingNetwork = await prisma.network.findUnique({
      where: { id }
    })

    if (!existingNetwork) {
      return NextResponse.json(
        { success: false, error: 'Network not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (members !== undefined) updateData.members = members
    if (isJoined !== undefined) updateData.isJoined = isJoined

    // Handle join/leave actions
    if (action === 'join') {
      updateData.isJoined = true
      updateData.members = existingNetwork.members + 1
    } else if (action === 'leave') {
      updateData.isJoined = false
      updateData.members = Math.max(0, existingNetwork.members - 1)
    }

    // Update network
    const updatedNetwork = await prisma.network.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedNetwork
    })
  } catch (error) {
    console.error('Error updating network:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update network' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ecosystem/networks/[id]
 * Delete a network
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if network exists
    const existingNetwork = await prisma.network.findUnique({
      where: { id }
    })

    if (!existingNetwork) {
      return NextResponse.json(
        { success: false, error: 'Network not found' },
        { status: 404 }
      )
    }

    // Delete network
    await prisma.network.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Network deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting network:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete network' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ecosystem/networks/[id]/join
 * Join a specific network
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if network exists
    const existingNetwork = await prisma.network.findUnique({
      where: { id }
    })

    if (!existingNetwork) {
      return NextResponse.json(
        { success: false, error: 'Network not found' },
        { status: 404 }
      )
    }

    if (existingNetwork.isJoined) {
      return NextResponse.json(
        { success: false, error: 'Already joined this network' },
        { status: 400 }
      )
    }

    // Join network
    const updatedNetwork = await prisma.network.update({
      where: { id },
      data: {
        isJoined: true,
        members: existingNetwork.members + 1,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedNetwork,
      message: 'Successfully joined network'
    })
  } catch (error) {
    console.error('Error joining network:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join network' },
      { status: 500 }
    )
  }
}