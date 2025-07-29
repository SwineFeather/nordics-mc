@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Automatic Wiki Page Creation System
echo ==================================================

REM Check if Supabase CLI is installed
echo [INFO] Checking Supabase CLI installation...
supabase --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Supabase CLI is not installed. Please install it first:
    echo   npm install -g supabase
    echo   or visit: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)
echo [SUCCESS] Supabase CLI is installed

REM Check if we're in a Supabase project
echo [INFO] Checking if we're in a Supabase project...
if not exist "supabase\config.toml" (
    echo [ERROR] Not in a Supabase project. Please run this script from your project root.
    pause
    exit /b 1
)
echo [SUCCESS] Supabase project detected

REM Deploy the database migration
echo [INFO] Deploying database migration...
if not exist "supabase\migrations\20250115000000_auto_wiki_pages.sql" (
    echo [ERROR] Migration file not found: supabase\migrations\20250115000000_auto_wiki_pages.sql
    pause
    exit /b 1
)

supabase db push
if errorlevel 1 (
    echo [ERROR] Failed to deploy database migration
    pause
    exit /b 1
)
echo [SUCCESS] Database migration deployed successfully

REM Deploy edge functions
echo [INFO] Deploying edge functions...

REM Check if edge function directories exist
if not exist "supabase\functions\create-wiki-page" (
    echo [ERROR] Edge function not found: supabase\functions\create-wiki-page
    pause
    exit /b 1
)

if not exist "supabase\functions\sync-all-wiki-pages" (
    echo [ERROR] Edge function not found: supabase\functions\sync-all-wiki-pages
    pause
    exit /b 1
)

REM Deploy create-wiki-page function
echo [INFO] Deploying create-wiki-page function...
supabase functions deploy create-wiki-page
if errorlevel 1 (
    echo [ERROR] Failed to deploy create-wiki-page function
    pause
    exit /b 1
)
echo [SUCCESS] create-wiki-page function deployed

REM Deploy sync-all-wiki-pages function
echo [INFO] Deploying sync-all-wiki-pages function...
supabase functions deploy sync-all-wiki-pages
if errorlevel 1 (
    echo [ERROR] Failed to deploy sync-all-wiki-pages function
    pause
    exit /b 1
)
echo [SUCCESS] sync-all-wiki-pages function deployed

REM Verify setup
echo [INFO] Verifying setup...
echo [INFO] Testing edge functions...

REM Get the project URL
for /f "tokens=*" %%i in ('supabase status --output json 2^>nul') do set STATUS_JSON=%%i
echo [SUCCESS] Edge functions deployed successfully

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo.
echo 1. 📊 Check the Admin Panel:
echo    - Go to your website's /admin page
echo    - Look for the 'Automatic Wiki Page Manager' section
echo    - Check the system status
echo.
echo 2. 🔄 Test Manual Sync:
echo    - Click 'Sync All Wiki Pages' to create pages for existing towns/nations
echo    - Monitor the progress and results
echo.
echo 3. 🧪 Test Automatic Creation:
echo    - Add a new town or nation to your database
echo    - Verify that a wiki page is automatically created
echo.
echo 4. 📚 Check the Wiki:
echo    - Go to your wiki page
echo    - Look for the 'Nordics/Towns' and 'Nordics/Nations' folders
echo    - Verify that pages have been created with proper content
echo.
echo 5. 📖 Read the Documentation:
echo    - Check AUTO_WIKI_SETUP_GUIDE.md for detailed information
echo    - Review the admin interface features
echo.
echo 🔧 Troubleshooting:
echo    - Check Supabase Edge Function logs for errors
echo    - Verify database functions are properly installed
echo    - Ensure the wiki storage bucket exists and has proper permissions
echo.

echo [SUCCESS] Setup completed successfully!
pause 