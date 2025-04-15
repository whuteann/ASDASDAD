import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });


const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id, // optional, but helpful
  });

  console.log(`[Firebase] Initialized with project: ${serviceAccount.project_id}`);
}

export const firestore = admin.firestore();

export default {
  initializeApp: admin.initializeApp,
  firestore: () => firestore,
};