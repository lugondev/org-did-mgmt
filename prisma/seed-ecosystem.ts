import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed database with sample data including ecosystem data
 */
async function main() {
  console.log('🌱 Seeding database with complete data...')

  try {
    // Create sample users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
          email: 'john.doe@example.com',
          name: 'John Doe'
        }
      }),
      prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
          email: 'jane.smith@example.com',
          name: 'Jane Smith'
        }
      }),
      prisma.user.upsert({
        where: { email: 'mike.wilson@example.com' },
        update: {},
        create: {
          email: 'mike.wilson@example.com',
          name: 'Mike Wilson'
        }
      })
    ])

    console.log('✅ Created users:', users.length)

    // Create sample credentials
    const credentials = await Promise.all([
      prisma.credential.upsert({
        where: { id: 'cred_education_001' },
        update: {},
        create: {
          id: 'cred_education_001',
          type: 'Education Certificate',
          issuer: 'University of Technology',
          issuedAt: new Date('2023-06-15'),
          expiresAt: new Date('2028-06-15'),
          credentialSubject: {
            degree: 'Bachelor of Computer Science',
            gpa: '3.8',
            graduationYear: '2023'
          },
          data: {
            degree: 'Bachelor of Computer Science',
            gpa: '3.8',
            graduationYear: '2023'
          }
        }
      }),
      prisma.credential.upsert({
        where: { id: 'cred_professional_001' },
        update: {},
        create: {
          id: 'cred_professional_001',
          type: 'Professional License',
          issuer: 'Professional Licensing Board',
          issuedAt: new Date('2023-03-20'),
          expiresAt: new Date('2025-03-20'),
          credentialSubject: {
            licenseNumber: 'PL-2023-001',
            profession: 'Software Engineer',
            level: 'Senior'
          },
          data: {
            licenseNumber: 'PL-2023-001',
            profession: 'Software Engineer',
            level: 'Senior'
          }
        }
      }),
      prisma.credential.upsert({
        where: { id: 'cred_employment_001' },
        update: {},
        create: {
          id: 'cred_employment_001',
          type: 'Employment Verification',
          issuer: 'Tech Corp Inc.',
          issuedAt: new Date('2023-01-10'),
          credentialSubject: {
            position: 'Senior Developer',
            department: 'Engineering',
            startDate: '2022-01-15',
            endDate: '2023-12-31'
          },
          data: {
            position: 'Senior Developer',
            department: 'Engineering',
            startDate: '2020-01-15',
            endDate: '2023-12-31'
          }
        }
      })
    ])

    console.log('✅ Created credentials:', credentials.length)

    // Create sample verification policies
    const policies = await Promise.all([
      prisma.verificationPolicy.upsert({
        where: { name: 'Education Verification Standard' },
        update: {},
        create: {
          name: 'Education Verification Standard',
          description: 'Standard policy for verifying educational credentials',
          credentialTypes: ['Education Certificate', 'Diploma', 'Degree'],
          requiredAttributes: ['degree', 'institution', 'graduationYear'],
          validityPeriod: 1825, // 5 years
          autoApprove: false,
          requireManualReview: true,
          status: 'active'
        }
      }),
      prisma.verificationPolicy.upsert({
        where: { name: 'Professional License Verification' },
        update: {},
        create: {
          name: 'Professional License Verification',
          description: 'Policy for verifying professional licenses and certifications',
          credentialTypes: ['Professional License', 'Certification'],
          requiredAttributes: ['licenseNumber', 'profession', 'issuingAuthority'],
          validityPeriod: 730, // 2 years
          autoApprove: true,
          requireManualReview: false,
          status: 'active'
        }
      }),
      prisma.verificationPolicy.upsert({
        where: { name: 'Employment Verification Policy' },
        update: {},
        create: {
          name: 'Employment Verification Policy',
          description: 'Policy for verifying employment history and experience',
          credentialTypes: ['Employment Verification', 'Work Experience'],
          requiredAttributes: ['position', 'company', 'startDate', 'endDate'],
          validityPeriod: 365, // 1 year
          autoApprove: false,
          requireManualReview: true,
          status: 'active'
        }
      }),
      prisma.verificationPolicy.upsert({
        where: { name: 'Quick Verification Policy' },
        update: {},
        create: {
          name: 'Quick Verification Policy',
          description: 'Fast-track policy for low-risk verifications',
          credentialTypes: ['Basic Certificate', 'Training Certificate'],
          requiredAttributes: ['certificateName', 'issuer'],
          validityPeriod: 180, // 6 months
          autoApprove: true,
          requireManualReview: false,
          status: 'active'
        }
      })
    ])

    console.log('✅ Created verification policies:', policies.length)

    // Create sample verification requests
    const verificationRequests = await Promise.all([
      prisma.verificationRequest.upsert({
        where: { id: 'vr_001' },
        update: {},
        create: {
          id: 'vr_001',
          requesterId: users[0].id,
          credentialId: credentials[0].id,
          status: 'pending',
          reviewNotes: 'Initial verification request for education credential'
        }
      }),
      prisma.verificationRequest.upsert({
        where: { id: 'vr_002' },
        update: {},
        create: {
          id: 'vr_002',
          requesterId: users[1].id,
          credentialId: credentials[1].id,
          status: 'approved',
          reviewNotes: 'Professional license verified successfully',
          reviewerId: 'admin@example.com',
          reviewedAt: new Date()
        }
      }),
      prisma.verificationRequest.upsert({
        where: { id: 'vr_003' },
        update: {},
        create: {
          id: 'vr_003',
          requesterId: users[2].id,
          credentialId: credentials[2].id,
          status: 'rejected',
          reviewNotes: 'Employment verification failed - insufficient documentation',
          reviewerId: 'admin@example.com',
          reviewedAt: new Date()
        }
      }),
      prisma.verificationRequest.upsert({
        where: { id: 'vr_004' },
        update: {},
        create: {
          id: 'vr_004',
          requesterId: users[0].id,
          credentialId: credentials[1].id,
          status: 'pending',
          reviewNotes: 'Additional verification request'
        }
      })
    ])

    console.log('✅ Created verification requests:', verificationRequests.length)

    // Create sample credential requests
    const sampleRequests = [
      {
        fullName: 'Nguyễn Văn An',
        email: 'nguyen.van.an@example.com',
        phone: '+84901234567',
        dateOfBirth: new Date('1990-05-15'),
        address: '123 Đường ABC, Quận 1, TP.HCM',
        credentialType: 'education',
        organizationName: 'Đại học Bách Khoa TP.HCM',
        purpose: 'Xác thực bằng cấp để xin việc',
        additionalInfo: 'Tốt nghiệp loại Giỏi ngành Công nghệ Thông tin',
        status: 'pending'
      },
      {
        fullName: 'Trần Thị Bình',
        email: 'tran.thi.binh@example.com',
        phone: '+84907654321',
        credentialType: 'professional',
        organizationName: 'Hiệp hội Kế toán Việt Nam',
        purpose: 'Xác thực chứng chỉ kế toán',
        additionalInfo: 'Chứng chỉ kế toán trưởng cấp quốc gia',
        status: 'approved',
        adminNotes: 'Đã xác thực thành công. Chứng chỉ hợp lệ.'
      },
      {
        fullName: 'Lê Minh Cường',
        email: 'le.minh.cuong@example.com',
        phone: '+84912345678',
        credentialType: 'employment',
        organizationName: 'Công ty TNHH ABC',
        purpose: 'Xác thực kinh nghiệm làm việc',
        additionalInfo: 'Làm việc tại vị trí Senior Developer từ 2020-2023',
        status: 'rejected',
        adminNotes: 'Không đủ tài liệu chứng minh. Vui lòng bổ sung.'
      }
    ]

    for (const request of sampleRequests) {
      const created = await prisma.credentialRequest.create({
        data: request
      })
      console.log(`✅ Created request: ${created.fullName} (${created.id})`)
    }

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
    const totalVerificationRequests = await prisma.verificationRequest.count()

    const stats = await prisma.ecosystemStats.upsert({
      where: { id: 'main' },
      update: {
        totalPartners,
        activeConnections,
        credentialExchanges: credentialExchanges._sum.credentialsExchanged || 0,
        verificationRequests: totalVerificationRequests,
        updatedAt: new Date()
      },
      create: {
        id: 'main',
        totalPartners,
        activeConnections,
        credentialExchanges: credentialExchanges._sum.credentialsExchanged || 0,
        verificationRequests: totalVerificationRequests,
        updatedAt: new Date()
      }
    })

    console.log('✅ Updated ecosystem stats:', stats)

    console.log('🎉 Complete seeding finished successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

export default main