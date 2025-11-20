@echo off
REM Deployment script for CRM System (Windows)
REM This script builds the frontend and deploys to Firebase Hosting

echo 🚀 Starting deployment process...

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Check if logged in to Firebase
echo 🔐 Checking Firebase login status...
firebase projects:list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Not logged in to Firebase. Please login:
    firebase login
)

REM Build the React app
echo 📦 Building React app...
cd client
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    exit /b 1
)

cd ..

REM Deploy to Firebase Hosting
echo 🌐 Deploying to Firebase Hosting...
firebase deploy --only hosting

if %ERRORLEVEL% EQU 0 (
    echo ✅ Deployment successful!
    echo 🌍 Your app is live at: https://north-6da52.web.app
) else (
    echo ❌ Deployment failed!
    exit /b 1
)

