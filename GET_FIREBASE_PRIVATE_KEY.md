# How to Get Firebase Private Key

## What You Need

The **Firebase Private Key** is different from the client-side config. It's a service account key for the **Firebase Admin SDK** (used by your backend).

## Step-by-Step Guide

### Step 1: Go to Firebase Console

1. Go to https://console.firebase.google.com
2. Select your project: **north-6da52**

### Step 2: Open Project Settings

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**

### Step 3: Go to Service Accounts Tab

1. Click on **"Service accounts"** tab at the top
2. You'll see "Firebase Admin SDK"

### Step 4: Generate New Private Key

1. Click **"Generate new private key"** button
2. A warning dialog will appear - click **"Generate key"**
3. A JSON file will download (e.g., `north-6da52-firebase-adminsdk-xxxxx.json`)

### Step 5: Extract the Private Key

Open the downloaded JSON file. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "north-6da52",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@north-6da52.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 6: Copy the Values You Need

From the JSON file, you need:

1. **`private_key`** - The entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
2. **`client_email`** - The service account email

## For Render Environment Variables

### FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-xxxxx@north-6da52.iam.gserviceaccount.com
```
(Copy the `client_email` value from the JSON)

### FIREBASE_PRIVATE_KEY
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...entire key content...
-----END PRIVATE KEY-----
```
(Copy the entire `private_key` value from the JSON, including BEGIN and END lines)

**Important:** 
- Keep it as ONE value (don't split into multiple lines in Render)
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- The `\n` characters in the JSON are newlines - Render will handle them

## Alternative: Copy Directly from JSON

You can copy the `private_key` value directly from the JSON file. It will have `\n` characters which Render will convert to actual newlines.

## Security Note

⚠️ **Keep this key secret!**
- Never commit it to Git (already in `.gitignore`)
- Only use it in environment variables
- Don't share it publicly
- If exposed, regenerate it immediately

## Quick Checklist

- [ ] Go to Firebase Console → Project Settings → Service Accounts
- [ ] Click "Generate new private key"
- [ ] Download the JSON file
- [ ] Copy `client_email` → Use for `FIREBASE_CLIENT_EMAIL`
- [ ] Copy `private_key` → Use for `FIREBASE_PRIVATE_KEY`
- [ ] Add both to Render environment variables
- [ ] Restart Render service

## Example

If your JSON has:
```json
{
  "client_email": "firebase-adminsdk-fbsvc@north-6da52.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
}
```

In Render, set:
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@north-6da52.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n`

That's it! 🎉

