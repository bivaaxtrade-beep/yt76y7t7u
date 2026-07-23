import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let adminAuth: any = null;
let adminDb: any = null;

function createMockDb() {
  const mockDoc = {
    get: async () => ({ exists: false, data: () => ({}) }),
    set: async () => {},
    update: async () => {},
    delete: async () => {},
    add: async () => ({ id: 'mock-id' }),
  };
  const mockCollection: any = {
    doc: () => mockDoc,
    add: async () => ({ id: 'mock-id' }),
    where: () => mockCollection,
    orderBy: () => mockCollection,
    limit: () => mockCollection,
    get: async () => ({ docs: [], empty: true, size: 0, forEach: () => {} }),
  };
  return {
    collection: () => mockCollection,
    settings: () => {},
  };
}

function createMockAuth() {
  return {
    verifyIdToken: async () => ({ uid: 'mock-uid' }),
    getUser: async () => ({ uid: 'mock-uid' }),
  };
}

try {
  let projectId = 'bvaax-trade';
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.projectId) projectId = config.projectId;
  }

  let credential: any = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } catch (e) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT env var');
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
    } catch (e) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_KEY env var');
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }

  // Check if running inside Google Cloud Platform (Cloud Run / App Engine)
  const isGcpEnv = Boolean(process.env.K_SERVICE || process.env.GAE_APPLICATION || process.env.GOOGLE_CLOUD_PROJECT);

  if (credential || isGcpEnv) {
    if (!getApps().length) {
      initializeApp(credential ? { credential, projectId } : { projectId });
    }
    adminAuth = getAuth();
    adminDb = getFirestore();
    adminDb.settings({ ignoreUndefinedProperties: true });
    console.log('✅ Firebase Admin initialized with Google Cloud credentials.');
  } else {
    console.warn('ℹ️ Running on external hosting (e.g. Railway) without Google Cloud service account key. Using in-memory fallback database handler.');
    adminDb = createMockDb();
    adminAuth = createMockAuth();
  }
} catch (e: any) {
  console.warn('⚠️ Firebase Admin initialization warning:', e.message);
  adminDb = createMockDb();
  adminAuth = createMockAuth();
}

export { adminAuth, adminDb };


