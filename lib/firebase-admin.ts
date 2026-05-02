import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let warnedMissingCredentials = false;

function ensureApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  const json = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (json) {
    return initializeApp({ credential: cert(JSON.parse(json)) });
  }

  if (
    process.env.NODE_ENV === "development" &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !warnedMissingCredentials
  ) {
    warnedMissingCredentials = true;
    console.warn(
      "[firebase-admin] No FIREBASE_ADMIN_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS. " +
        "Admin SDK calls may fail unless Application Default Credentials are configured (e.g. gcloud).",
    );
  }

  return initializeApp();
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function getAdminAuth(): Auth {
  if (!authInstance) {
    ensureApp();
    authInstance = getAuth();
  }
  return authInstance;
}

export function getAdminDb(): Firestore {
  if (!dbInstance) {
    ensureApp();
    dbInstance = getFirestore();
  }
  return dbInstance;
}
