# Deployment Guide

This guide will help you deploy your CRM system to production.

## Prerequisites

1. Firebase project set up (already done: `north-6da52`)
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Node.js and npm installed
4. Git (optional, for version control)

## ⚠️ Important: Backend Cannot Run on Firebase Hosting

**Firebase Hosting is for static files only** (HTML, CSS, JavaScript). It cannot run Node.js/Express servers.

You have two options:
1. **Deploy frontend to Firebase Hosting + backend to a separate service** (Recommended - easier)
2. **Convert backend to Firebase Cloud Functions** (More complex, requires refactoring)

## Deployment Options

### Option 1: Firebase Hosting (Frontend) + Separate Backend Hosting

This is the **recommended approach** - easiest and most straightforward.

#### Frontend Deployment (Firebase Hosting)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Build the React app**:
   ```bash
   cd client
   npm run build
   cd ..
   ```

4. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

5. **Your app will be live at**: `https://north-6da52.web.app` or `https://north-6da52.firebaseapp.com`

#### Backend Deployment Options

**Option A: Railway (Recommended - Easy & Free tier available)**
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js
6. Add environment variables from your `.env` file
7. Deploy!

**Option B: Render**
1. Go to [Render.com](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Set:
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
6. Add environment variables
7. Deploy!

**Option C: Heroku**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-crm-backend`
4. Set environment variables: `heroku config:set KEY=value`
5. Deploy: `git push heroku main`

**Option D: Firebase Cloud Functions (Serverless - Requires Refactoring)**

This requires converting your Express app to Firebase Functions. See Option 2 below for details.

### Option 2: Full Firebase Deployment (Frontend + Cloud Functions)

⚠️ **Note**: This requires refactoring your Express backend into Firebase Cloud Functions. This is more complex but keeps everything on Firebase.

For a fully serverless solution:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build frontend**:
   ```bash
   cd client && npm run build && cd ..
   ```

3. **Deploy everything**:
   ```bash
   firebase deploy
   ```

## Environment Variables Setup

### Frontend Environment Variables

Create `client/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_FIREBASE_API_KEY=AIzaSyCNj8Ybj_omepyLsmPEu1viEO7TL6mV5DI
REACT_APP_FIREBASE_AUTH_DOMAIN=north-6da52.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://north-6da52-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=north-6da52
REACT_APP_FIREBASE_STORAGE_BUCKET=north-6da52.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=623273138480
REACT_APP_FIREBASE_APP_ID=1:623273138480:web:bef8d5c618c45c15de10f5
REACT_APP_FIREBASE_MEASUREMENT_ID=G-E8VJG3E9H6
```

### Backend Environment Variables

On your hosting platform, set these variables:
```env
FIREBASE_PROJECT_ID=north-6da52
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@north-6da52.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://north-6da52-default-rtdb.firebaseio.com
PORT=5000
JWT_SECRET=your-secure-random-secret-key-here
DATA_BACKEND=FIREBASE
```

## Post-Deployment Steps

1. **Migrate CSV data to Firebase** (if needed):
   ```bash
   npm run migrate:data
   ```

2. **Create admin user** (if not already created):
   ```bash
   npm run create-admin
   ```

3. **Update CORS settings** in your backend to allow your Firebase Hosting domain

4. **Test the deployment**:
   - Visit your Firebase Hosting URL
   - Try logging in
   - Test all features

## Updating the Deployment

### Frontend Updates
```bash
cd client
npm run build
cd ..
firebase deploy --only hosting
```

### Backend Updates
- Push to your repository (if using auto-deploy)
- Or manually redeploy on your hosting platform

## Troubleshooting

### CORS Errors
Make sure your backend CORS settings allow requests from your Firebase Hosting domain.

### 500 Errors
- Check server logs on your hosting platform
- Verify environment variables are set correctly
- Ensure Firebase credentials are valid

### 403 Errors
- Check user permissions
- Verify JWT_SECRET is set
- Check Firebase Realtime Database rules

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET in production
- [ ] Set up Firebase Realtime Database security rules
- [ ] Enable HTTPS (automatic with Firebase Hosting)
- [ ] Review and restrict CORS origins
- [ ] Set up proper error logging
- [ ] Regular backups of Firebase data

## Firebase Realtime Database Security Rules

Update your Firebase Realtime Database rules in Firebase Console:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'Admin'",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'Admin'"
      }
    },
    "messages": {
      "$conversationId": {
        ".read": "root.child('conversations').child($conversationId).child('participants').hasChild(auth.uid)",
        ".write": "root.child('conversations').child($conversationId).child('participants').hasChild(auth.uid)"
      }
    }
  }
}
```

## Support

For issues or questions, check:
- Firebase Documentation: https://firebase.google.com/docs
- Your hosting platform's documentation
- Server logs for error details

