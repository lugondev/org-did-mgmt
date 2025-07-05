'use client'

import {
  Book,
  Code,
  Key,
  Play,
  Copy,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/api/v1/credentials/issue',
    description: 'Issue a new credential',
    category: 'Credentials',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/credentials/{id}',
    description: 'Get credential details',
    category: 'Credentials',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/credentials/verify',
    description: 'Verify a credential',
    category: 'Verification',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/schemas',
    description: 'List all schemas',
    category: 'Schemas',
  },
  {
    method: 'POST',
    endpoint: '/api/v1/schemas',
    description: 'Create a new schema',
    category: 'Schemas',
  },
  {
    method: 'GET',
    endpoint: '/api/v1/organizations/{id}',
    description: 'Get organization details',
    category: 'Organizations',
  },
]

const codeExamples = {
  javascript: `// Install the OrgDID SDK
npm install @didmgmt/sdk

// Initialize the client
import { OrgDIDClient } from '@didmgmt/sdk';

const client = new OrgDIDClient({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Issue a credential
const credential = await client.credentials.issue({
  schemaId: 'age-credential-v1',
  subjectId: 'did:example:123',
  claims: {
    age: 25,
    dateOfBirth: '1998-01-01'
  }
});`,
  python: `# Install the OrgDID SDK
pip install didmgmt-sdk

# Initialize the client
from didmgmt import OrgDIDClient

client = OrgDIDClient(
    api_key='your-api-key',
    environment='production'  # or 'sandbox'
)

# Issue a credential
credential = client.credentials.issue(
    schema_id='age-credential-v1',
    subject_id='did:example:123',
    claims={
        'age': 25,
        'date_of_birth': '1998-01-01'
    }
)`,
  curl: `# Issue a credential using cURL
curl -X POST https://api.didmgmt.com/v1/credentials/issue \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "schemaId": "age-credential-v1",
    "subjectId": "did:example:123",
    "claims": {
      "age": 25,
      "dateOfBirth": "1998-01-01"
    }
  }'`,
}

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-100 text-green-800'
    case 'POST':
      return 'bg-blue-100 text-blue-800'
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800'
    case 'DELETE':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function APIDocumentationPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              API Documentation
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Complete reference for the OrgDID REST API
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              OpenAPI Spec
            </Button>
            <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90">
              <Play className="mr-2 h-4 w-4" />
              Try API
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Book className="mr-2 h-4 w-4" />
                    Getting Started
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Authentication
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Credentials
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Schemas
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Verification
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Organizations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to integrate with the OrgDID API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Base URL</h4>
                    <div className="bg-accent p-3 rounded-lg font-mono text-sm">
                      https://api.didmgmt.com/v1
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Authentication</h4>
                    <p className="text-sm text-didmgmt-text-secondary mb-2">
                      All API requests require authentication using an API key
                      in the Authorization header:
                    </p>
                    <div className="bg-accent p-3 rounded-lg font-mono text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Examples</CardTitle>
                <CardDescription>
                  Get started with these code examples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="javascript" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  {Object.entries(codeExamples).map(([language, code]) => (
                    <TabsContent key={language} value={language}>
                      <div className="relative">
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 z-10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <pre className="bg-accent p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{code}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API Endpoints</CardTitle>
                    <CardDescription>
                      Complete list of available API endpoints
                    </CardDescription>
                  </div>
                  <Input placeholder="Search endpoints..." className="w-64" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiEndpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <div className="font-mono text-sm font-medium">
                            {endpoint.endpoint}
                          </div>
                          <div className="text-sm text-didmgmt-text-secondary">
                            {endpoint.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{endpoint.category}</Badge>
                        <ChevronRight className="h-4 w-4 text-didmgmt-text-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Format */}
            <Card>
              <CardHeader>
                <CardTitle>Response Format</CardTitle>
                <CardDescription>
                  Standard response format for all API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Success Response</h4>
                    <pre className="bg-accent p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}`}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Error Response</h4>
                    <pre className="bg-accent p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      // Additional error details
    }
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>API rate limiting information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Standard Plan</h4>
                    <div className="text-2xl font-bold text-didmgmt-text-primary mb-1">
                      1,000
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      requests per hour
                    </div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Enterprise Plan</h4>
                    <div className="text-2xl font-bold text-didmgmt-text-primary mb-1">
                      10,000
                    </div>
                    <div className="text-sm text-didmgmt-text-secondary">
                      requests per hour
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
