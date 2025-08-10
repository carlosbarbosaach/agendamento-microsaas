import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use variáveis de ambiente (Vite) se quiser ocultar chaves na Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyAfiig_6yLRr9h62pUnHcUthDnyZiWaPz4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'agendamento-info.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'agendamento-info',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'agendamento-info.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '71022110649',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:71022110649:web:105e01860057640678f868',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-LDR1H88KZY',
};

const app = initializeApp(firebaseConfig);

// (opcional) Analytics no browser, sem guardar variável não usada
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  import('firebase/analytics').then(({ getAnalytics }) => {
    try { getAnalytics(app); } catch { /* no-op */ }
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
