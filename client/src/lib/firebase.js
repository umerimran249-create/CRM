import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCNj8Ybj_omepyLsmPEu1viEO7TL6mV5DI',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'north-6da52.firebaseapp.com',
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://north-6da52-default-rtdb.firebaseio.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'north-6da52',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'north-6da52.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '623273138480',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:623273138480:web:bef8d5c618c45c15de10f5',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-E8VJG3E9H6',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics;

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = undefined;
    });
}

export { app, auth, analytics };

