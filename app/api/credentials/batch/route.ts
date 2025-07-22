import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { issueCredential } from '@/lib/did'

const prisma = new PrismaClient()

interface BatchCredentialRequest {
  schemaId: string
  credentials: {
    recipientDID: string
    credentialSubject: any
    expirationDate?: string
  }[]
}

interface BatchJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total: number
  processed: number
  failed: number
  results: any[]
  errors: any[]
}

// In-memory storage for batch jobs (in production, use Redis or database)
const batchJobs = new Map<string, BatchJob>()

export async function POST(request: NextRequest) {
  try {
    const body: BatchCredentialRequest = await request.json()
    const { schemaId, credentials } = body

    if (!schemaId || !credentials || !Array.isArray(credentials)) {
      return NextResponse.json(
        { error: 'Schema ID and credentials array are required' },
        { status: 400 }
      )
    }

    if (credentials.length === 0) {
      return NextResponse.json(
        { error: 'At least one credential is required' },
        { status: 400 }
      )
    }

    if (credentials.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 credentials per batch' },
        { status: 400 }
      )
    }

    // Validate schema exists
    const schema = await prisma.credentialSchema.findUnique({
      where: { id: schemaId }
    })

    if (!schema) {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: 404 }
      )
    }

    // Create batch job
    const jobId = uuidv4()
    const batchJob: BatchJob = {
      id: jobId,
      status: 'pending',
      total: credentials.length,
      processed: 0,
      failed: 0,
      results: [],
      errors: []
    }

    batchJobs.set(jobId, batchJob)

    // Start processing asynchronously
    processBatchJob(jobId, schemaId, credentials, schema)

    return NextResponse.json({
      jobId,
      status: 'pending',
      total: credentials.length,
      message: 'Batch job created successfully'
    })

  } catch (error) {
    console.error('Batch credential issuance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const batchJob = batchJobs.get(jobId)

    if (!batchJob) {
      return NextResponse.json(
        { error: 'Batch job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(batchJob)

  } catch (error) {
    console.error('Get batch job status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processBatchJob(
  jobId: string,
  schemaId: string,
  credentials: any[],
  schema: any
) {
  const batchJob = batchJobs.get(jobId)
  if (!batchJob) return

  batchJob.status = 'processing'
  batchJobs.set(jobId, batchJob)

  for (let i = 0; i < credentials.length; i++) {
    try {
      const credentialData = credentials[i]
      const { recipientDID, credentialSubject, expirationDate } = credentialData

      // Validate required fields
      if (!recipientDID || !credentialSubject) {
        throw new Error('Recipient DID and credential subject are required')
      }

      // Create credential
      const vcId = `vc:${uuidv4()}`
      const issuanceDate = new Date().toISOString()
      
      const credential = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1'
        ],
        id: vcId,
        type: ['VerifiableCredential', schema.type],
        issuer: 'did:key:example', // Should be dynamic based on user's DID
        issuanceDate,
        ...(expirationDate && { expirationDate }),
        credentialSubject: {
          id: recipientDID,
          ...credentialSubject
        }
      }

      // Sign credential using issueCredential
      const signedCredential = await issueCredential({
        issuerDID: 'did:key:example',
        credentialSubject,
        type: [schema.type],
        expirationDate: expirationDate
      })

      // Save to database
      const savedCredential = await prisma.credential.create({
        data: {
          id: vcId,
          type: schema.type,
          credentialSubject,
          proof: signedCredential.proof || {},
          issuedAt: new Date(issuanceDate),
          expiresAt: expirationDate ? new Date(expirationDate) : null,
          data: signedCredential,
          schemaId
        }
      })

      batchJob.results.push({
        index: i,
        credentialId: savedCredential.id,
        vcId,
        status: 'success'
      })

    } catch (error) {
      console.error(`Error processing credential ${i}:`, error)
      batchJob.errors.push({
        index: i,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      batchJob.failed++
    }

    batchJob.processed++
    batchJobs.set(jobId, batchJob)

    // Add small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  batchJob.status = batchJob.failed === 0 ? 'completed' : 'completed'
  batchJobs.set(jobId, batchJob)
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const batchJob = batchJobs.get(jobId)

    if (!batchJob) {
      return NextResponse.json(
        { error: 'Batch job not found' },
        { status: 404 }
      )
    }

    // Only allow cancellation of pending or processing jobs
    if (batchJob.status === 'completed' || batchJob.status === 'failed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or failed job' },
        { status: 400 }
      )
    }

    batchJobs.delete(jobId)

    return NextResponse.json({
      message: 'Batch job cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel batch job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}