# Supabase CLI Commands for Kala Design Co

This document contains useful Supabase CLI commands for managing the Kala Design Co project.

## Setup Commands

### Initial Setup
```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Install Supabase CLI (Linux)
curl -fsSL https://github.com/supabase/cli/releases/download/v1.123.4/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/

# Set access token
export SUPABASE_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF
```

## Local Development

### Start/Stop Services
```bash
# Start all local services
supabase start

# Stop all local services
supabase stop

# Check service status
supabase status

# Restart services
supabase restart
```

### Database Management
```bash
# Reset local database (applies all migrations)
supabase db reset

# Create new migration
supabase migration new migration_name

# Apply migrations to local database
supabase db reset

# Generate migration from schema diff
supabase db diff --schema public

# Seed database with sample data
supabase db reset --with-seed
```

## Remote Deployment

### Deploy to Production
```bash
# Push migrations to remote database
supabase db push

# Pull remote schema changes
supabase db pull

# Check differences between local and remote
supabase db diff

# Deploy edge functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function_name
```

## Type Generation

### Generate TypeScript Types
```bash
# Generate types from local database
supabase gen types typescript --local > database/types.ts

# Generate types from remote database
supabase gen types typescript > database/types.ts

# Generate types for specific schema
supabase gen types typescript --schema public
```

## Project Management

### Project Information
```bash
# List all projects
supabase projects list

# Get project details
supabase projects api-keys --project-ref YOUR_PROJECT_REF

# Create new project
supabase projects create "Project Name"
```

### Authentication
```bash
# Login to Supabase
supabase login

# Logout
supabase logout

# Check current user
supabase projects list
```

## Edge Functions

### Function Development
```bash
# Create new function
supabase functions new function_name

# Serve functions locally
supabase functions serve

# Serve specific function
supabase functions serve function_name

# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function_name

# Delete function
supabase functions delete function_name
```

## Storage Management

### Bucket Operations
```bash
# List storage buckets
supabase storage ls

# Create bucket
supabase storage mb bucket_name

# Upload file
supabase storage cp local_file.jpg bucket_name/remote_file.jpg

# Download file
supabase storage cp bucket_name/remote_file.jpg local_file.jpg

# List bucket contents
supabase storage ls bucket_name
```

## Secrets Management

### Environment Variables
```bash
# List secrets
supabase secrets list

# Set secret
supabase secrets set SECRET_NAME=secret_value

# Unset secret
supabase secrets unset SECRET_NAME
```

## Debugging and Logs

### View Logs
```bash
# View function logs
supabase functions logs function_name

# View database logs
supabase logs db

# View API logs
supabase logs api

# Follow logs in real-time
supabase functions logs function_name --follow
```

## Backup and Restore

### Database Backup
```bash
# Create database dump
pg_dump "postgresql://postgres:postgres@localhost:54322/postgres" > backup.sql

# Restore from backup
psql "postgresql://postgres:postgres@localhost:54322/postgres" < backup.sql
```

## Testing

### Run Tests
```bash
# Run database tests
supabase test db

# Run specific test file
supabase test db tests/test_file.sql
```

## Configuration

### Environment Files
```bash
# Create .env file for local development
cat > .env.local << EOF
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
EOF

# Create .env file for production
cat > .env.production << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
EOF
```

## Useful Aliases

Add these to your `.bashrc` or `.zshrc`:

```bash
# Supabase aliases
alias sb='supabase'
alias sbs='supabase start'
alias sbst='supabase stop'
alias sbr='supabase db reset'
alias sbp='supabase db push'
alias sbt='supabase gen types typescript'
alias sbf='supabase functions'
alias sbl='supabase logs'
```

## Common Workflows

### Development Workflow
```bash
# 1. Start local environment
supabase start

# 2. Make schema changes
# Edit migration files or use SQL editor

# 3. Apply changes locally
supabase db reset

# 4. Test changes
# Use your application or run tests

# 5. Generate types
supabase gen types typescript --local > database/types.ts

# 6. Deploy to production
supabase db push
```

### Migration Workflow
```bash
# 1. Create new migration
supabase migration new add_new_table

# 2. Edit migration file
# Add your SQL changes

# 3. Apply migration locally
supabase db reset

# 4. Test migration
# Verify changes work as expected

# 5. Deploy to production
supabase db push
```

### Function Development Workflow
```bash
# 1. Create new function
supabase functions new my_function

# 2. Develop function locally
# Edit function code

# 3. Test function locally
supabase functions serve my_function

# 4. Deploy function
supabase functions deploy my_function

# 5. Monitor function logs
supabase functions logs my_function --follow
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Change ports in supabase/config.toml
   # Or stop conflicting services
   ```

2. **Migration errors**
   ```bash
   # Reset and try again
   supabase db reset
   
   # Check migration syntax
   supabase db diff
   ```

3. **Connection issues**
   ```bash
   # Check service status
   supabase status
   
   # Restart services
   supabase restart
   ```

4. **Authentication errors**
   ```bash
   # Re-login
   supabase logout
   supabase login
   
   # Check access token
   echo $SUPABASE_ACCESS_TOKEN
   ```

### Getting Help
```bash
# Get help for any command
supabase help
supabase help db
supabase help functions

# Check version
supabase --version

# Update CLI
brew upgrade supabase
```

## Project-Specific Commands

### Kala Design Co Specific
```bash
# Reset with seed data
supabase db reset --with-seed

# Deploy with specific migration
supabase db push --include-seed

# Generate types for our schema
supabase gen types typescript --schema public > database/types.ts

# Check our specific tables
supabase db diff --schema public --table contact_forms,site_settings,seo_settings
```