import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Schema validation
const createInvitationSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['owner', 'admin', 'developer', 'analyst', 'viewer', 'member']).default('member'),
  permissions: z.array(z.string()).default([]),
  message: z.string().optional(),
  expiresInDays: z.number().min(1).max(30).default(7),
});

// GET /api/organizations/[id]/invitations - Get organization invitations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const status = request.nextUrl.searchParams.get('status');

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: ['owner', 'admin'] },
        status: 'active'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const whereClause: any = {
      organizationId,
    };

    if (status) {
      whereClause.status = status;
    }

    const invitations = await prisma.organizationInvitation.findMany({
      where: whereClause,
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching organization invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/invitations - Create invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    // Check if user has permission to invite members
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: ['owner', 'admin'] },
        status: 'active'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createInvitationSchema.parse(body);

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      const existingMember = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId: existingUser.id
        }
      });

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this organization' },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId,
        email: validatedData.email,
        status: 'pending'
      }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'There is already a pending invitation for this email' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId,
        email: validatedData.email,
        role: validatedData.role,
        permissions: validatedData.permissions,
        invitedBy: userId,
        message: validatedData.message,
        token,
        expiresAt,
      },
      include: {
        organization: {
          select: {
            name: true
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

    // TODO: Send invitation email
    // await sendInvitationEmail(invitation);

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        userId,
        action: 'invitation.sent',
        resource: 'organization_invitation',
        resourceId: invitation.id,
        details: {
          inviteeEmail: validatedData.email,
          role: validatedData.role
        }
      }
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating organization invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/invitations/[invitationId] - Cancel invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const invitationId = request.nextUrl.searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    // Check if user has permission to cancel invitations
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        role: { in: ['owner', 'admin'] },
        status: 'active'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get invitation details before deletion
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation || invitation.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending invitations' },
        { status: 400 }
      );
    }

    await prisma.organizationInvitation.delete({
      where: { id: invitationId }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId,
        userId,
        action: 'invitation.cancelled',
        resource: 'organization_invitation',
        resourceId: invitationId,
        details: {
          inviteeEmail: invitation.email,
          role: invitation.role
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling organization invitation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}