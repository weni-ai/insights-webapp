import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import env from '../env';

const app = initializeApp(env('FIREBASE_CONFIG') || '');
const db = getFirestore(app);

export { db };
