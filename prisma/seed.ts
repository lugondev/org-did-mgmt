import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed database with sample data
 */
async function main() {
  console.log('🌱 Seeding database...')

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

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })