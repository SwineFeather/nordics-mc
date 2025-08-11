@echo off
echo 🚀 Starting deployment of Nordics MC website...

REM Check if we're in the right directory
if not exist "..\package.json" (
    echo ❌ Error: Please run this script from the server directory
    echo    Make sure you're in the server folder and the parent directory has package.json
    pause
    exit /b 1
)

echo 📦 Building React application...
cd ..
call npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)

echo 🧹 Cleaning webroot...
if exist "server\webroot\*" rmdir /s /q "server\webroot\*"

echo 📁 Copying built files to webroot...
xcopy "dist\*" "server\webroot\" /E /I /Y

echo 🔒 Setting proper permissions...
echo ✅ Deployment complete!
echo 🌐 Your website is now ready to serve from the webroot directory
echo 🚀 Start the server with: start.sh
pause

