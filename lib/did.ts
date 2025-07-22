import { Ed25519VerificationKey2020 } from '@digitalcredentials/ed25519-signature-2020'
import { Ed25519Signature2020 } from '@digitalcredentials/ed25519-signature-2020'
import * as vc from '@digitalcredentials/vc'
import { prisma } from './prisma'

/**
 * Generate a new DID:key with Ed25519 key pair
 */
export async function generateDIDKey(): Promise<{
  did: string
  keyPair: Ed25519VerificationKey2020
  document: any
}> {
  // Generate Ed25519 key pair
  const keyPair = await Ed25519VerificationKey2020.generate()
  
  // Create DID:key from public key
  const did = `did:key:${keyPair.publicKeyMultibase}`
  
  // Create DID document
  const document = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: did,
    verificationMethod: [{
      id: `${did}#${keyPair.id}`,
      type: 'Ed25519VerificationKey2020',
      controller: did,
      publicKeyMultibase: keyPair.publicKeyMultibase
    }],
    authentication: [`${did}#${keyPair.id}`],
    assertionMethod: [`${did}#${keyPair.id}`],
    keyAgreement: [`${did}#${keyPair.id}`],
    capabilityInvocation: [`${did}#${keyPair.id}`],
    capabilityDelegation: [`${did}#${keyPair.id}`]
  }
  
  return { did, keyPair, document }
}

/**
 * Create and store a new DID document in database
 */
export async function createDIDDocument(userId?: string): Promise<{
  didDocument: any
  keyPair: Ed25519VerificationKey2020
}> {
  const { did, keyPair, document } = await generateDIDKey()
  
  // Store DID document in database
  const didDocument = await prisma.dIDDocument.create({
    data: {
      did,
      document,
      method: 'did:key',
      controller: did,
      userId,
      keys: {
        create: {
          keyId: keyPair.id,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: keyPair.publicKeyMultibase,
          privateKeyMultibase: keyPair.privateKeyMultibase,
          purpose: ['authentication', 'assertionMethod', 'keyAgreement', 'capabilityInvocation', 'capabilityDelegation']
        }
      }
    },
    include: {
      keys: true
    }
  })
  
  return { didDocument, keyPair }
}

/**
 * Resolve a DID document from database or external resolver
 */
export async function resolveDIDDocument(did: string): Promise<any> {
  // First try to find in local database
  const localDID = await prisma.dIDDocument.findUnique({
    where: { did },
    include: { keys: true }
  })
  
  if (localDID) {
    return localDID.document
  }
  
  // For did:key, we can resolve locally
  if (did.startsWith('did:key:')) {
    // This is a simplified resolution - in production you'd use a proper DID resolver
    const publicKeyMultibase = did.replace('did:key:', '')
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      verificationMethod: [{
        id: `${did}#${publicKeyMultibase}`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase
      }],
      authentication: [`${did}#${publicKeyMultibase}`],
      assertionMethod: [`${did}#${publicKeyMultibase}`]
    }
  }
  
  throw new Error(`Cannot resolve DID: ${did}`)
}

/**
 * Get key pair for signing from database
 */
export async function getSigningKeyPair(did: string): Promise<Ed25519VerificationKey2020> {
  const didDocument = await prisma.dIDDocument.findUnique({
    where: { did },
    include: { keys: true }
  })
  
  if (!didDocument || !didDocument.keys.length) {
    throw new Error(`No signing key found for DID: ${did}`)
  }
  
  const key = didDocument.keys.find(k => k.purpose.includes('assertionMethod'))
  if (!key || !key.privateKeyMultibase) {
    throw new Error(`No assertion method key found for DID: ${did}`)
  }
  
  // Reconstruct key pair from stored data
  return await Ed25519VerificationKey2020.from({
    id: key.keyId,
    controller: key.controller,
    publicKeyMultibase: key.publicKeyMultibase,
    privateKeyMultibase: key.privateKeyMultibase
  })
}

/**
 * Issue a verifiable credential
 */
export async function issueCredential({
  issuerDID,
  credentialSubject,
  type = ['VerifiableCredential'],
  context = ['https://www.w3.org/2018/credentials/v1'],
  expirationDate
}: {
  issuerDID: string
  credentialSubject: any
  type?: string[]
  context?: string[]
  expirationDate?: string
}): Promise<any> {
  // Get issuer's signing key
  const keyPair = await getSigningKeyPair(issuerDID)
  
  // Create unsigned credential
  const credential = {
    '@context': context,
    type,
    issuer: issuerDID,
    issuanceDate: new Date().toISOString(),
    ...(expirationDate && { expirationDate }),
    credentialSubject
  }
  
  // Create suite for signing
  const suite = new Ed25519Signature2020({ key: keyPair })
  
  // Sign the credential
  const signedCredential = await vc.issue({
    credential,
    suite,
    documentLoader: async (url: string) => {
      // Simple document loader - in production use a proper one
      if (url.startsWith('did:')) {
        const document = await resolveDIDDocument(url)
        return { document }
      }
      throw new Error(`Cannot load document: ${url}`)
    }
  })
  
  return signedCredential
}

/**
 * Verify a verifiable credential
 */
export async function verifyCredential(credential: any): Promise<{
  verified: boolean
  error?: string
}> {
  try {
    const suite = new Ed25519Signature2020()
    
    const result = await vc.verifyCredential({
      credential,
      suite,
      documentLoader: async (url: string) => {
        if (url.startsWith('did:')) {
          const document = await resolveDIDDocument(url)
          return { document }
        }
        throw new Error(`Cannot load document: ${url}`)
      }
    })
    
    return { verified: result.verified }
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create a verifiable presentation
 */
export async function createPresentation({
  holderDID,
  credentials,
  challenge,
  domain
}: {
  holderDID: string
  credentials: any[]
  challenge?: string
  domain?: string
}): Promise<any> {
  const keyPair = await getSigningKeyPair(holderDID)
  
  const presentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    holder: holderDID,
    verifiableCredential: credentials
  }
  
  const suite = new Ed25519Signature2020({ key: keyPair })
  
  const signedPresentation = await vc.signPresentation({
    presentation,
    suite,
    challenge,
    domain,
    documentLoader: async (url: string) => {
      if (url.startsWith('did:')) {
        const document = await resolveDIDDocument(url)
        return { document }
      }
      throw new Error(`Cannot load document: ${url}`)
    }
  })
  
  return signedPresentation
}

/**
 * Verify a verifiable presentation
 */
export async function verifyPresentation(presentation: any, {
  challenge,
  domain
}: {
  challenge?: string
  domain?: string
} = {}): Promise<{
  verified: boolean
  error?: string
}> {
  try {
    const suite = new Ed25519Signature2020()
    
    const result = await vc.verify({
      presentation,
      suite,
      challenge,
      domain,
      documentLoader: async (url: string) => {
        if (url.startsWith('did:')) {
          const document = await resolveDIDDocument(url)
          return { document }
        }
        throw new Error(`Cannot load document: ${url}`)
      }
    })
    
    return { verified: result.verified }
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}