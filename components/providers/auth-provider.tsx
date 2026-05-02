"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { subscribeUserDoc } from "@/lib/firestore";
import {
  PENDING_MAGIC_STATE_KEY,
  callHydrateProfile,
} from "@/lib/auth";
import { identifyAnalyticsUser } from "@/lib/analytics";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent } from "@/lib/analytics-consent";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setClaims = useAuthStore((s) => s.setClaims);
  const setProfileStatus = useAuthStore((s) => s.setProfileStatus);
  const setLoading = useAuthStore((s) => s.setLoading);
  const reset = useAuthStore((s) => s.reset);

  const unsubAuth = useRef<(() => void) | null>(null);
  const unsubDoc = useRef<(() => void) | null>(null);
  const hydratedForUid = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setProfileStatus("loading");

    unsubAuth.current = onAuthStateChanged(getClientAuth(), (user) => {
      unsubDoc.current?.();
      unsubDoc.current = null;

      if (!user) {
        hydratedForUid.current = null;
        setClaims(null);
        setProfileStatus("idle");
        setLoading(false);
        reset();
        void import("posthog-js").then((ph) => {
          try {
            ph.default.reset();
          } catch {
            /* optional until PostHog init */
          }
        });
        return;
      }

      setUser(user);
      setProfileStatus("loading");
      identifyAnalyticsUser(user.uid, { email: user.email });

      unsubDoc.current = subscribeUserDoc(
        user.uid,
        user,
        (claims) => {
          setClaims(claims);
          setProfileStatus("ready");
          setLoading(false);
        },
        () => {
          setProfileStatus("error");
          setLoading(false);
        },
      );

      if (hydratedForUid.current !== user.uid) {
        hydratedForUid.current = user.uid;
        void (async () => {
          try {
            const token = await user.getIdToken();
            const pending =
              typeof sessionStorage !== "undefined"
                ? sessionStorage.getItem(PENDING_MAGIC_STATE_KEY)
                : null;
            if (pending) {
              sessionStorage.removeItem(PENDING_MAGIC_STATE_KEY);
            }
            await callHydrateProfile(token, pending);
          } catch (e) {
            console.warn("[auth] hydrate-profile:", e);
            hydratedForUid.current = null;
          }
        })();
      }
    });

    return () => {
      unsubAuth.current?.();
      unsubDoc.current?.();
    };
  }, [reset, setClaims, setLoading, setProfileStatus, setUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onConsent = () => {
      if (getAnalyticsConsent() !== "granted") return;
      const u = getClientAuth().currentUser;
      if (u) identifyAnalyticsUser(u.uid, { email: u.email });
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onConsent);
  }, []);

  return <>{children}</>;
}
