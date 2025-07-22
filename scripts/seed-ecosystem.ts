import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEcosystem() {
  console.log('🌱 Seeding ecosystem data...')

  try {
    // Create sample partners
    const partners = await Promise.all([
      prisma.partner.upsert({
        where: { email: 'contact@techcorp.com' },
        update: {},
        create: {
          name: 'TechCorp Solutions',
          type: 'Technology',
          email: 'contact@techcorp.com',
          website: 'https://techcorp.com',
          description: 'Leading technology solutions provider specializing in digital identity and blockchain infrastructure.',
          status: 'connected',
          credentialsExchanged: 150,
          lastActivity: new Date()
        }
      }),
      prisma.partner.upsert({
        where: { email: 'info@eduinstitute.edu' },
        update: {},
        create: {
          name: 'Global Education Institute',
          type: 'Education',
          email: 'info@eduinstitute.edu',
          website: 'https://eduinstitute.edu',
          description: 'International education institution focused on digital credentials and lifelong learning.',
          status: 'connected',
          credentialsExchanged: 89,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.partner.upsert({
        where: { email: 'partnerships@healthsys.com' },
        update: {},
        create: {
          name: 'HealthSystem Network',
          type: 'Healthcare',
          email: 'partnerships@healthsys.com',
          website: 'https://healthsys.com',
          description: 'Healthcare network providing secure credential verification for medical professionals.',
          status: 'pending',
          credentialsExchanged: 0,
          lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.partner.upsert({
        where: { email: 'connect@financeplus.com' },
        update: {},
        create: {
          name: 'FinancePlus',
          type: 'Finance',
          email: 'connect@financeplus.com',
          website: 'https://financeplus.com',
          description: 'Financial services company implementing digital identity solutions for secure transactions.',
          status: 'connected',
          credentialsExchanged: 234,
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.partner.upsert({
        where: { email: 'admin@govportal.gov' },
        update: {},
        create: {
          name: 'Government Digital Services',
          type: 'Government',
          email: 'admin@govportal.gov',
          website: 'https://govportal.gov',
          description: 'Government agency digitizing citizen services through verifiable credentials.',
          status: 'disconnected',
          credentialsExchanged: 45,
          lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      })
    ])

    console.log(`✅ Created ${partners.length} partners`)

    // Create sample networks
    const networks = await Promise.all([
      prisma.network.upsert({
        where: { name: 'Global Education Consortium' },
        update: {},
        create: {
          name: 'Global Education Consortium',
          description: 'A worldwide network of educational institutions sharing verified academic credentials.',
          type: 'Public',
          members: 1247,
          isJoined: true
        }
      }),
      prisma.network.upsert({
        where: { name: 'Healthcare Professionals Network' },
        update: {},
        create: {
          name: 'Healthcare Professionals Network',
          description: 'Secure network for healthcare credential verification and professional licensing.',
          type: 'Private',
          members: 892,
          isJoined: false
        }
      }),
      prisma.network.upsert({
        where: { name: 'Financial Services Alliance' },
        update: {},
        create: {
          name: 'Financial Services Alliance',
          description: 'Collaborative network for financial institutions to share KYC and compliance credentials.',
          type: 'Consortium',
          members: 156,
          isJoined: true
        }
      }),
      prisma.network.upsert({
        where: { name: 'Tech Innovation Hub' },
        update: {},
        create: {
          name: 'Tech Innovation Hub',
          description: 'Open network for technology companies to collaborate on digital identity standards.',
          type: 'Public',
          members: 2341,
          isJoined: false
        }
      }),
      prisma.network.upsert({
        where: { name: 'Government Interoperability Network' },
        update: {},
        create: {
          name: 'Government Interoperability Network',
          description: 'Secure government network for cross-agency credential verification and citizen services.',
          type: 'Government',
          members: 78,
          isJoined: false
        }
      })
    ])

    console.log(`✅ Created ${networks.length} networks`)

    // Create partner connections
    const connections = await Promise.all([
      prisma.partnerConnection.upsert({
        where: { id: 'conn-1' },
        update: {},
        create: {
          id: 'conn-1',
          partnerId: partners[0].id,
          status: 'approved',
          requestedBy: 'admin@example.com',
          approvedBy: 'admin@example.com',
          approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          notes: 'Initial partnership established for technology integration'
        }
      }),
      prisma.partnerConnection.upsert({
        where: { id: 'conn-2' },
        update: {},
        create: {
          id: 'conn-2',
          partnerId: partners[1].id,
          status: 'approved',
          requestedBy: 'admin@example.com',
          approvedBy: 'admin@example.com',
          approvedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          notes: 'Educational partnership for academic credential verification'
        }
      }),
      prisma.partnerConnection.upsert({
        where: { id: 'conn-3' },
        update: {},
        create: {
          id: 'conn-3',
          partnerId: partners[2].id,
          status: 'pending',
          requestedBy: 'partnerships@healthsys.com',
          notes: 'Healthcare partnership request for medical credential verification'
        }
      }),
      prisma.partnerConnection.upsert({
        where: { id: 'conn-4' },
        update: {},
        create: {
          id: 'conn-4',
          partnerId: partners[3].id,
          status: 'approved',
          requestedBy: 'admin@example.com',
          approvedBy: 'admin@example.com',
          approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          notes: 'Financial services partnership for secure transaction verification'
        }
      }),
      prisma.partnerConnection.upsert({
        where: { id: 'conn-5' },
        update: {},
        create: {
          id: 'conn-5',
          partnerId: partners[4].id,
          status: 'rejected',
          requestedBy: 'admin@govportal.gov',
          rejectedBy: 'admin@example.com',
          rejectedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          notes: 'Partnership request rejected due to compliance requirements not met'
        }
      })
    ])

    console.log(`✅ Created ${connections.length} partner connections`)

    // Create or update ecosystem stats
    const totalPartners = await prisma.partner.count()
    const activeConnections = await prisma.partner.count({ where: { status: 'connected' } })
    const credentialExchanges = await prisma.partner.aggregate({ _sum: { credentialsExchanged: true } })
    const verificationRequests = await prisma.verificationRequest.count()

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

    console.log('✅ Updated ecosystem stats:', stats)

    console.log('🎉 Ecosystem seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding ecosystem:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedEcosystem()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedEcosystem