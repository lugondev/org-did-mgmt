declare module '@digitalcredentials/ed25519-signature-2020' {
  export class Ed25519VerificationKey2020 {
    id: string
    publicKeyMultibase: string
    privateKeyMultibase: string
    constructor(options?: any)
    static from(options: any): Ed25519VerificationKey2020
    static generate(options?: any): Promise<Ed25519VerificationKey2020>
    export(options?: any): Promise<any>
    signer(): any
    verifier(): any
  }

  export class Ed25519Signature2020 {
    constructor(options?: any)
    sign(options: any): Promise<any>
    verify(options: any): Promise<any>
  }
}

declare module '@digitalcredentials/vc' {
  export function issue(options: any): Promise<any>
  export function verify(options: any): Promise<any>
  export function verifyCredential(options: any): Promise<any>
  export function createPresentation(options: any): any
  export function signPresentation(options: any): Promise<any>
  export function verifyPresentation(options: any): Promise<any>
}