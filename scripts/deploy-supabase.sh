#!/bin/bash

# Supabase Deployment Script for Kala Design Co
# This script deploys the database schema and configurations to Supabase

set -e

echo "🚀 Deploying Kala Design Co to Supabase..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found. Please run setup-supabase.sh first."
    exit 1
fi

# Set up access token
export SUPABASE_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    print_error "Project not linked to Supabase. Please run 'supabase link --project-ref YOUR_PROJECT_REF' first."
    exit 1
fi

print_info "Checking project status..."
supabase status

# Deploy database migrations
print_info "Deploying database migrations..."
if supabase db push; then
    print_status "Database migrations deployed successfully"
else
    print_error "Failed to deploy database migrations"
    exit 1
fi

# Deploy edge functions (if any exist)
if [ -d "supabase/functions" ] && [ "$(ls -A supabase/functions)" ]; then
    print_info "Deploying edge functions..."
    if supabase functions deploy; then
        print_status "Edge functions deployed successfully"
    else
        print_warning "Failed to deploy edge functions"
    fi
else
    print_info "No edge functions to deploy"
fi

# Generate and update types
print_info "Generating TypeScript types for remote database..."
if supabase gen types typescript > database/types.ts; then
    print_status "TypeScript types generated and saved to database/types.ts"
else
    print_warning "Failed to generate types"
fi

# Verify deployment
print_info "Verifying deployment..."
if supabase db diff; then
    print_status "Database schema is up to date"
else
    print_warning "Database schema differences detected. Review and apply if necessary."
fi

# Get project details
print_info "Getting project details..."
PROJECT_REF=$(supabase status | grep "Project ref" | awk '{print $3}')
API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')

print_status "Deployment completed successfully!"
print_info "Project Details:"
echo "  - Project Reference: $PROJECT_REF"
echo "  - API URL: $API_URL"
echo "  - Anon Key: $ANON_KEY"

print_info "Next steps:"
echo "1. Update database/supabase-config.js with the above credentials"
echo "2. Test the connection using database/config-checker.html"
echo "3. Update your frontend application with the new credentials"
echo "4. Test all functionality in production"

print_warning "Security reminders:"
echo "- Never commit your service role key to version control"
echo "- Use environment variables for sensitive credentials in production"
echo "- Review and test all RLS policies"
echo "- Monitor your database usage and set up alerts"

# Create environment file template
cat > .env.example << EOF
# Supabase Configuration
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# For production deployment
NODE_ENV=production
EOF

print_status "Environment template created: .env.example"
print_info "Copy .env.example to .env and update with your actual credentials"