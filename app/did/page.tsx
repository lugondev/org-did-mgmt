import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DIDManagement } from '@/components/did/did-management'
import { SchemaManagement } from '@/components/schemas/schema-management'
import { CredentialIssuer } from '@/components/credentials/credential-issuer'
import { CredentialVerifier } from '@/components/credentials/credential-verifier'
import { PresentationManager } from '@/components/presentations/presentation-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, FileText, Award, Eye, Send, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'DID Management | Business Issuer Platform',
  description: 'Manage Decentralized Identifiers, credentials, and verifiable presentations'
}

export default function DIDDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DID Management Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive platform for managing Decentralized Identifiers, issuing verifiable credentials, and handling presentations
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DID Management</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Create & Manage</div>
            <p className="text-xs text-muted-foreground">
              Generate and manage your Decentralized Identifiers
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">DID:key</Badge>
              <Badge variant="outline">Ed25519</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credential Schemas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Define Standards</div>
            <p className="text-xs text-muted-foreground">
              Create and manage credential schemas and templates
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">JSON Schema</Badge>
              <Badge variant="outline">W3C VC</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credential Issuance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Issue & Verify</div>
            <p className="text-xs text-muted-foreground">
              Issue verifiable credentials and verify their authenticity
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">VC Data Model</Badge>
              <Badge variant="outline">Cryptographic Proofs</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="did" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="did" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>DID Management</span>
          </TabsTrigger>
          <TabsTrigger value="schemas" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Schemas</span>
          </TabsTrigger>
          <TabsTrigger value="issue" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Issue Credentials</span>
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Verify Credentials</span>
          </TabsTrigger>
          <TabsTrigger value="presentations" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Presentations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="did" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Decentralized Identity Management</span>
              </CardTitle>
              <CardDescription>
                Create, manage, and resolve Decentralized Identifiers (DIDs) for your organization. 
                DIDs provide a foundation for verifiable, self-sovereign digital identity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DIDManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Credential Schema Management</span>
              </CardTitle>
              <CardDescription>
                Define the structure and validation rules for your verifiable credentials. 
                Schemas ensure consistency and interoperability across your credential ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Credential Issuance</span>
              </CardTitle>
              <CardDescription>
                Issue verifiable credentials to individuals or organizations. 
                Credentials are cryptographically signed and can be independently verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CredentialIssuer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Credential Verification</span>
              </CardTitle>
              <CardDescription>
                Verify the authenticity and validity of verifiable credentials. 
                Check cryptographic signatures, expiration dates, and revocation status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CredentialVerifier />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presentations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Presentation Management</span>
              </CardTitle>
              <CardDescription>
                Create presentation requests to collect specific credentials from users, 
                and manage the verification of submitted presentations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PresentationManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>About DID Technology</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Decentralized Identifiers (DIDs)</h4>
              <p className="text-sm text-muted-foreground">
                DIDs are a new type of identifier that enables verifiable, self-sovereign digital identity. 
                They are fully under the control of the DID subject, independent from any centralized registry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Verifiable Credentials</h4>
              <p className="text-sm text-muted-foreground">
                Verifiable credentials are tamper-evident credentials that can be cryptographically verified. 
                They enable trust in digital interactions without requiring a centralized authority.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Verifiable Presentations</h4>
              <p className="text-sm text-muted-foreground">
                Verifiable presentations allow credential holders to combine and present credentials 
                to verifiers in a privacy-preserving manner, proving specific claims without revealing unnecessary information.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Badge variant="secondary">W3C Standards</Badge>
            <Badge variant="secondary">Cryptographic Security</Badge>
            <Badge variant="secondary">Privacy-Preserving</Badge>
            <Badge variant="secondary">Interoperable</Badge>
            <Badge variant="secondary">Self-Sovereign</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}