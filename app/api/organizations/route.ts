import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema validation
const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  type: z.enum(['Enterprise', 'Business', 'Startup', 'Non-profit', 'Educational']).default('Business'),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['Enterprise', 'Business', 'Startup', 'Non-profit', 'Educational']).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  settings: z.any().optional(),
});

// GET /api/organizations - Get user's organizations
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    
    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: userId,
            status: 'active'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            apiKeys: true,
            activityLogs: true
          }
        }
      }
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    
    const body = await request.json();
    const validatedData = createOrganizationSchema.parse(body);

    // Create organization with the user as owner
    const organization = await prisma.organization.create({
      data: {
        ...validatedData,
        members: {
          create: {
            userId: userId,
            role: 'owner',
            permissions: ['*'], // Full permissions for owner
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: organization.id,
        userId: userId,
        action: 'organization.created',
        resource: 'organization',
        resourceId: organization.id,
        details: {
          organizationName: organization.name
        }
      }
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations - Update organization
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const organizationId = request.nextUrl.searchParams.get('id');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Check if user has permission to update organization
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
    const validatedData = updateOrganizationSchema.parse(body);

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: validatedData,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        organizationId: organization.id,
        userId: userId,
        action: 'organization.updated',
        resource: 'organization',
        resourceId: organization.id,
        details: {
          updatedFields: Object.keys(validatedData)
        }
      }
    });

    return NextResponse.json({ organization });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}