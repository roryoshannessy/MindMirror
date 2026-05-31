import {
  doc,
  onSnapshot,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getClientDb } from "@/lib/firebase";
import type { AuthClaims } from "@/stores/auth-store";

export function mapUserDocToClaims(
  uid: string,
  firebaseUser: Pick<User, "email" | "displayName">,
  data: DocumentData | undefined,
): AuthClaims {
  if (!data) {
    return {
      uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      billingPlan: "free",
      billingStatus: null,
      billingCustomerId: null,
    };
  }
  return {
    uid,
    email: (data.email as string | null | undefined) ?? firebaseUser.email,
    displayName:
      (data.displayName as string | null | undefined) ??
      firebaseUser.displayName,
    billingPlan: (data.billingPlan as string | undefined) ?? "free",
    billingStatus: (data.billingStatus as string | null | undefined) ?? null,
    billingCustomerId:
      (data.billingCustomerId as string | null | undefined) ?? null,
  };
}

export function subscribeUserDoc(
  uid: string,
  firebaseUser: Pick<User, "email" | "displayName">,
  onUpdate: (claims: AuthClaims | null) => void,
  onSnapshotError?: (error: FirestoreError) => void,
): Unsubscribe {
  const ref = doc(getClientDb(), "users", uid);
  return onSnapshot(
    ref,
    (snap) => {
      onUpdate(mapUserDocToClaims(uid, firebaseUser, snap.data()));
    },
    (error) => {
      // Fall back to the Firebase auth user when the profile mirror is unavailable.
      // This keeps account surfaces usable while preserving the safest billing default.
      onUpdate(mapUserDocToClaims(uid, firebaseUser, undefined));
      console.warn("[subscribeUserDoc]", error);
      onSnapshotError?.(error);
    },
  );
}
