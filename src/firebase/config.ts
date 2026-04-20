import type { FirebaseOptions } from 'firebase/app';

const defaults: FirebaseOptions = {
  apiKey: 'AIzaSyBW4jwt8hVQ7uXU1Mg06Ppj4_zUYjBezXw',
  appId: '1:1080412997001:web:6d84a90b1a5413d3124d58',
  authDomain: 'studio-2294305185-c0b44.firebaseapp.com',
  projectId: 'studio-2294305185-c0b44',
  storageBucket: 'studio-2294305185-c0b44.firebasestorage.app',
  messagingSenderId: '1080412997001',
};

/**
 * Configuration Firebase côté client (NEXT_PUBLIC_* injectée au build).
 * Les valeurs par défaut correspondent au projet actuel ; surchargez via
 * les variables d’environnement sur Vercel / Netlify si besoin.
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? defaults.apiKey,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? defaults.appId,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? defaults.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? defaults.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? defaults.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    defaults.messagingSenderId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
};
