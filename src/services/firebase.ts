// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let analytics: import('firebase/analytics').Analytics | undefined;

const firebaseConfig = {
  apiKey: 'AIzaSyAfiig_6yLRr9h62pUnHcUthDnyZiWaPz4',
  authDomain: 'agendamento-info.firebaseapp.com',
  projectId: 'agendamento-info',
  storageBucket: 'agendamento-info.firebasestorage.app',
  messagingSenderId: '71022110649',
  appId: '1:71022110649:web:105e01860057640678f868',
  measurementId: 'G-LDR1H88KZY',
};

const app = initializeApp(firebaseConfig);

// Evita erro de analytics fora do browser
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
