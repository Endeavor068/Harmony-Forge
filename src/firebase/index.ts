'use client';

import { firebaseConfig } from '@/firebase/config';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Initialise Firebase avec la configuration explicite (`src/firebase/config.ts`),
 * adaptée au front hébergé sur Vercel, Netlify, etc.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  // Utilise le bucket par défaut de `firebaseConfig` (évite les 403 si le préfixe
  // `gs://…firebasestorage.app` ne correspond pas au bucket réel du projet).
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

export * from './client-provider';
export * from './error-emitter';
export * from './errors';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-login';
export * from './non-blocking-updates';
export * from './provider';

