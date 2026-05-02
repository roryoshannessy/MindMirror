"use client";

import {
  getAdditionalUserInfo,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { brand } from "@/config/brand";
import { getClientAuth } from "@/lib/firebase";
import { recordLeadFromAuth, submitLeadCapture } from "@/lib/lead-capture-client";
import { sanitizeReturnTo } from "@/lib/safe-return-to";

export const EMAIL_FOR_LINK_KEY = `${brand.STORAGE_PREFIX}_email_for_link`;

/** One-shot magic-link payload for hydrate-profile (cleared after read in AuthProvider). */
export const PENDING_MAGIC_STATE_KEY = `${brand.STORAGE_PREFIX}_pending_magic_state`;

export async function signInWithGoogle(locale?: string): Promise<void> {
  const auth = getClientAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const info = getAdditionalUserInfo(result);
  const isNew = info?.isNewUser === true;
  const user = result.user;
  if (user.email) {
    const token = await user.getIdToken();
    void submitLeadCapture({
      email: user.email,
      source: isNew ? "signup" : "login",
      locale,
      firebaseIdToken: token,
    }).then((r) => {
      if (!r.ok) console.warn("[lead-capture] google:", r.error);
    });
  }
}

export async function sendAuthMagicLink(
  email: string,
  returnTo: string,
  source: "login" | "signup",
  locale?: string,
  turnstileToken?: string,
): Promise<void> {
  const res = await fetch("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      returnTo: sanitizeReturnTo(returnTo),
      source,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Magic link request failed (${res.status})`);
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(EMAIL_FOR_LINK_KEY, email.trim());
    recordLeadFromAuth(email.trim(), source, locale, turnstileToken);
  }
}

export async function completeMagicLinkSignIn(): Promise<{ returnTo: string }> {
  if (typeof window === "undefined") {
    throw new Error("completeMagicLinkSignIn is client-only");
  }
  const auth = getClientAuth();
  const href = window.location.href;
  if (!isSignInWithEmailLink(auth, href)) {
    throw new Error("This page is not a valid email sign-in link.");
  }
  const email = window.localStorage.getItem(EMAIL_FOR_LINK_KEY);
  if (!email) {
    throw new Error(
      "Missing saved email for this link. Request a new sign-in email from the login page.",
    );
  }
  await signInWithEmailLink(auth, email, href);
  window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);

  const url = new URL(href);
  const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo") ?? "/");
  const magicLinkState = url.searchParams.get("state");
  if (magicLinkState) {
    sessionStorage.setItem(PENDING_MAGIC_STATE_KEY, magicLinkState);
  }

  return { returnTo };
}

export async function getCurrentIdToken(): Promise<string> {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  return user.getIdToken();
}

export async function signOut(): Promise<void> {
  await getClientAuth().signOut();
}

export async function callHydrateProfile(
  idToken: string,
  magicLinkState: string | null,
): Promise<void> {
  const res = await fetch("/api/auth/hydrate-profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      magicLinkState: magicLinkState ?? undefined,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Hydrate failed (${res.status})`);
  }
}
