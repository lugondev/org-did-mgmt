import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/ecosystem/stats
 * Get ecosystem statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get existing stats first
    let stats = await prisma.ecosystemStats.findUnique({
      where: { id: 'main' }
    })

    // If no stats exist, calculate and create them
    if (!stats) {
      const [totalPartners, activeConnections, credentialExchanges, verificationRequests] = await Promise.all([
        prisma.partner.count(),
        prisma.partner.count({ where: { status: 'connected' } }),
        prisma.partner.aggregate({ _sum: { credentialsExchanged: true } }),
        prisma.verificationRequest.count()
      ])

      stats = await prisma.ecosystemStats.create({
        data: {
          id: 'main',
          totalPartners,
          activeConnections,
          credentialExchanges: credentialExchanges._sum.credentialsExchanged || 0,
          verificationRequests,
          updatedAt: new Date()
        }
      })
    }

    // Calculate additional metrics
    const [recentPartners, recentConnections, networkCount] = await Promise.all([
      prisma.partner.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.partnerConnection.count({
        where: {
          status: 'approved',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.network.count()
    ])

    // Calculate growth rates (simplified)
    const growthRate = recentPartners > 0 ? ((recentPartners / Math.max(stats.totalPartners - recentPartners, 1)) * 100) : 0
    const connectionRate = stats.totalPartners > 0 ? ((stats.activeConnections / stats.totalPartners) * 100) : 0

    const enhancedStats = {
      ...stats,
      recentPartners,
      recentConnections,
      networkCount,
      growthRate: Math.round(growthRate * 100) / 100,
      connectionRate: Math.round(connectionRate * 100) / 100,
      averageCredentialsPerPartner: stats.totalPartners > 0 ? Math.round((stats.credentialExchanges / stats.totalPartners) * 100) / 100 : 0
    }

    return NextResponse.json({
      success: true,
      data: enhancedStats
    })
  } catch (error) {
    console.error('Error fetching ecosystem stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ecosystem stats' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ecosystem/stats/refresh
 * Manually refresh ecosystem statistics
 */
export async function POST(request: NextRequest) {
  try {
    const [totalPartners, activeConnections, credentialExchanges, verificationRequests] = await Promise.all([
      prisma.partner.count(),
      prisma.partner.count({ where: { status: 'connected' } }),
      prisma.partner.aggregate({ _sum: { credentialsExchanged: true } }),
      prisma.verificationRequest.count()
    ])

    const stats = await prisma.ecosystemStats.upsert({
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

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Ecosystem stats refreshed successfully'
    })
  } catch (error) {
    console.error('Error refreshing ecosystem stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh ecosystem stats' },
      { status: 500 }
    )
  }
}