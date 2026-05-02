"use client";

import { useEffect, useState } from "react";
import { type FirestoreError, doc, getDoc } from "firebase/firestore";
import { signInAnonymously, type User } from "firebase/auth";
import { brand } from "@/config/brand";
import { connectFirebaseEmulators } from "@/lib/firebase-emulators";
import {
  getClientAuth,
  getClientDb,
  isFirebaseClientConfigured,
} from "@/lib/firebase";

function formatFirestoreError(e: unknown): string {
  if (e && typeof e === "object" && "code" in e) {
    const fe = e as FirestoreError;
    const msg = "message" in e && typeof (e as { message?: unknown }).message === "string"
      ? (e as { message: string }).message
      : "";
    return `${fe.code}: ${msg}`;
  }
  return e instanceof Error ? e.message : String(e);
}

export function FirebaseTestClient() {
  const [user, setUser] = useState<User | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [adminResult, setAdminResult] = useState<string | null>(null);

  const push = (line: string) =>
    setLog((prev) => [...prev, `${new Date().toISOString()}  ${line}`]);

  useEffect(() => {
    try {
      connectFirebaseEmulators();
    } catch (e) {
      setLog((prev) => [
        ...prev,
        `${new Date().toISOString()}  Emulator wiring: ${formatFirestoreError(e)}`,
      ]);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    try {
      return getClientAuth().onAuthStateChanged(setUser);
    } catch (e) {
      setLog((prev) => [
        ...prev,
        `${new Date().toISOString()}  Auth listen: ${formatFirestoreError(e)}`,
      ]);
    }
  }, []);

  if (!isFirebaseClientConfigured()) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-card p-6 text-card-foreground">
        <h1 className="text-lg font-semibold">Firebase (not configured)</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add all{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_FIREBASE_*
          </code>{" "}
          variables from the Firebase console (Web app) to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            .env.local
          </code>
          . See <code className="text-xs">.env.example</code> for{" "}
          {brand.NAME}.
        </p>
      </div>
    );
  }

  const runAdminSmoke = async () => {
    setAdminResult(null);
    try {
      const res = await fetch("/api/dev/firebase-admin-smoke");
      const body = await res.json();
      setAdminResult(JSON.stringify(body, null, 2));
    } catch (e) {
      setAdminResult(formatFirestoreError(e));
    }
  };

  const signIn = async () => {
    try {
      const cred = await signInAnonymously(getClientAuth());
      push(`Signed in anonymously: uid=${cred.user.uid}`);
    } catch (e) {
      push(`Anonymous sign-in failed: ${formatFirestoreError(e)}`);
    }
  };

  const writeMyUserDoc = async () => {
    if (!user) {
      push("Sign in first.");
      return;
    }
    push(
      "Client writes to users/{uid} are disabled by firestore.rules (Admin SDK only). Use hydrate-profile or Stripe webhooks in production.",
    );
  };

  const readMyUserDoc = async () => {
    if (!user) {
      push("Sign in first.");
      return;
    }
    try {
      const snap = await getDoc(doc(getClientDb(), "users", user.uid));
      push(`Read users/${user.uid}: ${JSON.stringify(snap.data() ?? null)}`);
    } catch (e) {
      push(`Read failed: ${formatFirestoreError(e)}`);
    }
  };

  const readSomeoneElse = async () => {
    if (!user) {
      push("Sign in first.");
      return;
    }
    try {
      await getDoc(doc(getClientDb(), "users", "someone_else_uid"));
      push("Unexpected: read succeeded (rules should deny).");
    } catch (e) {
      push(`Expected denial: ${formatFirestoreError(e)}`);
    }
  };

  const signOut = async () => {
    try {
      await getClientAuth().signOut();
      push("Signed out.");
    } catch (e) {
      push(`Sign out failed: ${formatFirestoreError(e)}`);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
      <div>
        <h1 className="text-xl font-semibold">{brand.NAME} · Firebase M2</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dev-only smoke tests. Enable <strong>Anonymous</strong> sign-in in Firebase
          Authentication, deploy <code className="text-xs">firestore.rules</code>, then use the client
          tests. Profile documents are created/merged only via the Admin SDK (e.g.{" "}
          <code className="text-xs">/api/auth/hydrate-profile</code>). Admin smoke writes{" "}
          <code className="text-xs">_dev/m2_admin_smoke</code> (server only).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          onClick={runAdminSmoke}
        >
          Run admin SDK smoke
        </button>
      </div>
      {adminResult ? (
        <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
          {adminResult}
        </pre>
      ) : null}

      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Client session:{" "}
          <span className="font-mono text-foreground">
            {user?.uid ?? "— not signed in —"}
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            onClick={signIn}
          >
            Sign in anonymously
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            onClick={writeMyUserDoc}
          >
            Client write policy (logged)
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            onClick={readMyUserDoc}
          >
            Read users/&#123;me&#125;
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
            onClick={readSomeoneElse}
          >
            Read users/someone_else_uid (expect deny)
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-2 text-sm"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Log</h2>
        <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
          {log.length ? log.join("\n") : "—"}
        </pre>
      </div>
    </div>
  );
}
