import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema validation
const activityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  action: z.string().optional(),
  resource: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// GET /api/organizations/[id]/activity - Get organization activity logs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: 'active'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const validatedQuery = activityQuerySchema.parse(queryParams);

    const { page, limit, action, resource, userId: filterUserId, startDate, endDate } = validatedQuery;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      organizationId,
    };

    if (action) {
      whereClause.action = {
        contains: action,
        mode: 'insensitive'
      };
    }

    if (resource) {
      whereClause.resource = resource;
    }

    if (filterUserId) {
      whereClause.userId = filterUserId;
    }

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp.lte = new Date(endDate);
      }
    }

    // Get activity logs with pagination
    const [activityLogs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.activityLog.count({
        where: whereClause
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      activityLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error fetching organization activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/activity - Create activity log entry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: 'active'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, resource, resourceId, details, status = 'success' } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        organizationId,
        userId,
        action,
        resource,
        resourceId,
        details,
        status,
        ipAddress,
        userAgent
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ activityLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}

// GET /api/organizations/[id]/activity/stats - Get activity statistics
export async function GET_STATS(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id;
    const userId = request.headers.get('x-user-id') || 'temp-user-id';

    // Check if user has access to this organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
        status: 'active'
      }
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalActivities, last24HoursCount, last7DaysCount, last30DaysCount, topActions, topUsers] = await Promise.all([
      // Total activities
      prisma.activityLog.count({
        where: { organizationId }
      }),
      
      // Last 24 hours
      prisma.activityLog.count({
        where: {
          organizationId,
          timestamp: { gte: last24Hours }
        }
      }),
      
      // Last 7 days
      prisma.activityLog.count({
        where: {
          organizationId,
          timestamp: { gte: last7Days }
        }
      }),
      
      // Last 30 days
      prisma.activityLog.count({
        where: {
          organizationId,
          timestamp: { gte: last30Days }
        }
      }),
      
      // Top actions (last 30 days)
      prisma.activityLog.groupBy({
        by: ['action'],
        where: {
          organizationId,
          timestamp: { gte: last30Days }
        },
        _count: {
          action: true
        },
        orderBy: {
          _count: {
            action: 'desc'
          }
        },
        take: 10
      }),
      
      // Top users (last 30 days)
      prisma.activityLog.groupBy({
        by: ['userId'],
        where: {
          organizationId,
          timestamp: { gte: last30Days },
          userId: { not: null }
        },
        _count: {
          userId: true
        },
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Get user details for top users
    const userIds = topUsers.map(u => u.userId).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const topUsersWithDetails = topUsers.map(userStat => {
      const user = users.find(u => u.id === userStat.userId);
      return {
        user,
        count: userStat._count.userId
      };
    });

    return NextResponse.json({
      stats: {
        totalActivities,
        last24Hours: last24HoursCount,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        topActions: topActions.map(action => ({
          action: action.action,
          count: action._count.action
        })),
        topUsers: topUsersWithDetails
      }
    });
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity statistics' },
      { status: 500 }
    );
  }
}