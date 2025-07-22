import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyPresentation } from '@/lib/did'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submissionId = params.id

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get submission with request details
    const submission = await prisma.presentationSubmission.findUnique({
      where: { id: submissionId },
      include: {
        request: {
          include: {
            requester: true
          }
        },
        submitter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Presentation submission not found' },
        { status: 404 }
      )
    }

    // Check if user owns the presentation request
    if (submission.request.requesterId !== user.id) {
      return NextResponse.json(
        { error: 'You can only verify submissions for your own requests' },
        { status: 403 }
      )
    }

    // Check if already verified
    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission has already been processed' },
        { status: 400 }
      )
    }

    let verificationResult
    let newStatus: 'verified' | 'rejected' = 'rejected'

    try {
      // Verify the presentation
      verificationResult = await verifyPresentation(
        submission.presentation as any
      )

      if (verificationResult.verified) {
        newStatus = 'verified'
      }
    } catch (error) {
      console.error('Error verifying presentation:', error)
      verificationResult = {
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }
    }

    // Update submission with verification result
    const updatedSubmission = await prisma.presentationSubmission.update({
      where: { id: submissionId },
      data: {
        status: newStatus,
        verifiedAt: new Date(),
        verificationResult: verificationResult
      },
      include: {
        submitter: {
          select: {
            name: true,
            email: true
          }
        },
        request: {
          select: {
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Presentation ${newStatus.toLowerCase()} successfully`,
      submission: updatedSubmission,
      verificationResult
    })
  } catch (error) {
    console.error('Error verifying presentation submission:', error)
    return NextResponse.json(
      { error: 'Failed to verify presentation submission' },
      { status: 500 }
    )
  }
}