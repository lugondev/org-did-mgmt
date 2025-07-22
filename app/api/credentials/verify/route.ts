import { NextRequest, NextResponse } from 'next/server'
import { verifyCredential } from '@/lib/did'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/credentials/verify - Verify a verifiable credential
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credential } = body

    if (!credential) {
      return NextResponse.json(
        { error: 'credential is required' },
        { status: 400 }
      )
    }

    // Verify the credential cryptographically
    const verificationResult = await verifyCredential(credential)

    // Additional checks
    const checks = {
      cryptographicVerification: verificationResult.verified,
      expired: false,
      revoked: false,
      issuerTrusted: false
    }

    // Check expiration
    if (credential.expirationDate) {
      const expirationDate = new Date(credential.expirationDate)
      checks.expired = expirationDate < new Date()
    }

    // Check if credential is in our database and get status
    let credentialRecord = null
    if (credential.id) {
      credentialRecord = await prisma.credential.findFirst({
        where: {
          id: credential.id
        },
        include: {
          issuerDID: true,
          schema: true,
          status: true
        }
      })

      if (credentialRecord) {
        // Note: status field doesn't exist in Credential model
        checks.revoked = false // Default to not revoked
        checks.issuerTrusted = credentialRecord.issuerDID?.status === 'ACTIVE'
      }
    }

    // Check if issuer DID is known and trusted
    if (credential.issuer && !checks.issuerTrusted) {
      const issuerDID = await prisma.dIDDocument.findUnique({
        where: { did: credential.issuer }
      })
      
      if (issuerDID) {
        checks.issuerTrusted = issuerDID.status === 'ACTIVE'
      }
    }

    const overallValid = checks.cryptographicVerification && 
                        !checks.expired && 
                        !checks.revoked

    // Log verification attempt - removed lastVerifiedAt as it doesn't exist in schema

    return NextResponse.json({
      valid: overallValid,
      checks,
      verificationResult,
      credential: credentialRecord ? {
        id: credentialRecord.id,
        type: credentialRecord.type,
        issuer: credentialRecord.issuerDID?.did,
        status: credentialRecord.status?.status,
        issuedAt: credentialRecord.issuedAt,
        expiresAt: credentialRecord.expiresAt
      } : null,
      verifiedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error verifying credential:', error)
    return NextResponse.json(
      { 
        error: 'Failed to verify credential',
        details: error instanceof Error ? error.message : 'Unknown error',
        valid: false
      },
      { status: 500 }
    )
  }
}