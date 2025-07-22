#!/bin/bash

# Deploy script for Vercel
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login:"
    vercel login
fi

# Run linting and formatting checks
echo "🔍 Running code quality checks..."
npm run lint
npm run format:check

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Test build locally
echo "🏗️ Testing build locally..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
if [ "$1" = "--prod" ]; then
    echo "📦 Deploying to production..."
    vercel --prod
else
    echo "🧪 Deploying to preview..."
    vercel
fi

echo "✅ Deployment completed successfully!"
echo "📊 Check your deployment status at: https://vercel.com/dashboard"

# Optional: Open deployment URL
if command -v open &> /dev/null; then
    echo "🌐 Opening deployment in browser..."
    sleep 2
    vercel --url | xargs open
fi