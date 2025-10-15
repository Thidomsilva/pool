import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let db: Firestore | undefined;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (serviceAccount) {
    if (!getApps().length) {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        app = getApps()[0];
    }
    
    if(app) {
        db = getFirestore(app);
    }
} else {
    console.warn("Firebase service account key not found. Firebase Admin SDK will not be initialized.");
}


export { db };
