'use client'

import {
  Code,
  Book,
  Webhook,
  Key,
  Terminal,
  ExternalLink,
  Copy,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'
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
import Link from 'next/link'

const apiStats = {
  totalRequests: 12456,
  successRate: 99.8,
  avgResponseTime: 145,
  activeWebhooks: 8,
}

const quickStartGuides = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of OrgDID API integration',
    icon: Book,
    href: '/developer/api/getting-started',
    difficulty: 'Beginner',
  },
  {
    title: 'Issue Credentials',
    description: 'How to issue digital credentials programmatically',
    icon: Code,
    href: '/developer/api/credentials',
    difficulty: 'Intermediate',
  },
  {
    title: 'Verify Credentials',
    description: 'Implement credential verification in your app',
    icon: Terminal,
    href: '/developer/api/verification',
    difficulty: 'Intermediate',
  },
  {
    title: 'Webhook Integration',
    description: 'Set up real-time notifications for your application',
    icon: Webhook,
    href: '/developer/webhooks',
    difficulty: 'Advanced',
  },
]

const codeExamples = [
  {
    title: 'Issue a Credential',
    language: 'JavaScript',
    code: `const response = await fetch('/api/credentials/issue', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    schemaId: 'age-credential-v1',
    subjectId: 'did:example:123',
    claims: {
      age: 25,
      dateOfBirth: '1998-01-01'
    }
  })
});`,
  },
  {
    title: 'Verify a Credential',
    language: 'Python',
    code: `import requests

response = requests.post(
    'https://api.didmgmt.com/v1/credentials/verify',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'credential': credential_data,
        'policies': ['age-verification']
    }
)

result = response.json()`,
  },
]

export default function DeveloperPage() {
  const handleApiDocs = () => {
    toast.info('API Documentation will be available soon!')
  }

  const handleGenerateApiKey = () => {
    toast.info('API Key generation will be available soon!')
  }

  const handleGraphQLApi = () => {
    toast.info('GraphQL API will be available soon!')
  }

  const handleOpenApiSpec = () => {
    toast.info('OpenAPI Specification will be available soon!')
  }

  const handleTestWebhooks = () => {
    toast.info('Webhook testing will be available soon!')
  }

  const handleWebhookGuide = () => {
    toast.info('Webhook guide will be available soon!')
  }

  const handleApiExplorer = () => {
    toast.info('API Explorer will be available soon!')
  }

  const handleCredentialSimulator = () => {
    toast.info('Credential Simulator will be available soon!')
  }

  const handleSchemaBuilder = () => {
    toast.info('Schema Builder will be available soon!')
  }

  const handleCopyCode = () => {
    toast.success('Code copied to clipboard!')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Developer Hub
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              APIs, SDKs, and tools for building with OrgDID
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/developer/api">
                <Book className="mr-2 h-4 w-4" />
                API Docs
              </Link>
            </Button>
            <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" onClick={handleGenerateApiKey}>
              <Key className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* API Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-didmgmt-blue" />
                <span className="text-sm text-didmgmt-text-secondary">
                  API Requests
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {apiStats.totalRequests.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Success Rate
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {apiStats.successRate}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Avg Response
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {apiStats.avgResponseTime}ms
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-didmgmt-text-secondary">
                  Active Webhooks
                </span>
              </div>
              <div className="text-2xl font-bold text-didmgmt-text-primary">
                {apiStats.activeWebhooks}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* API Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    API Documentation
                  </CardTitle>
                  <CardDescription>
                    Complete reference for all OrgDID APIs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/developer/api">
                        <Code className="mr-2 h-4 w-4" />
                        REST API Reference
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleGraphQLApi}>
                      <Terminal className="mr-2 h-4 w-4" />
                      GraphQL API
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleOpenApiSpec}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      OpenAPI Spec
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Webhooks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Real-time notifications for your applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/developer/webhooks">
                        <Webhook className="mr-2 h-4 w-4" />
                        Manage Webhooks
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleTestWebhooks}>
                      <Play className="mr-2 h-4 w-4" />
                      Test Webhooks
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleWebhookGuide}>
                      <Book className="mr-2 h-4 w-4" />
                      Webhook Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* SDKs */}
              <Card>
                <CardHeader>
                  <CardTitle>SDKs & Libraries</CardTitle>
                  <CardDescription>
                    Official SDKs for popular programming languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="font-medium">JavaScript/TypeScript</span>
                      <Badge variant="success">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="font-medium">Python</span>
                      <Badge variant="success">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="font-medium">Java</span>
                      <Badge variant="warning">Coming Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="font-medium">Go</span>
                      <Badge variant="warning">Coming Soon</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Developer Tools</CardTitle>
                  <CardDescription>
                    Tools to help you build and test your integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={handleApiExplorer}>
                      <Terminal className="mr-2 h-4 w-4" />
                      API Explorer
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleCredentialSimulator}>
                      <Play className="mr-2 h-4 w-4" />
                      Credential Simulator
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleSchemaBuilder}>
                      <Code className="mr-2 h-4 w-4" />
                      Schema Builder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quickstart" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {quickStartGuides.map(guide => {
                const Icon = guide.icon
                return (
                  <Card
                    key={guide.title}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {guide.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {guide.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{guide.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" asChild>
                        <Link href={guide.href}>
                          Start Guide
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="space-y-6">
              {codeExamples.map((example, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {example.title}
                        </CardTitle>
                        <CardDescription>{example.language}</CardDescription>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleCopyCode}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-accent p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{example.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
