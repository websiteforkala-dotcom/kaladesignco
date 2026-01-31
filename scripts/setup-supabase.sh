#!/bin/bash

# Supabase CLI Setup Script for Kala Design Co
# This script sets up the Supabase CLI and initializes the project

set -e

echo "🚀 Setting up Supabase CLI for Kala Design Co..."

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
    print_info "Supabase CLI not found. Installing..."
    
    # Install Supabase CLI based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            print_error "Homebrew not found. Please install Homebrew first or install Supabase CLI manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://github.com/supabase/cli/releases/download/v1.123.4/supabase_linux_amd64.tar.gz | tar -xz
        sudo mv supabase /usr/local/bin/
    else
        print_error "Unsupported OS. Please install Supabase CLI manually from https://supabase.com/docs/guides/cli"
        exit 1
    fi
    
    print_status "Supabase CLI installed successfully"
else
    print_status "Supabase CLI is already installed"
fi

# Check CLI version
print_info "Supabase CLI version: $(supabase --version)"

# Set up access token
export SUPABASE_ACCESS_TOKEN="sbp_b87e6e8a9941a96e1b43c80d02eabf64586485d5"
print_status "Access token configured"

# Initialize Supabase project if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    print_info "Initializing Supabase project..."
    supabase init
    print_status "Supabase project initialized"
else
    print_status "Supabase project already initialized"
fi

# Link to remote project (you'll need to replace with your actual project reference)
print_info "To link to your remote project, run:"
echo "supabase link --project-ref YOUR_PROJECT_REF"
print_warning "Replace YOUR_PROJECT_REF with your actual project reference from Supabase dashboard"

# Start local development environment
print_info "Starting local Supabase environment..."
if supabase start; then
    print_status "Local Supabase environment started successfully"
    print_info "Local services:"
    echo "  - API URL: http://localhost:54321"
    echo "  - GraphQL URL: http://localhost:54321/graphql/v1"
    echo "  - DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
    echo "  - Studio URL: http://localhost:54323"
    echo "  - Inbucket URL: http://localhost:54324"
    echo "  - JWT secret: super-secret-jwt-token-with-at-least-32-characters-long"
    echo "  - anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo "  - service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
else
    print_error "Failed to start local Supabase environment"
    exit 1
fi

# Apply migrations
print_info "Applying database migrations..."
if supabase db reset; then
    print_status "Database migrations applied successfully"
else
    print_warning "Failed to apply migrations. You may need to run 'supabase db reset' manually"
fi

# Generate types (optional)
print_info "Generating TypeScript types..."
if supabase gen types typescript --local > database/types.ts; then
    print_status "TypeScript types generated"
else
    print_warning "Failed to generate types. This is optional and can be done later"
fi

print_status "Supabase setup completed successfully!"
print_info "Next steps:"
echo "1. Update database/supabase-config.js with your project URL and anon key"
echo "2. Link to your remote project: supabase link --project-ref YOUR_PROJECT_REF"
echo "3. Deploy migrations to remote: supabase db push"
echo "4. Test the connection using database/config-checker.html"

print_info "Useful commands:"
echo "  - supabase status: Check service status"
echo "  - supabase stop: Stop local services"
echo "  - supabase db reset: Reset local database"
echo "  - supabase functions serve: Serve edge functions"
echo "  - supabase gen types typescript --local: Generate types"