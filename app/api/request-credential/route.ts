import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Validation schema for credential request
const credentialRequestSchema = z.object({
  // Personal Information
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  
  // Credential Information
  credentialType: z.enum([
    'education',
    'employment', 
    'professional',
    'identity',
    'skill',
    'membership',
    'other'
  ]),
  organizationName: z.string().min(1, 'Organization name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  additionalInfo: z.string().optional(),
  
  // Supporting Documents (file names and metadata)
  documents: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).optional()
})

interface CredentialRequest {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  fullName: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  credentialType: string
  organizationName: string
  purpose: string
  additionalInfo?: string
  documents?: Array<{
    name: string
    size: number
    type: string
  }>
}

// Database operations using Prisma
// All data is now persisted in PostgreSQL

// Helper function to send email notifications (mock implementation)
async function sendEmailNotification(email: string, subject: string, message: string) {
  // In production, integrate with email service like SendGrid, AWS SES, etc.
  console.log(`📧 Email sent to ${email}:`)
  console.log(`Subject: ${subject}`)
  console.log(`Message: ${message}`)
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * POST /api/request-credential
 * Submit a new credential request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = credentialRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }
    
    const requestData = validationResult.data
    
    // Create new credential request in database
    const newRequest = await prisma.credentialRequest.create({
      data: {
        fullName: validationResult.data.fullName,
        email: validationResult.data.email,
        phone: validationResult.data.phone,
        dateOfBirth: validationResult.data.dateOfBirth ? new Date(validationResult.data.dateOfBirth) : null,
        address: validationResult.data.address,
        credentialType: validationResult.data.credentialType,
        organizationName: validationResult.data.organizationName,
        purpose: validationResult.data.purpose,
        additionalInfo: validationResult.data.additionalInfo,
        status: 'pending',
        documents: {
            create: validationResult.data.documents?.map(doc => ({
              fileName: doc.name,
              fileSize: doc.size,
              fileType: doc.type,
              fileUrl: ''
            })) || []
          }
      },
      include: {
        documents: true
      }
    })
    
    // Send confirmation email (mock)
    try {
      await sendEmailNotification(
        newRequest.email,
        'Credential Request Received',
        `Your credential request has been received and is being processed. Request ID: ${newRequest.id}`
      )
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the request if email fails
    }
    
    // Log the request for monitoring
    console.log('New credential request submitted:', {
      id: newRequest.id,
      email: requestData.email,
      credentialType: requestData.credentialType,
      organizationName: requestData.organizationName
    })
    
    return NextResponse.json(
      {
        success: true,
        message: 'Credential request submitted successfully',
        requestId: newRequest.id,
        status: newRequest.status
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error processing credential request:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process credential request'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/request-credential
 * Retrieve all credential requests with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organizationName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.credentialRequest.count({ where })

    // Get paginated requests
    const requests = await prisma.credentialRequest.findMany({
      where,
      include: {
        documents: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching credential requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credential requests' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/request-credential
 * Update credential request status (for admin/review purposes)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, adminNotes } = body
    
    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      )
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }
    
    // Find and update the request in database
    const existingRequest = await prisma.credentialRequest.findUnique({
      where: { id: requestId },
      include: { documents: true }
    })
    
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Credential request not found' },
        { status: 404 }
      )
    }
    
    // Update the request
     const updatedRequest = await prisma.credentialRequest.update({
       where: { id: requestId },
       data: {
          status,
          adminNotes
        },
       include: {
         documents: true
       }
     })
    
    // Send notification email to user
    try {
      const emailSubject = status === 'approved' 
        ? 'Credential Request Approved' 
        : 'Credential Request Update'
      
      const emailMessage = status === 'approved'
         ? `Your credential request has been approved! Request ID: ${requestId}`
         : `Your credential request has been updated. Status: ${status}. Request ID: ${requestId}${adminNotes ? ` Notes: ${adminNotes}` : ''}`

      await sendEmailNotification(
        updatedRequest.email,
        emailSubject,
        emailMessage
      )
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError)
    }
    
    console.log('Credential request updated:', {
      id: requestId,
      status
    })
    
    return NextResponse.json({
      success: true,
      message: 'Credential request updated successfully',
      data: updatedRequest
    })
    
  } catch (error) {
    console.error('Error updating credential request:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update credential request'
      },
      { status: 500 }
    )
  }
}