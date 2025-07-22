import { NextRequest, NextResponse } from 'next/server'
import { issueCredential } from '@/lib/did'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/credentials/issue - Issue a new verifiable credential
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        didDocuments: {
          where: { status: 'ACTIVE' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.didDocuments.length) {
      return NextResponse.json(
        { error: 'No active DID document found. Please create a DID first.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      credentialSubject,
      type = ['VerifiableCredential'],
      context = ['https://www.w3.org/2018/credentials/v1'],
      expirationDate,
      schemaId,
      recipientDID
    } = body

    if (!credentialSubject) {
      return NextResponse.json(
        { error: 'credentialSubject is required' },
        { status: 400 }
      )
    }

    const issuerDID = user.didDocuments[0].did

    // Validate schema if provided
    let schema = null
    if (schemaId) {
      schema = await prisma.credentialSchema.findUnique({
        where: { id: schemaId }
      })
      
      if (!schema) {
        return NextResponse.json(
          { error: 'Schema not found' },
          { status: 404 }
        )
      }
    }

    // Issue the credential
    const signedCredential = await issueCredential({
      issuerDID,
      credentialSubject,
      type,
      context,
      expirationDate
    })

    // Store the credential in database
    const credential = await prisma.credential.create({
      data: {
        id: signedCredential.id || `urn:uuid:${crypto.randomUUID()}`,
        type: type.join(','),
        issuerDIDId: user.didDocuments[0].id,
        schemaId,
        credentialSubject,
        proof: signedCredential.proof,
        issuedAt: new Date(signedCredential.issuanceDate),
        expiresAt: expirationDate ? new Date(expirationDate) : null
      },
      include: {
        issuerDID: true,
        schema: true
      }
    })

    return NextResponse.json({
      message: 'Credential issued successfully',
      credential: {
        id: credential.id,
        type: credential.type,
        issuer: issuerDID,
        issuedAt: credential.issuedAt,
        expiresAt: credential.expiresAt,
        credentialSubject: credential.credentialSubject
      },
      verifiableCredential: signedCredential
    }, { status: 201 })
  } catch (error) {
    console.error('Error issuing credential:', error)
    return NextResponse.json(
      { 
        error: 'Failed to issue credential',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}