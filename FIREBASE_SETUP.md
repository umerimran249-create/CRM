# Firebase Setup Instructions

## Client Configuration ✅
The client Firebase configuration is already set up in `client/src/lib/firebase.js` with your project credentials.

## Server Configuration (Required)

To enable Firebase Realtime Database syncing on the server, you need to set up Firebase Admin SDK credentials.

### Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/north-6da52/settings/serviceaccounts/adminsdk)
2. Click on **"Generate new private key"**
3. Download the JSON file (e.g., `north-6da52-firebase-adminsdk-xxxxx.json`)

### Step 2: Extract Values from JSON

Open the downloaded JSON file and extract these values:

```json
{
  "project_id": "north-6da52",
  "client_email": "firebase-adminsdk-xxxxx@north-6da52.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

### Step 3: Create `.env` File

Create a file named `.env` in the **root directory** (same level as `package.json`) with the following:

```env
FIREBASE_PROJECT_ID=north-6da52
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@north-6da52.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour full private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://north-6da52-default-rtdb.firebaseio.com

PORT=5000
JWT_SECRET=your-secret-key-here
```

**Important Notes:**
- Keep the `.env` file in `.gitignore` (already configured)
- The `FIREBASE_PRIVATE_KEY` must include the `\n` characters as shown
- Wrap the private key in double quotes if it contains special characters

### Step 4: Verify Setup

After creating the `.env` file, restart your server:

```bash
npm run server
```

You should see Firebase initialization messages in the console. If you see warnings about missing credentials, double-check your `.env` file.

### Step 5: Migrate Existing CSV Data (one time)

Run the migration script to copy all CSV records into Firebase:

```bash
npm run migrate:data
```

This will populate Firebase Realtime Database with users, clients, projects, tasks, and finance records so the new storage layer has all historical data.

## What Gets Synced to Firebase?

- **Tasks**: All task CRUD operations (create, update, delete, notes, deliverables)
- **Real-time Updates**: Changes are immediately synced to Firebase Realtime Database
- **Data Structure**: Tasks are stored at `/tasks/{taskId}` in Firebase

## Security

- Never commit the `.env` file or service account JSON to version control
- The service account has admin access to your Firebase project
- Keep credentials secure and rotate them periodically

