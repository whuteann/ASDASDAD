import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Update this to match your actual path
const serviceAccountPath = resolve(__dirname, 'service-account/serviceAccount.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Service account file not found at ${serviceAccountPath}`);
}

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