import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema validation
const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  email: z.string().email('Valid email is required'),
});

// POST /api/invitations/accept - Accept organization invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = acceptInvitationSchema.parse(body);

    // Find the invitation
    const invitation = await prisma.organizationInvitation.findFirst({
      where: {
        token: validatedData.token,
        email: validatedData.email,
        status: 'pending'
      },
      include: {
        organization: true
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.email.split('@')[0] // Default name from email
        }
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId: user.id
      }
    });

    if (existingMember) {
      // Update invitation status
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date()
        }
      });

      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }

    // Create organization membership
    const member = await prisma.organizationMember.create({
      data: {
        organizationId: invitation.organizationId,
        userId: user.id,
        role: invitation.role,
        permissions: invitation.permissions,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update invitation status
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedAt: new Date()
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: invitation.organizationId,
        userId: user.id,
        action: 'invitation.accepted',
        resource: 'organization_member',
        resourceId: member.id,
        details: {
          memberEmail: user.email,
          role: invitation.role
        }
      }
    });

    return NextResponse.json({
      success: true,
      member,
      organization: member.organization
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error accepting organization invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// GET /api/invitations/accept?token=xxx&email=xxx - Get invitation details
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    const email = request.nextUrl.searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    const invitation = await prisma.organizationInvitation.findFirst({
      where: {
        token,
        email,
        status: 'pending'
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            logo: true
          }
        },
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' }
      });
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
        inviter: invitation.inviter
      }
    });
  } catch (error) {
    console.error('Error fetching invitation details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    );
  }
}