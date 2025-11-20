#!/bin/bash

# Deployment script for CRM System
# This script builds the frontend and deploys to Firebase Hosting

echo "🚀 Starting deployment process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "🔐 Checking Firebase login status..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase. Please login:"
    firebase login
fi

# Build the React app
echo "📦 Building React app..."
cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

cd ..

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Your app is live at: https://north-6da52.web.app"
else
    echo "❌ Deployment failed!"
    exit 1
fi

