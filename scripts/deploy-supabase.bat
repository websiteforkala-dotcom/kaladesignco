@echo off
REM Supabase Deployment Script for Kala Design Co (Windows)
REM This script deploys the database schema and configurations to Supabase

echo 🚀 Deploying Kala Design Co to Supabase...

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found. Please run setup-supabase.bat first.
    pause
    exit /b 1
)

REM Set up access token
set SUPABASE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN

REM Check if project is linked
if not exist ".supabase\config.toml" (
    echo ❌ Project not linked to Supabase. Please run 'supabase link --project-ref YOUR_PROJECT_REF' first.
    pause
    exit /b 1
)

echo ℹ️  Checking project status...
supabase status

REM Deploy database migrations
echo.
echo ℹ️  Deploying database migrations...
supabase db push
if %errorlevel% equ 0 (
    echo ✅ Database migrations deployed successfully
) else (
    echo ❌ Failed to deploy database migrations
    pause
    exit /b 1
)

REM Deploy edge functions (if any exist)
if exist "supabase\functions" (
    dir /b "supabase\functions" >nul 2>nul
    if %errorlevel% equ 0 (
        echo ℹ️  Deploying edge functions...
        supabase functions deploy
        if %errorlevel% equ 0 (
            echo ✅ Edge functions deployed successfully
        ) else (
            echo ⚠️  Failed to deploy edge functions
        )
    ) else (
        echo ℹ️  No edge functions to deploy
    )
) else (
    echo ℹ️  No edge functions to deploy
)

REM Generate and update types
echo.
echo ℹ️  Generating TypeScript types for remote database...
supabase gen types typescript > database\types.ts
if %errorlevel% equ 0 (
    echo ✅ TypeScript types generated and saved to database\types.ts
) else (
    echo ⚠️  Failed to generate types
)

REM Verify deployment
echo.
echo ℹ️  Verifying deployment...
supabase db diff
if %errorlevel% equ 0 (
    echo ✅ Database schema is up to date
) else (
    echo ⚠️  Database schema differences detected. Review and apply if necessary.
)

REM Get project details
echo.
echo ℹ️  Getting project details...
for /f "tokens=3" %%i in ('supabase status ^| findstr "Project ref"') do set PROJECT_REF=%%i
for /f "tokens=3" %%i in ('supabase status ^| findstr "API URL"') do set API_URL=%%i
for /f "tokens=3" %%i in ('supabase status ^| findstr "anon key"') do set ANON_KEY=%%i

echo.
echo ✅ Deployment completed successfully!
echo.
echo ℹ️  Project Details:
echo   - Project Reference: %PROJECT_REF%
echo   - API URL: %API_URL%
echo   - Anon Key: %ANON_KEY%
echo.
echo ℹ️  Next steps:
echo 1. Update database/supabase-config.js with the above credentials
echo 2. Test the connection using database/config-checker.html
echo 3. Update your frontend application with the new credentials
echo 4. Test all functionality in production
echo.
echo ⚠️  Security reminders:
echo - Never commit your service role key to version control
echo - Use environment variables for sensitive credentials in production
echo - Review and test all RLS policies
echo - Monitor your database usage and set up alerts

REM Create environment file template
echo.
echo ℹ️  Creating environment template...
(
echo # Supabase Configuration
echo SUPABASE_URL=%API_URL%
echo SUPABASE_ANON_KEY=%ANON_KEY%
echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
echo.
echo # For production deployment
echo NODE_ENV=production
) > .env.example

echo ✅ Environment template created: .env.example
echo ℹ️  Copy .env.example to .env and update with your actual credentials
echo.
pause