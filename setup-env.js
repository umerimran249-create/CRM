const fs = require('fs');
const path = require('path');

const envContent = `# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=north-6da52
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@north-6da52.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC01Uk/zhaNfV0S\\nXQO6DRDzw93Uoe/qIl3g4qFq8Q45Fl6nP+tnfEKG60qeFZUlqlSfs0DXcm+bAa6a\\nVWcD+N9zuc9xcN2lvWXudUEDA9XRfy/hc7wTiFedb2ymMch3NbMb3P1TYKI7KNIF\\n25GLUFjkPP9cTblHaVjZTdRn88r28Lw2y+pI4TZmMdGDwoYwB88fWOnA/f/VszO1\\nJ6d9X/saBF3KjT6FSc38gxlwQuQIWQ8AL2NPI28i4Dv5UJvZ6I2R/f/mFxMSy3H9\\nMfiKB73wtg0s+HEe+Psk1Y92BLeOXAblRscKyHt1CRc4YXhkefIw86+tYysmzRje\\nniXsUZBfAgMBAAECggEADToMjlfLDoGJuge6EUG9Ahd+TxWiyfb5jUyf9R9TCwBR\\neN16baqJGZVCplpHYbOAieEMPRxoGjTLsKSbUSipYq2UnsrCnsmofjVu+LZIs91T\\nUApHF3N0we83sAnnWWp0HCjURRgsXzQwW7CG7mNSHSxymsdhZffIQYMpcvEO4Q3B\\nj+KhPJ8gMc8F0ekJIEQhB5mBBZfNFdc2WvuoxIglYMzBsR3F9vH1Z/MXlZBlyG8i\\neOe13XFoaBLt54jaNM1hJct5g/sJMCtvGoblLMSZtWuLV2IWIqGQpIFP1dGEJULD\\n3/5Waoj0MduvngIBHsWRDJNKBYyJUgocELPend/9AQKBgQDmmrl/osN/0HLAHN6V\\n/CO177uo6vYSWNsbYXUS5C67f8c8l6IUGxwsd/TyIQ79OVjggMtvSMekUxIXxjR8\\nlfRetO5JPv4lhvmZlZcodAs0z+1R4xXPVIu34bpgbnkxcsHQHRZRWHNOweHSBkub\\nIEYtz1erl8jzet37v46DIADlowKBgQDIv2TmEyCeGN1ALVwr3F5jwNMjJg0VFxpv\\nMex7+rlvUScfQwLiN1daaMIhYOQr5BmTPOGgWmRdyY9yFNer3bISJ5S0zU46MStu\\n0LnuevnMGKR2F0RYZVvT20TSMdrMqsjkmvR5qoFVTtg8/NnBikDvgNKFUkLzY83j\\n+lJ99m3+FQKBgAiFs1FKPJteor8C0h8M4Gz63R6TAGERM5fBdEgscqWvRTeyCuVf\\nUx05ma3RFvK4ydYSLHKCaA5km4iRZKMuD4foe93tHAta/6JzatCt6TQccxLRp56v\\n6zHyf6bMrmHrcco1KPv8ntZMSAIxBV5IRQ+wV/cZdu24nreNDsE9z4qtAoGBAMDZ\\n1WWNtIUM3+gaa3SbZHYyNOOMV38OTc/KxyOnjuMYtBu9NZT6k0mAYBbOzQQ5QjSH\\nhT2V+Nt8mfh/e11ZQgtcyOgUX3VZ7R6tGCG5NCZU+hGUcoz0+o2BFRFU4ZxC6XFs\\nRzZmjY7Viri0M8FRPuaW/CcmCrllBNNhlEP8LFitAoGAZP2a9cJUJAtypRRQUx3P\\nwaCIDAfge1lRm0SKMdRcVJsSJcwTXo0fjhK5VGulkiPXs1JD7SxNEo40ZAK2yWWe\\n1KrCOx7+pzk9hJuohBeZQQkLNksH7RYY4NbkoxRl39IVZ6HN3MrRWq1SHNfnA7j/\\nSPHAkwJQXluEsCE44qc6kDA=\\n-----END PRIVATE KEY-----\\n"
FIREBASE_DATABASE_URL=https://north-6da52-default-rtdb.firebaseio.com

# Server Configuration
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping creation.');
  console.log('   If you want to overwrite it, delete the existing file first.');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📍 Location: ' + envPath);
  console.log('\n⚠️  IMPORTANT: Update JWT_SECRET with a secure random string for production!');
}

