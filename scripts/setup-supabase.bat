@echo off
REM Supabase CLI Setup Script for Kala Design Co (Windows)
REM This script sets up the Supabase CLI and initializes the project

echo 🚀 Setting up Supabase CLI for Kala Design Co...

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  Supabase CLI not found. Please install it manually.
    echo.
    echo Please install Supabase CLI using one of these methods:
    echo 1. Download from: https://github.com/supabase/cli/releases
    echo 2. Using Scoop: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    echo                 scoop install supabase
    echo 3. Using npm: npm install -g supabase
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Supabase CLI is already installed
)

REM Check CLI version
echo ℹ️  Supabase CLI version:
supabase --version

REM Set up access token
set SUPABASE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
echo ✅ Access token configured

REM Initialize Supabase project if not already initialized
if not exist "supabase\config.toml" (
    echo ℹ️  Initializing Supabase project...
    supabase init
    echo ✅ Supabase project initialized
) else (
    echo ✅ Supabase project already initialized
)

REM Link to remote project
echo.
echo ℹ️  To link to your remote project, run:
echo supabase link --project-ref YOUR_PROJECT_REF
echo ⚠️  Replace YOUR_PROJECT_REF with your actual project reference from Supabase dashboard
echo.

REM Start local development environment
echo ℹ️  Starting local Supabase environment...
supabase start
if %errorlevel% equ 0 (
    echo ✅ Local Supabase environment started successfully
    echo.
    echo ℹ️  Local services:
    echo   - API URL: http://localhost:54321
    echo   - GraphQL URL: http://localhost:54321/graphql/v1
    echo   - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
    echo   - Studio URL: http://localhost:54323
    echo   - Inbucket URL: http://localhost:54324
    echo   - JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
    echo   - anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
    echo   - service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
) else (
    echo ❌ Failed to start local Supabase environment
    pause
    exit /b 1
)

REM Apply migrations
echo.
echo ℹ️  Applying database migrations...
supabase db reset
if %errorlevel% equ 0 (
    echo ✅ Database migrations applied successfully
) else (
    echo ⚠️  Failed to apply migrations. You may need to run 'supabase db reset' manually
)

REM Generate types (optional)
echo.
echo ℹ️  Generating TypeScript types...
supabase gen types typescript --local > database\types.ts
if %errorlevel% equ 0 (
    echo ✅ TypeScript types generated
) else (
    echo ⚠️  Failed to generate types. This is optional and can be done later
)

echo.
echo ✅ Supabase setup completed successfully!
echo.
echo ℹ️  Next steps:
echo 1. Update database/supabase-config.js with your project URL and anon key
echo 2. Link to your remote project: supabase link --project-ref YOUR_PROJECT_REF
echo 3. Deploy migrations to remote: supabase db push
echo 4. Test the connection using database/config-checker.html
echo.
echo ℹ️  Useful commands:
echo   - supabase status: Check service status
echo   - supabase stop: Stop local services
echo   - supabase db reset: Reset local database
echo   - supabase functions serve: Serve edge functions
echo   - supabase gen types typescript --local: Generate types
echo.
pause