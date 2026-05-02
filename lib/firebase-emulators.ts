"use client";

import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

let emulatorsConnected = false;

/** Call once from a client component (e.g. dev smoke page) when using local emulators. */
export function connectFirebaseEmulators(): void {
  if (emulatorsConnected || typeof window === "undefined") return;

  const enabled =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "1" ||
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

  if (!enabled) return;

  const authHost =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
  const firestoreHost =
    process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";

  const [fsHost, fsPortRaw] = firestoreHost.includes(":")
    ? firestoreHost.split(":")
    : [firestoreHost, "8080"];
  const fsPort = Number.parseInt(fsPortRaw ?? "8080", 10);

  const app = getFirebaseApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
  connectFirestoreEmulator(db, fsHost, fsPort);
  emulatorsConnected = true;
}
