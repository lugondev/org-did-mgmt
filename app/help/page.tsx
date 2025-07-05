'use client'

import {
  HelpCircle,
  Book,
  MessageSquare,
  Search,
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
import { Input } from '@/components/ui/input'
import Link from 'next/link'

const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of OrgDID platform',
    icon: Book,
    articles: [
      'What is OrgDID?',
      'Setting up your organization',
      'Creating your first credential',
      'Understanding schemas',
    ],
    href: '/help/docs/getting-started',
  },
  {
    title: 'Credentials',
    description: 'Everything about digital credentials',
    icon: HelpCircle,
    articles: [
      'How to issue credentials',
      'Managing credential lifecycle',
      'Revoking credentials',
      'Credential verification',
    ],
    href: '/help/docs/credentials',
  },
  {
    title: 'API Integration',
    description: 'Integrate OrgDID with your applications',
    icon: Book,
    articles: [
      'API authentication',
      'Issuing credentials via API',
      'Webhook configuration',
      'SDK documentation',
    ],
    href: '/help/docs/api',
  },
  {
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: HelpCircle,
    articles: [
      'Common error codes',
      'Debugging webhook issues',
      'Performance optimization',
      'Security best practices',
    ],
    href: '/help/docs/troubleshooting',
  },
]

const popularArticles = [
  {
    title: 'How to create your first credential schema',
    category: 'Getting Started',
    readTime: '5 min read',
    href: '/help/docs/first-schema',
  },
  {
    title: 'Setting up webhook notifications',
    category: 'API Integration',
    readTime: '8 min read',
    href: '/help/docs/webhooks',
  },
  {
    title: 'Understanding credential verification',
    category: 'Credentials',
    readTime: '6 min read',
    href: '/help/docs/verification',
  },
  {
    title: 'API rate limits and best practices',
    category: 'API Integration',
    readTime: '4 min read',
    href: '/help/docs/rate-limits',
  },
]

const quickActions = [
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: MessageSquare,
    href: '/help/support',
    action: 'Contact Us',
  },
  {
    title: 'API Documentation',
    description: 'Complete API reference and guides',
    icon: Book,
    href: '/developer/api',
    action: 'View Docs',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other developers',
    icon: MessageSquare,
    href: '#',
    action: 'Join Forum',
  },
]

export default function HelpPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Page Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-didmgmt-text-primary">
              Help Center
            </h1>
            <p className="text-sm text-didmgmt-text-secondary">
              Find answers, guides, and get support
            </p>
          </div>
          <Button className="bg-didmgmt-blue hover:bg-didmgmt-blue/90" asChild>
            <Link href="/help/support">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Search */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-didmgmt-text-secondary" />
              <Input
                placeholder="Search for help articles, guides, and more..."
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Help Categories */}
            <div>
              <h2 className="text-xl font-semibold text-didmgmt-text-primary mb-4">
                Browse by Category
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {helpCategories.map(category => {
                  const Icon = category.icon
                  return (
                    <Card
                      key={category.title}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-didmgmt-blue">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {category.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.articles.slice(0, 3).map(article => (
                            <div
                              key={article}
                              className="flex items-center gap-2 text-sm text-didmgmt-text-secondary"
                            >
                              <ChevronRight className="h-3 w-3" />
                              <span>{article}</span>
                            </div>
                          ))}
                          {category.articles.length > 3 && (
                            <div className="text-sm text-didmgmt-blue">
                              +{category.articles.length - 3} more articles
                            </div>
                          )}
                        </div>
                        <Button
                          className="w-full mt-4"
                          variant="outline"
                          asChild
                        >
                          <Link href={category.href}>View All Articles</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Popular Articles */}
            <div>
              <h2 className="text-xl font-semibold text-didmgmt-text-primary mb-4">
                Popular Articles
              </h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {popularArticles.map((article, index) => (
                      <div
                        key={index}
                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-didmgmt-text-primary mb-1">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-didmgmt-text-secondary">
                              <span>{article.category}</span>
                              <span>•</span>
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-didmgmt-text-secondary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map(action => {
                    const Icon = action.icon
                    return (
                      <div
                        key={action.title}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-didmgmt-blue" />
                          <div>
                            <div className="font-medium text-sm">
                              {action.title}
                            </div>
                            <div className="text-xs text-didmgmt-text-secondary">
                              {action.description}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={action.href}>{action.action}</Link>
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need More Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Support Hours</h4>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Monday - Friday
                      <br />
                      9:00 AM - 6:00 PM PST
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Response Time</h4>
                    <div className="text-sm text-didmgmt-text-secondary">
                      Typically within 24 hours
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/help/support">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    asChild
                  >
                    <Link href="/developer/api">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      API Documentation
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Video Tutorials
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Best Practices Guide
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Release Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
