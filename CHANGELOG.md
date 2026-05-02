# Pre–M4 remediation log

Adversarial review of **M1 (shell)**, **M2 (Firebase)**, and **M3 (auth)** against `FOUNDATION.md`, security basics, and long-term maintainability. Items are ordered **most critical first**. This file is a checklist to burn down before treating M4 as “green.”

---

## Critical (security or billing integrity)

### 1. Firestore rules allow clients to forge billing state

**Issue:** `firestore.rules` grant `create` and `update` on `users/{userId}` to the signed-in user with **no field-level constraints**. Any client can set `billingPlan`, `billingStatus`, `billingCustomerId`, subscription IDs, etc., to fake a paid account. That contradicts FOUNDATION §11.1 (“billing mirrored from Stripe”) and makes `hasActiveBillingAccess()` untrustworthy if it ever trusts Firestore from the client.

**Fix (directional):**

- **Option A (recommended):** Remove client `create`/`update` on `users` entirely; only allow `read` for `request.auth.uid == userId`. All writes go through Admin SDK (`hydrate-profile`, webhooks, checkout APIs).
- **Option B:** Keep limited client updates but add rules so **billing-related fields cannot change on the client** (immutable unless unchanged, or only writable when missing). New docs must force `billingPlan == "free"` and null billing IDs.

**Status:** Remediated 2026-04-22 — client writes denied; see **Remediation** section below.

---

### 2. Open redirect / unsafe `returnTo` handling

**Issue:** `safeReturnPath` only rejects paths that do not start with `/` or that start with `//`. It does not decode URL-encoded forms, validate against an allowlist, or block scheme tricks browsers might normalize (e.g. `/\evil`, Unicode homoglyphs, etc.). `AuthGuard` builds `returnTo` from `pathname + search` and sends users to login — less severe, but magic-link and callback flows trust server + client `returnTo`.

**Fix:** Centralize redirect validation: decode once, require path-only (strip hostname if present), allowlist known path prefixes (`/`, `/quiz`, `/checkout`, `/account`, …), default to `/` on failure. Use the same helper in `magic-link` route, `completeMagicLinkSignIn`, and `AuthGuard`.

---

### 3. Magic-link endpoint enables abuse and enumeration signals

**Issues:**

- No rate limiting (FOUNDATION M10 defers it, but this endpoint is a spam amplifier: email bombing, cost on Resend/Firebase).
- Error responses and timing may leak whether an email is registered (depending on Firebase Admin behavior and your error mapping).

**Fix:** Add `lib/request-rate-limit.ts` (per IP + email hash) before M4 or as part of M4 lead capture; normalize responses (`{ ok: true }` for any syntactically valid email in production, or always generic messaging). Align with FOUNDATION §10.3 intent.

---

## Architecture & FOUNDATION alignment

### 4. Data-model doc vs implementation: who may write `users`?

**Issue:** FOUNDATION table §11.1 says users collection is “server (Admin SDK only writes; client reads its own).” Implemented rules allow full client writes. Even if the app never calls `setDoc` today (except the dev smoke page), the **rules are the contract** — they should match the architecture you intend.

**Fix:** Reconcile rules + docs: either tighten rules (see §1) or explicitly revise the internal spec to “Admin primary; client may patch non-billing fields” and enforce that in rules.

---

### 5. Provider order vs FOUNDATION §6.2

**Issue:** Spec calls for `NextIntlClientProvider` → `PostHogProvider` → `AuthProvider`. Current tree: `NextIntl` → `AuthProvider` → shell. `instrumentation-client` runs PostHog/Meta stubs; `AuthProvider` calls `posthog.reset()` on sign-out without a guaranteed init order.

**Fix:** Introduce `PostHogProvider` in M4 (or minimal shim now) and nest per FOUNDATION so identity reset and anonymous events behave predictably.

---

### 6. Duplicate and racy hydration

**Issue:** After email sign-in, **both** `AuthCallbackClient` and `AuthProvider` call `hydrate-profile` (callback with `magicLinkState`, provider with `null`). Redundant traffic, possible ordering races, and harder reasoning about “source of truth” for first write.

**Fix:** Single orchestration point: e.g. only `AuthProvider` hydrates, and callback passes `magicLinkState` via `sessionStorage` once, or callback hydrates and provider skips hydrate for that session via a short-lived flag. Prefer one idempotent server merge without relying on ordering.

---

### 7. `isTestUser` derivation is incomplete vs FOUNDATION §20

**Issue:** `hydrate-profile` sets `isTestUser` only when `Host` contains `localhost` or `127.0.0.1`. FOUNDATION also calls out **`dev`-tagged preview origins** and local development broadly. Preview deploys on `*.vercel.app` may incorrectly be treated as **non-test** and later pollute CAPI unless you add another signal (`VERCEL_ENV`, custom header, or explicit env).

**Fix:** Define explicit policy: e.g. `isTestUser = NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview" || host matches …` and document it next to `mergeUserProfileFromHydration`.

---

### 8. `mergeUserProfileFromHydration` overwrites `isTestUser` on every hydrate

**Issue:** Every successful hydrate sets `isTestUser` from the **current** request host. A user could flip the flag by hitting the app from different environments (edge case). May be acceptable if `isTestUser` is defined as “last session context” rather than “sticky forever.”

**Fix:** Decide product rule: **max** (once true, stay true until admin clears) vs **replace** (current). Implement accordingly (transaction or `isTestUser: resource.data.isTestUser || newTest`).

---

## M1 gaps (shell / marketing foundation)

### 9. LaunchUI not integrated

**Issue:** FOUNDATION M1 requires shadcn **and** LaunchUI for marketing sections. Repo has **no** `components/launchui/` (and Hero is custom). Not wrong functionally, but **milestone incomplete** relative to spec.

**Fix:** Add LaunchUI registry components or formally drop LaunchUI from MindMirror’s fork and update the playbook doc so juniors aren’t misled.

---

### 10. shadcn surface area is minimal

**Issue:** Only `components/ui/button.tsx` exists; login uses raw `<input>`. M1 implied primitives (`input`, `label`, `card`, …). Inconsistent UX and duplicated styling.

**Fix:** `npx shadcn@latest add input label card form` (or equivalent) and refactor `LoginForm` to match.

---

### 11. `config/theme.ts` exists but is not the single source of truth for CSS

**Issue:** Theme tokens live in `config/theme.ts` **and** duplicated in `app/globals.css` `:root`. Drift risk.

**Fix:** Either generate CSS variables from `theme.ts` at build time, or document “CSS is canonical; TS is for programmatic use only” and sync manually.

---

## M2 gaps (Firebase)

### 12. Admin bootstrap without credentials

**Issue:** `ensureApp()` calls `initializeApp()` with no credential when `FIREBASE_ADMIN_CREDENTIALS` is absent. Local/dev may rely on ADC or fail only at first Admin call — behavior is environment-dependent and opaque.

**Fix:** Fail fast with a clear error in dev when Admin is required and credentials missing; document ADC path for Vercel explicitly in `.env.example`.

---

### 13. Dev routes in production builds

**Issue:** `/[locale]/dev/firebase-test` is prerendered; the page calls `notFound()` when `NODE_ENV === "production"`. Route still ships in the build output (noise, minor surface). `/api/dev/*` returns 404 in production — good.

**Fix:** Optional: exclude dev routes via `process.env.VERCEL_ENV` or move under a dynamic segment that is not statically generated; or accept as-is.

---

### 14. `decodeMagicLinkState` is Node-only (`Buffer`)

**Issue:** `lib/magic-link-state.ts` uses `Buffer` for decode. Safe today because only server imports decode. If someone imports decode in a client bundle later, it breaks.

**Fix:** Split `magic-link-state.server.ts` / `.shared.ts` or use `Uint8Array` + `TextDecoder` in shared code.

---

## M3 gaps (auth)

### 15. Email sender branding hard-coded

**Issue:** `lib/email-sender.ts` uses ``MindMirror <${from}>`` literal instead of `brand.NAME` — drifts if `config/brand.ts` changes.

**Fix:** Use ``${brand.NAME} <${from}>`` (and consider reading display name from brand if you add it).

---

### 16. `.env.example` implies Resend without explaining failure mode

**Issue:** Default `EMAIL_SENDER_PROVIDER=http` without a key causes magic-link to **throw** in production-like runs. Dev without provider logs email — good — but the example file reads like “copy and go.”

**Fix:** Comment that `http` requires `EMAIL_SENDER_API_KEY`, or leave provider empty in example and document two paths (dev log vs Resend).

---

### 17. Firestore subscription error handling is silent

**Issue:** `subscribeUserDoc` passes an error callback that maps to “no data” claims. Real permission or network errors look like an empty profile, not `profileStatus: "error"`.

**Fix:** Surface errors to `AuthProvider` (`setProfileStatus("error")`, toast, retry).

---

### 18. Auth callback + Strict Mode / unmount

**Issue:** `AuthCallbackClient` runs async sign-in in `useEffect`; cleanup sets `cancelled` but does not abort Firebase. In React Strict Mode double-mount, duplicate work or warnings are possible.

**Fix:** Guard with ref, or move completion to a dedicated route handler pattern Firebase documents; avoid duplicate `signInWithEmailLink` calls.

---

### 19. `lib/user-defaults.ts` is dead code

**Issue:** `getClientUserDefaults` is never imported. Suggests an abandoned path (client bootstrap).

**Fix:** Remove or wire into a deliberate client merge strategy after rules are tightened.

---

### 20. `AuthGuard` is unused

**Issue:** Component exists but no route wraps it yet. Easy to forget when adding paid routes.

**Fix:** Wire on `/account/*` (M3/M5+) or add a comment in `FOUNDATION` milestone checklist; otherwise remove until needed to avoid false sense of protection.

---

## Cross-cutting

### 21. `instrumentation-client` runs no-op analytics

**Issue:** `lib/attribution.ts`, `lib/posthog.ts`, `lib/meta-pixel.ts` are stubs. Acceptable before M4, but every page load still invokes them — noise when debugging.

**Fix:** M4 implements real capture; until then optional early-return behind env flag.

---

### 22. Magic-link email HTML is not escaped for `link`

**Issue:** Firebase-generated URL should be safe; if ever templated with user input, XSS risk. Current code is OK; keep discipline when editing templates.

---

## Suggested burn-down order before M4

1. **Firestore rules** — billing immutability or Admin-only writes (§1).  
2. **Redirect / returnTo** hardening (§2).  
3. **Hydration** single-path + optional `magicLinkState` handoff (§6).  
4. **Rate limit** `POST /api/auth/magic-link` (§3).  
5. **PostHog provider order** + real `initPostHog` (§5 + M4).  
6. **isTestUser** policy (§7–8).  
7. M1 polish: LaunchUI decision, shadcn inputs (§9–10).  
8. Clean up dead code and branding nits (§15, §19, §20).

---

## Remediation (2026-04-22)

Burn-down completed for pre–M4; treat items below as implemented unless noted.

| Area | Change |
|------|--------|
| §1–4 Firestore / billing | `firestore.rules`: clients may **read** `users/{uid}` when `request.auth.uid == userId`; **create/update/delete** denied (Admin SDK only). |
| §2 `returnTo` | `sanitizeReturnTo` in `lib/safe-return-to.ts`: allowlisted prefixes, `/auth`, locale-stripped policy check (`/[locale]/...`). |
| §3 Magic-link abuse | `lib/request-rate-limit.ts` + limits on `POST /api/auth/magic-link`. |
| §5 Providers | `app/[locale]/layout.tsx`: `NextIntlClientProvider` → `PostHogProvider` → `AuthProvider`. |
| §6 Hydration | Single hydrate via `AuthProvider` + `sessionStorage` handoff for magic-link state. |
| §7–8 `isTestUser` | Sticky OR + preview / non-production signals in `lib/is-test-user.ts` + `lib/user-hydration.ts`. |
| §9 LaunchUI | Deferred; documented in `components/launchui/README.md`. |
| §10 shadcn | `input`, `label`, `card` added; `LoginForm` uses them + `sanitizeReturnTo`. |
| §11 Theme | Comment in `app/globals.css` on CSS vs `config/theme.ts`. |
| §12 Admin bootstrap | Dev warning in `lib/firebase-admin.ts` when credentials missing. |
| §13 Dev routes | `export const dynamic = "force-dynamic"` on dev Firebase test page. |
| §14 Magic-link state | `lib/magic-link-state.server.ts` (Node `Buffer`); types in `magic-link-state.types.ts`. |
| §15 Email branding | `brand.NAME` in Resend `from` (`lib/email-sender.ts`). |
| §16 `.env.example` | Documents dev log mode (unset provider), Resend path, `NEXT_PUBLIC_ANALYTICS_DISABLED`. |
| §17 Firestore errors | `subscribeUserDoc` error path → `profileStatus: "error"` in `AuthProvider`. |
| §19 Dead code | Removed `lib/user-defaults.ts`; FOUNDATION references updated. |
| §20 `AuthGuard` | Wired: `app/[locale]/account/layout.tsx` + welcome `account/page.tsx`. |
| §21 Analytics | Real PostHog init + env kill-switch; attribution / pixel respect `NEXT_PUBLIC_ANALYTICS_DISABLED`. |
| §22 Email HTML | `escapeHtml` for magic-link template where applicable. |

---

## M4 adversarial review (pre–M5)

Zealous pass over **lead capture, attribution, PostHog, Meta Pixel**, and **`resolveCommercialAttribution`** — architecture and abuse model first, implementation second. Ordered **roughly by severity**.

### A. Abuse, trust boundary, and cost

1. **`POST /api/lead/capture` is unauthenticated and trusts the client**  
   Anyone who can hit the deployment can **create or refresh `leads/{normalizedEmail}`** for arbitrary addresses. That enables **list stuffing**, **harassment** (“subscribe” rivals or individuals to your funnel DB), and **cost pressure** (Firestore writes + downstream processing). There is no shared secret, CAPTCHA, proof-of-work, or “only after magic-link token” binding. **Rate limiting is in-process per instance** (`lib/request-rate-limit.ts`), so on Vercel it **does not globalize** across isolates without Redis / KV / edge limits.  
   *Directional fixes:* stricter limits + shared store; optional **signed nonce** from a prior step; **turnstile** on high-value forms; or accept risk and **monitor + alert** on write volume per IP.

2. **Attribution and identity signals are fully forgeable**  
   `posthogDistinctId`, `posthogSessionId`, `metaFbp`, `metaFbc`, `attribution`, `funnelSessionId`, and `entryUrl` are **whatever the browser sends**. A script kiddie can poison your lead docs and any future pipeline that trusts them for CAPI dedupe or “truth.” That may be **acceptable** for marketing-only use if **server-side** events always re-derive or treat leads as **hints**, not ground truth — but the architecture should say so explicitly.

3. **Response shape and errors**  
   Success returns `{ ok: true, leadId }` (normalized email). That **confirms** the server accepted and keyed that address — small **enumeration / existence** signal vs a constant `{ ok: true }`. **400** responses may include Zod **`details`** — useful in dev, noisy and slightly **information-leaky** in production. Align with magic-link policy: generic body in prod vs verbose in dev.

### B. Data model and FOUNDATION alignment

4. **`source` is overwritten on every merge**  
   `buildLeadRecord` always sets `source` to the latest POST (`login`, `signup`, etc.). A user who **signed up** then later hits **login** can **lose** the original funnel source for reporting unless you store **`originalSource`** or an append-only event log. FOUNDATION implies “server records signup on the lead” — today that is **not durable** across later captures.

5. **`CommercialAttributionContext` drops Google / Microsoft click ids**  
   `AttributionTouch` carries **`gclid`** and **`msclkid`**, but `CommercialAcquisition` and `touchToAcquisition` in `lib/attribution-server.ts` **never map them**. Anything that consumes `resolveCommercialAttribution` for paid social + **Search** will be **blind** to non-Meta networks unless you extend the commercial model (or persist full `lastTouch` blobs server-side).

6. **`resolveCommercialAttribution` is unproven against real data**  
   It is **not yet called** from checkout or webhooks in M4. The **funnel-session query** duplicates the direct lead, burns reads, and may eventually need an **index** or tighter query as `leads` grows. **Acquisition merge** uses **first non-null per field across layers** — that is **not** the same as “first-touch object wins as a unit”; two fields could come from **different** layers, which may or may not match product intent.

7. **Google OAuth never hits lead capture**  
   **Magic-link** paths call `recordLeadFromAuth`; **Google sign-in** does not. FOUNDATION’s “signup records source on lead” is **inconsistent** across auth providers unless hydrate or a dedicated step writes the lead.

### C. Privacy, compliance, and product risk

8. **No consent gate before Pixel / PostHog**  
   Meta Pixel and PostHog load (when env allows) **without** a CMP / consent layer. For **EU/UK** users this is a **GDPR / ePrivacy** exposure unless the site is strictly non-EU or you defer init until consent (FOUNDATION defers deep legal design — still a **launch blocker** for many teams).

9. **`identify` sends PII to vendors**  
   `identifyAnalyticsUser` passes **email** to PostHog and sets Meta **`userId`** to the Firebase **uid** (and Pixel may associate sessions). That is standard for growth stacks but is **not neutral**: DPIAs, vendor DPAs, and **“identified_only”** PostHog config should be documented for whoever owns compliance.

### D. Client analytics correctness

10. **Meta Pixel loader race**  
    In `injectPixelScript`, if the **script tag with `SCRIPT_ID` already exists** but **`fbq` is not yet defined** (slow load, interrupted network), the promise **resolves immediately**. `ensureMetaPixelReady` may then **skip `init`** or **PageView** until a later navigation — **silent under-counting**.

11. **Dual bootstrap**  
    `instrumentation-client.ts` runs `captureAttribution`, `initPostHog`, `initPixel`; `PostHogProvider` runs **`onAnalyticsRouteChange`** again on mount. First paint can **double-call** attribution capture (usually idempotent for last-touch) and relies on **idempotent** PostHog init — workable but **harder to reason about** and slightly wasteful.

12. **`$current_url` vs browser URL**  
    PostHog pageviews use **`pathname` + `searchKey` from the Next router**, not necessarily `window.location.href` (origin, hash, rare mismatches with proxies). Expect **small discrepancies** vs server logs or Meta.

13. **`get_session_id` is best-effort**  
    Session id is read via a **cast**; if the SDK version or config omits it, **`posthogSessionId` on leads may often be null** — fine if documented.

### E. Smaller code / ops notes

14. **`quiz` body field is unbounded**  
    `z.record(z.string(), z.unknown())` can approach **Firestore document size limits** or stress parsing; M7 should cap depth/size or validate a **narrow schema**.

15. **Dev-only lead test page**  
    `/dev/lead-capture-test` is **`notFound` in production** — good. Ensure it is never linked from public nav.

16. **Firestorm rules**  
    `leads` remain **server-only** via default deny — consistent with FOUNDATION.

---

### Suggested burn-down before or during M5

1. Decide **abuse posture** for `/api/lead/capture` (shared rate limit store, CAPTCHA, or signed flow).  
2. Persist **original `source`** (or event log) so later `login` captures do not erase signup semantics.  
3. Extend **`CommercialAcquisition`** (or store raw `attribution` snapshot) for **gclid / msclkid** if Search matters.  
4. Fix **Meta script `getElementById` early-resolve** race; add a **single** “analytics bootstrap” story (instrumentation vs provider).  
5. Add **Google OAuth** lead/stitch parity (or document intentional gap).  
6. **Consent-gated** analytics for jurisdictions that require it.  
7. Normalize **lead API** success/error payloads for production.

---

## M4 remediation (2026-04-23)

| Theme | Change |
|------|--------|
| **Trust & abuse (A1–3)** | Per-**IP** rate limit bucket (`buildLeadCaptureIpOnlyRateLimitKey`, 24/10m) plus existing composite limit. Optional **Cloudflare Turnstile** when `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set; **Firebase ID token** on the request verifies email and **bypasses** Turnstile (Google sign-in + future authed clients). Lead docs include **`clientSignalsProvenance: browser_unverified`** (`lib/lead-provenance.ts`). Production API responses: **`{ ok: true }`** without `leadId`; **400/403/500** bodies generic in production (no Zod `details`). |
| **Data integrity (B4–7)** | **`source`** = first capture only (immutable); **`lastCaptureSource`** updated on merge. **`gclid` / `msclkid`** on `CommercialAcquisition`, `touchToAcquisition`, optional user fields `attributionGclid` / `attributionMsclkid`. **`resolveCommercialAttribution`** skips duplicate lead doc in funnel query; **JSDoc** clarifies per-field acquisition merge. **Google OAuth** calls `submitLeadCapture` with **ID token** after `getAdditionalUserInfo` (signup vs login). Magic-link path passes **Turnstile token** from `LoginForm` when configured. |
| **Privacy (C8–9)** | **`NEXT_PUBLIC_ANALYTICS_REQUIRES_CONSENT`** + bottom **`AnalyticsConsentBanner`**; PostHog/Meta init and pageviews only after **granted** (`lib/analytics-consent.ts`, `analytics-consent-subscribe.ts`). **`NEXT_PUBLIC_ANALYTICS_SEND_PII=0`** strips email from PostHog `identify` and **skips Meta `userId`**. **`AuthProvider`** re-runs identify when consent flips to granted. |
| **Correctness (D10–12)** | **`instrumentation-client.ts`** only **`captureAttribution()`**; PostHog + Pixel bootstrap solely from **`PostHogProvider`**. **Meta** script path **polls up to 15s** for `fbq` if tag exists early. **`$current_url`** uses **`window.location.href`** (no hash) when available. |
| **Ops (E14–15)** | **`quiz`** Zod refine: JSON **≤ 24KB**. Dev lead test page documents **no public nav**; Turnstile when site key set. |

**Residual (not “solved” in code):** in-memory limits are still **not distributed** across serverless instances; add Redis/KV for global quotas in M10+. DPIA / vendor DPAs remain a **process** requirement (documented in `.env.example`).

*Review dates: pre–M4 remediation 2026-04-22; M4 adversarial pass + remediation 2026-04-23. Revisit after each milestone merge.*

---

## M7 adversarial review (pre–M8)

Zealous pass over **quiz flow, quiz store, lead capture API, quiz/complete API, results wall, analytics events, and rate limiting** — architecture first, code second. Ordered by severity. Nothing here is cosmetic.

---

### CRITICAL — Fix before any production traffic

#### 1. Rate limiter is an illusion in production

**File:** `lib/request-rate-limit.ts`

The rate limiter uses an in-memory `Map`. On Vercel (serverless), every cold start gets a fresh process with an empty map. There is no shared state across invocations. The limiter only works on a single local dev process. Both `/api/lead/capture` and `/api/quiz/complete` are wide-open spam targets in production — the M4 review noted this exact residual and deferred it to M10. That was acceptable then; it is not acceptable now that ads are imminent.

**Fix:** Replace the in-memory store with Upstash Redis or Vercel KV before any paid traffic. The existing `checkRateLimit` interface is fine — swap the backing store, not the API. This is M10 work that must be pulled forward.

---

#### 2. Turnstile will silently break all quiz submissions the moment you add the secret key

**Files:** `components/quiz/gate-email.tsx`, `lib/turnstile-verify.ts`, `components/turnstile/cloudflare-turnstile.tsx`

`verifyTurnstileToken` correctly gates on `TURNSTILE_SECRET_KEY` being set. The client-side email gate sends no Turnstile token. When someone correctly adds `TURNSTILE_SECRET_KEY` to production env vars, every quiz submission returns 403 and lead capture is dead — with no error in the UI explaining why.

The Turnstile widget is fully built and sitting unused in `components/turnstile/cloudflare-turnstile.tsx`.

**Fix:** Wire `CloudflareTurnstile` into `gate-email.tsx` now. It's already built — this is a one-component addition. Alternatively, add a loud code comment on `verifyTurnstileToken` warning against setting the env var until the widget is rendered, but that's a band-aid.

---

### HIGH — Architectural decisions with real consequences

#### 3. Two API calls hit the same Firestore document per conversion — race condition and doubled rate limiting

**Files:** `components/quiz/gate-email.tsx`, `components/quiz/completion-shell.tsx`, `app/api/lead/capture/route.ts`, `app/api/quiz/complete/route.ts`

Every quiz conversion makes two sequential writes to `leads/{email}`:

1. `/api/lead/capture` — fires at the email gate. Writes the lead doc.
2. `/api/quiz/complete` — fires on the results wall, within seconds. Reads the same doc, then merges into it.

Both routes run the same rate limit checks against the same keys in the same 10-minute window. The second call doubles the rate counter for the same user — a user who converts legitimately consumes 2 of 8 email+IP slots and 2 of 24 IP slots.

More critically: both do `ref.get()` then `ref.set()` without a transaction. In React StrictMode (two mounts of `CompletionShell`) or on slow connections, two concurrent requests to `/api/quiz/complete` race on the same doc.

The deeper issue: the full quiz payload is already available at the email gate — `quizPayload` is passed into `GateEmail`. There is no reason to split this into two calls. `/api/lead/capture` already accepts a `quiz` field.

**Fix:** Merge the completion payload into the `/api/lead/capture` call by passing the full quiz data with `stage: "complete"`. Delete `/api/quiz/complete` and the `runComplete` effect from `CompletionShell`. One write, one round trip, no race, no doubled rate limit.

---

#### 4. Email and name are persisted to localStorage — shared-device privacy leak

**File:** `stores/quiz-store.ts`, `partialize` function

`partialize` persists `email` and `firstName` with a 24h TTL. On a shared device, the next person who visits `/quiz` sees the previous user's personalized results page: *"Sarah, here's what your mind keeps doing."* `ensureFreshSession` only resets on TTL expiry — there is no "user has left results" guard.

**Fix:** Remove `email` and `firstName` from `partialize`. These fields only need to exist in memory for the duration of the quiz session. If a user reloads mid-quiz, re-entering name and email is a trivial cost against a real privacy exposure. The session ID, answers, phase, and node stack are what actually need persisting for back-navigation.

---

#### 5. `quiz_started` fires on every component mount — analytics are inflated

**File:** `components/quiz/quiz-experience.tsx` (line 44–53)

`startedRef` prevents double-firing within a single component mount, but the ref is local to the component instance. Every time a user navigates away from `/quiz` and returns, the component unmounts and remounts, `startedRef` resets, and `quiz_started` fires again with the same persisted `sessionId`.

A user who visits the home page, goes to `/quiz`, goes back, then returns to `/quiz` generates two `quiz_started` events for one quiz attempt. At any ad traffic volume, this corrupts the funnel metric you're running the whole milestone to measure.

**Fix:** Gate the event on `phase === "quiz" && nodeStack.length === 1` AND persist a `startFired` flag in the quiz store (alongside the session). Only fire when both conditions are true and the flag is not yet set.

---

#### 6. `quiz_completed` fires on backend sync success, not on user reaching results

**File:** `components/quiz/completion-shell.tsx` (line 86–88)

`quiz_completed` is captured inside the `try` block of `runComplete`, after `fetch` succeeds. If the API call fails (network error, Firestore blip), `quiz_completed` never fires — even though the user reached the results wall, saw their pattern, and is looking at the checkout CTA.

The event tracks "backend sync succeeded," not "user completed quiz." Your conversion funnel in PostHog is undercounting completions by exactly the failure rate of `/api/quiz/complete`.

**Fix:** Fire `quiz_completed` immediately on entering the results phase — either in the `enterResults()` store action or at the top of `CompletionShell` before the sync attempt. Track sync failure separately as `quiz_sync_failed` if you need that signal.

---

#### 7. PostHog events are missing `sessionId` — funnel analysis per session is impossible

**Files:** `components/quiz/quiz-experience.tsx` (line 49), `components/quiz/gate-email.tsx` (line 72), `components/quiz/completion-shell.tsx` (line 86)

- `quiz_started` sends `{ quizId, locale }` — no `sessionId`
- `email_captured` sends `{ source: "quiz" }` — no `sessionId`
- `quiz_completed` sends `{ quizId }` — no `sessionId`

Without a shared `sessionId` across events, you cannot join these events in PostHog to build a per-user funnel. You can only count totals. Drop-off between questions is invisible. This defeats the core purpose of instrumenting a conversion funnel.

**Fix:** Add `sessionId` (from the quiz store) to every quiz-related PostHog event. It's already in scope at all three locations.

---

### MEDIUM — Correctness and maintainability

#### 8. `quiz` namespace in `en.json` is empty — all quiz copy is hardcoded in the config

**Files:** `messages/en.json` (line 102), `config/quiz.ts`

```json
"quiz": {}
```

Every question title, interstitial headline, gate subtitle, and theater step is hardcoded in `config/quiz.ts`. This is inconsistent with the i18n pattern used everywhere else. Copy changes require a code deployment. Adding any second locale would require refactoring the config entirely.

**Fix:** Move quiz node copy into `messages/en.json` under `"quiz"` keys and resolve them at render time via `useTranslations`. Not a blocker for M8 but must be resolved before any locale expansion or non-engineer copy editing.

---

#### 9. `buildCompletionQuizRecord()` is called twice in the same request

**File:** `app/api/quiz/complete/route.ts` (lines 96–104 and 141–147)

The function is called identically twice: once to stringify and check byte length, once to build the actual object. The second call is invisible and produces the same result.

**Fix:**
```ts
const quiz = buildCompletionQuizRecord({ ... });
const quizString = JSON.stringify(quiz);
if (quizString.length > QUIZ_JSON_MAX_BYTES) { ... }
// use quiz directly below — don't call buildCompletionQuizRecord again
```

---

#### 10. `gate_email.next.fallback = "theater"` is dead config

**File:** `config/quiz.ts` (line 201–203)

The email gate never calls `goForward()` — it calls `enterTheater()` directly via `onSuccess`, bypassing node routing entirely. `getNextNodeId` is never called on the `gate_email` node. The config says the graph goes `gate_email → theater`, but the actual transition is a hardcoded side channel.

This creates a false map — a developer reading the config to understand flow will be misled about how the `theater` phase is entered.

**Fix:** Remove the `next` field from `gate_email` in the config and add a comment explaining the transition is handled by `enterTheater()` which guards on `last === "gate_email"`.

---

#### 11. `onSuccess(email: string)` signature on `GateEmail` is a lie

**Files:** `components/quiz/gate-email.tsx` (line 28), `components/quiz/quiz-experience.tsx` (line 152)

The prop promises to pass email to the parent. The only caller ignores it:
```tsx
onSuccess={() => { enterTheater(); }}
```
The email is already in the store before `onSuccess` fires (`setEmailStore(data.email)` runs first). The parameter is dead noise that implies a contract that isn't honored.

**Fix:** Change the signature to `onSuccess: () => void`.

---

#### 12. `QUIZ_FAQ` export in `config/quiz.ts` is dead code

**File:** `config/quiz.ts` (lines 332–338)

`QUIZ_FAQ` is defined and exported but never imported anywhere. `completion-shell.tsx` renders FAQ questions directly from `useTranslations("faq")`. 

**Fix:** Delete it.

---

#### 13. Social proof number "4,200+" is hardcoded in three separate places

**Files:** `config/quiz.ts` (line 268), `components/quiz/completion-shell.tsx` (line 140), `messages/en.json` (lines 23, 52)

When this number needs updating, three files require changes. One will be missed. This has already happened — `en.json` says "4,200+ active journallers" in one place and the results wall says "Trusted by 4,200+ founders and professionals."

**Fix:** Define it once in `config/brand.ts` as a named constant and reference it everywhere.

---

#### 14. Sync failure leaves a permanent amber banner with no retry action

**File:** `components/quiz/completion-shell.tsx` (lines 80–82, 116)

When `/api/quiz/complete` fails, the amber banner says: *"Could not sync. You can still continue to checkout."* There is no retry button. `startedRef.current = false` is reset on failure, which enables a retry — but `useEffect` doesn't re-trigger because `runComplete`'s identity hasn't changed. The banner is permanent until manual reload.

This means every user who hits a network blip during the 3.5s theater sees a permanent warning banner on their results page. The quiz answers and attribution data are also lost for that conversion.

**Fix:** Add an explicit `<button onClick={() => { startedRef.current = false; void runComplete(); }}>Retry</button>` alongside the amber error message.

---

### LOW — Polish and hygiene

#### 15. `buildLeadCapturePayload` has a side effect hidden inside a builder

**File:** `lib/analytics.ts` (line 54)

```ts
const funnelSessionId = getOrCreateFunnelSessionId();
```

`getOrCreateFunnelSessionId()` writes to localStorage if no session exists. A function named `buildLeadCapturePayload` should not have observable storage side effects. This makes the function surprising and untestable.

**Fix:** Call `getOrCreateFunnelSessionId()` at the call site before invoking the builder, then pass `funnelSessionId` as a parameter.

---

#### 16. Quiz layout `min-h` is dead CSS

**File:** `app/[locale]/quiz/layout.tsx`

```tsx
<div className="min-h-[min(100dvh,800px)]">{children}</div>
```

`TheaterScreen` already sets its own `min-h-[min(100dvh,640px)]` and `CompletionShell` has `py-8 pb-24`. The layout wrapper height constraint adds nothing visible and conflicts with the theater's own constraint.

**Fix:** Remove the `min-h` from the layout wrapper or replace with a simpler `min-h-screen`.

---

### What does NOT need changing

- The node-graph architecture in `config/quiz.ts` is clean. The type system, `getNextNodeId` routing logic, and rule-based branching are all correct and extensible.
- The Zustand store's `nodeStack` approach for back-navigation is correct.
- The `partialize` pattern (selective persistence) is the right design — just applied to the wrong fields.
- `firebase-admin.ts` singleton + lazy-init pattern is correct.
- Zod validation on both API routes is thorough.
- `CLIENT_SIGNALS_PROVENANCE = "browser_unverified"` labeling on untrusted fields is the right trust boundary design.
- Turnstile bypass via Bearer token for authenticated users is architecturally correct.
- The `TheaterScreen` async step loop with cancellation on unmount is correct.

---

### Burn-down order before M8

1. **Rate limiter** — swap in-memory store for Redis/Upstash (§1). Without this, M8 CAPI will have no real abuse protection.
2. **Wire Turnstile** into `gate-email.tsx` (§2). The widget is already built.
3. **Merge lead capture + quiz completion** into one API call (§3). Eliminates the race, halves Firestore writes.
4. **Remove `email`/`firstName` from store persistence** (§4). Privacy fix, zero UX cost.
5. **Fix PostHog events**: add `sessionId` to all three events (§7), fix `quiz_started` mount guard (§5), move `quiz_completed` to phase entry (§6).
6. **Dead code cleanup**: `QUIZ_FAQ` (§12), `gate_email.next` (§10), `onSuccess` signature (§11).
7. **Social proof constant** in `brand.ts` (§13).
8. **Retry button** on sync failure banner (§14).

*Review date: M7 adversarial pass 2026-04-25.*

---

## M5–M7 adversarial review (pre–M8) — 2026-04-26

Zealous end-to-end pass covering **Stripe sync (M5), Checkout flow (M6), and Quiz (M7)** with
every route, store, config, and component read. Architecture first, code second. Items ordered
by blast radius.

---

### BLOCKERS — These will silently produce wrong results in production

#### B1. Catalog and pricing are entirely wrong

**Files:** `generated/stripe-product-data.json`, `config/commercial-catalog.ts`

The placeholder catalog has one plan — "starter-monthly" at **$29.00/mo** — which contradicts
the spec on every dimension:

| | Spec | Placeholder |
|---|---|---|
| Monthly plan ID | `mindmirror-monthly` | `starter-monthly` |
| Monthly price | $12.99/mo | $29.00/mo |
| Annual plan ID | `mindmirror-annual` | _missing_ |
| Annual price | $79.99/yr | _missing_ |
| Annual trial | 7-day (highlighted) | — |
| `catalog_default_plan_id` | `mindmirror-monthly` | `starter-monthly` |

The CTA in `completion-shell.tsx` hardcodes "Start your 7-day free trial — $0 today" but only
the annual plan has a trial per spec. The monthly plan at $12.99 has no trial. Users entering
the funnel will see the wrong price on every checkout page.

**Fix:** Create the two Stripe products with correct prices, lookup keys
(`mindmirror_monthly`, `mindmirror_annual`), `internal_id` metadata, and trial days. Run
`npm run stripe:sync`. Verify the generated JSON matches spec before proceeding.

---

#### B2. Browser Pixel and CAPI event IDs never match — every purchase counted twice

**Files:** `lib/checkout-analytics.client.ts`, `app/api/cron/capi-batcher/route.ts`

Meta deduplicates browser Pixel events against CAPI events using `eventID`. The two sides
generate structurally incompatible IDs:

```
Browser Pixel:  purchase_{uid}_{subscriptionId}
CAPI batcher:   purchase_{sha256(uid:invoiceId).slice(0,16)}
```

These will never be equal for the same event. Every purchase will appear twice in Meta Events
Manager. The CAPI batcher exists solely to prevent this — it is currently defeating its own
purpose.

**Fix:** Pick one canonical anchor. Best option: store `invoiceId` on the checkout session
document when the webhook fires, surface it through the `/api/checkout/resume` response, and
use `sha256(uid:invoiceId).slice(0,16)` on both sides. The batcher already has the right
algorithm — the browser side needs to match it.

---

#### B3. No rate limiting on `/api/checkout/confirm-email`

**File:** `app/api/checkout/confirm-email/route.ts`

This route creates a **Firebase Auth user** and a **Stripe customer** for every new email it
receives. There is no IP rate limit, no Turnstile, and no per-email throttle. An attacker can:

- Enumerate which emails are registered (response differs on `existing_paid_user` vs `new_email`)
- Create thousands of Stripe customer objects (billing cost)
- Bloat Firebase Auth

**Fix:** Apply the same `checkRateLimit` pattern already used in `/api/lead/capture` and
`/api/auth/magic-link` — per-IP bucket + per-email+IP composite bucket. The helpers are already
in `lib/request-rate-limit.ts`.

---

#### B4. CRON endpoint is publicly accessible when `CRON_SECRET` is unset

**File:** `app/api/cron/capi-batcher/route.ts`

```ts
const secret = cronSecret();
if (secret) {         // ← entire auth block skipped when env var is missing
  if (auth !== `Bearer ${secret}`) return 401;
}
```

If `CRON_SECRET` is not set, any visitor can trigger CAPI sends and Firestore deletes by hitting
`GET /api/cron/capi-batcher`. This is a fail-open design on an endpoint with real side effects.

**Fix:** Fail closed. If `NODE_ENV === "production"` and `CRON_SECRET` is not set, return 503
immediately. Do not allow unauthenticated access in production under any circumstance.

---

### SECURITY

#### S1. `/api/checkout/resume` leaks email and UID to unauthenticated callers

**File:** `app/api/checkout/resume/route.ts`

The GET endpoint returns `{ email, uid, planId, externalSubscriptionId }` with no authentication.
Session IDs appear in URLs (`/checkout/return?session=chk_...`) and can be captured via referrer
headers, browser history, or analytics tools. Anyone who obtains a session ID retrieves the
associated user's email.

**Fix:** Strip PII from the unauthenticated response. Return only `{ status, checkoutSessionId }`.
The client already has the user's email from the form it submitted; it does not need the server
to echo it back.

---

#### S2. `/api/checkout/claim/send` has no rate limiting or authentication

**File:** `app/api/checkout/claim/send/route.ts`

Anyone with a checkout session ID can POST to this endpoint and trigger a Firebase magic-link
email to the session owner. There is no rate limit, no token validation, and no auth check.
A session ID leaking from a URL (see S1) is enough to repeatedly spam a user with emails.

**Fix:** Add rate limiting (per session ID and per IP). At minimum: check the Firestore doc's
`claim.emailSentAt` timestamp and refuse if a claim email was sent in the last N minutes.

---

#### S3. HTML email templates don't escape `subject`

**Files:** `app/api/auth/magic-link/route.ts`, `app/api/checkout/claim/send/route.ts`

```ts
html: `<p>${subject}</p>...`   // subject not passed through escapeHtml()
```

`escapeHtml()` is defined in both files and used on `link` and `brand.NAME`, but not on
`subject`. The subject is constructed from static strings today, but one future change to
`brand.NAME` with an HTML character creates a bug. Inconsistent use of an already-present helper.

**Fix:** Wrap every interpolated variable in `escapeHtml()` in both email templates.

---

### DATA INTEGRITY

#### D1. Browser Pixel fires Purchase with list price, not actual charged amount

**File:** `app/[locale]/checkout/return/checkout-return-client.tsx`

```ts
const plan = getPlanById(r.planId);
capturePurchaseCompleted({
  valueCents: plan?.amountCents ?? 0,   // ← catalog list price, not what was charged
```

For a 7-day trial, the user is charged **$0 today**. The Pixel fires a Purchase event
with the full plan price (e.g., $79.99). The CAPI batcher correctly uses `invoice.amount_paid`
from the Stripe webhook. The two systems report different revenue for the same transaction,
corrupting attribution quality scores.

**Fix:** Store `invoice.amount_paid` on the checkout session doc when the webhook fires and
include it in the `/api/checkout/resume` response. Use that value in `capturePurchaseCompleted`.

---

#### D2. `isTestUser` on `capi_purchases_pending` is never populated — fast-path is dead code

**Files:** `app/api/webhooks/stripe/route.ts`, `app/api/cron/capi-batcher/route.ts`

The batcher checks `data.isTestUser === true` before fetching the user doc, but the webhook
never sets this field on pending documents. The per-doc fast-path never fires; every item
goes through the slower user lookup regardless.

**Fix:** Either remove the per-doc check and the `isTestUser` field from the pending doc
schema entirely, or have the webhook set it by reading `users/{uid}.isTestUser` at queue time.

---

#### D3. Client can pre-set `quiz.completedAt` and the server won't override it

**File:** `app/api/lead/capture/route.ts`

```ts
if (quiz.completed === true && !quiz.completedAt) {
  return { ...quiz, completedAt: new Date().toISOString() };
}
return quiz;   // ← client-supplied completedAt passes through unchanged
```

A client that sends `{ completed: true, completedAt: "2020-01-01T00:00:00Z" }` stores that
value verbatim. If `completedAt` is used for cohort analysis or rate decisions, it is
trivially manipulable.

**Fix:** Always stamp `completedAt` server-side when `completed === true`, ignoring any
client-supplied value.

---

### ARCHITECTURE

#### A1. `question_multi` and `question_binary` node kinds have no UI renderer

**File:** `components/quiz/quiz-experience.tsx`

The renderer handles `question_single`, `interstitial`, `gate_name`, and `gate_email`.
If any quiz node is ever `question_multi` or `question_binary`, the component renders nothing
for that step — the quiz silently stalls with a blank screen. Both kinds are fully defined
in `config/quiz.ts` and handled by the store, but the UI side is missing.

**Fix:** Add renderers for both kinds, or add an explicit error boundary so the blank state
is caught during smoke testing rather than in production.

---

#### A2. CAPI batcher fetches `users/{uid}` up to three times per document

**File:** `app/api/cron/capi-batcher/route.ts`

Per loop iteration:
1. `db.doc("users/{uid}").get()` — test-user check
2. `db.doc("users/{uid}").get()` — attribution fallback (when `attributionSnapshot` is missing)
3. `db.doc("users/{uid}").get()` — lead email lookup

With a batch of 50 documents, that is up to 150 redundant reads of the same document.

**Fix:** Fetch `users/{uid}` once per iteration, cache the result in a local variable, and
reuse it for all three lookups.

---

#### A3. Billing fields are written to Firestore only — never to Firebase custom claims

**Files:** `app/api/webhooks/stripe/route.ts`, `lib/billing-access.ts`

The Stripe webhook writes `billingPlan` and `billingStatus` to Firestore. It never calls
`admin.auth().setCustomUserClaims()`. The `AuthClaims` type includes these fields, but they
are populated from a Firestore read inside `hydrate-profile` — not from the JWT.

Consequence: a user who subscribes and opens a new tab will have a stale token. Every call
to `hasActiveBillingAccess(claims)` in that tab returns `false` until the user signs out
and back in, or until `hydrate-profile` runs again.

**Fix:** After writing billing fields in the webhook, call
`admin.auth().setCustomUserClaims(uid, { billingStatus, billingPlan })`. On the client, call
`user.getIdToken(true)` (force-refresh) after `hydrate-profile` completes so the token reflects
current billing state without requiring a sign-out.

---

#### A4. Stripe customer lookup uses manual string escaping

**File:** `app/api/checkout/confirm-email/route.ts`

```ts
const escaped = email.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const search = await stripe.customers.search({ query: `email:'${escaped}'` });
```

The Zod validator constrains the email format significantly, but manual escaping of Stripe's
query language is fragile — it is not documented which characters are special in Stripe's
search syntax beyond `'` and `\`. The approach is also searching when a direct lookup exists.

**Fix:** Replace with `stripe.customers.list({ email, limit: 1 })`. It performs an exact-match
lookup, avoids string interpolation entirely, and is the documented approach for single-email
lookups.

---

#### A5. Locale URL construction in checkout session route duplicates i18n routing logic

**File:** `app/api/checkout/session/route.ts`

```ts
function localePathPrefix(locale: string): string {
  return locale && locale !== "en" ? `/${locale}` : "";
}
```

This hardcodes the assumption that English is prefix-free and all other locales are prefixed.
If `i18n/routing.ts` ever changes its `localePrefix` strategy, the success/cancel URLs sent to
Stripe will be malformed. Stripe won't know — payments will complete, but users will land on 404s.

**Fix:** Drive locale URL construction from `i18n/routing.ts` or next-intl's path utilities so
there is one source of truth.

---

#### A6. `QUIZ_FAQ` export and `gate_email.next` routing config are dead code

**Files:** `config/quiz.ts` lines 332–338 and 201–203

`QUIZ_FAQ` is exported but never imported — `completion-shell.tsx` reads FAQ copy from
`useTranslations("faq")` directly.

`gate_email.next.fallback = "theater"` describes a routing edge that is never traversed —
`GateEmail.onSuccess` calls `enterTheater()` directly, bypassing `getNextNodeId` entirely.
A developer reading the config will have a false model of how the theater phase is entered.

**Fix:** Delete `QUIZ_FAQ`. Remove `next` from the `gate_email` node definition and add an
inline comment explaining that the transition is owned by `enterTheater()`.

---

### DEPLOYMENT

#### DEP1. Vercel cron may run only once per day on free/hobby plan

**File:** `vercel.json`

```json
{ "schedule": "*/20 * * * *" }
```

Vercel cron jobs run at the specified cadence only on **Pro and above** plans. On the hobby
plan, crons execute at most once per day regardless of schedule. `PENDING_DELAY_MS = 20 minutes`
assumes the batcher fires every 20 minutes; on a free plan, CAPI events would be delayed up
to 24 hours.

**Fix:** Confirm Vercel plan tier before launch. Document the plan requirement in `.env.example`
or `FOUNDATION.md`. Consider also triggering the batcher inline from the webhook (with delay)
as a fallback.

---

#### DEP2. Firebase Admin silently falls back to ADC in production when credentials are missing

**File:** `lib/firebase-admin.ts`

Without `FIREBASE_ADMIN_CREDENTIALS`, `initializeApp()` is called with no credential. In
production on Vercel, there are no Application Default Credentials — every Admin SDK call
fails with a cryptic error at request time, not at startup. The dev-only warning is invisible
in production logs.

**Fix:** In `ensureApp()`, add:
```ts
if (process.env.NODE_ENV === "production" && !json && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Firebase Admin: FIREBASE_ADMIN_CREDENTIALS must be set in production.");
}
```
This surfaces the misconfiguration immediately at cold start instead of on the first request.

---

### UX

#### UX1. Checkout return page shows infinite spinner after 30-second timeout

**File:** `app/[locale]/checkout/return/checkout-return-client.tsx`

```ts
if (r.status === "payment_pending" && Date.now() - started.current < MAX_MS) {
  timer = setTimeout(tick, POLL_MS);
}
// else: polling silently stops, status stays "payment_pending" → spinner never resolves
```

If the Stripe webhook is delayed more than 30 seconds (common during Stripe incidents or
cold Vercel function starts), polling stops but the component stays in the "Confirming your
payment…" spinner forever. The user has no indication anything is wrong.

**Fix:** Add a `timedOut` boolean state. When `Date.now() - started.current >= MAX_MS` and
status is still `payment_pending`, render: *"This is taking longer than expected. Check your
email for a receipt, or contact support at support@mindmirror.app."*

---

#### UX2. Terms of Service and Privacy Policy pages do not exist

The footer links `/legal/terms` and `/legal/privacy`. The checkout terms checkbox commits the
user to "recurring charges after any trial." Neither legal page exists in the codebase. Charging
real money without accessible Terms of Service is a payment processor compliance requirement
(Stripe requires ToS be presented before purchase).

**Fix:** Add at minimum stub pages at `/legal/terms` and `/legal/privacy` — even one-paragraph
placeholders — before enabling live Stripe transactions.

---

### Summary — burn-down before M8

| # | Severity | Item |
|---|---|---|
| B1 | **Blocker** | Sync real Stripe products; fix catalog (prices, IDs, annual plan) |
| B2 | **Blocker** | Align browser Pixel and CAPI event IDs so deduplication works |
| B3 | **Blocker** | Rate-limit `/api/checkout/confirm-email` |
| B4 | **Blocker** | Fail closed when `CRON_SECRET` unset in production |
| S1 | Security | Strip PII (email, UID) from unauthenticated `/api/checkout/resume` response |
| S2 | Security | Rate-limit `/api/checkout/claim/send` |
| S3 | Security | Apply `escapeHtml()` to `subject` in both email templates |
| D1 | Data | Fire browser Pixel Purchase with actual charged amount, not list price |
| D2 | Data | Remove dead `isTestUser` per-doc check or populate the field in the webhook |
| D3 | Data | Always stamp `completedAt` server-side; ignore client-supplied value |
| A1 | Architecture | Add `question_multi` / `question_binary` UI renderers or explicit error |
| A2 | Architecture | Collapse 3× `users/{uid}` reads into 1 per CAPI batcher iteration |
| A3 | Architecture | Write billing fields to Firebase custom claims after subscription activates |
| A4 | Architecture | Replace Stripe customer search with `customers.list({ email })` |
| A5 | Architecture | Use i18n routing config for locale URL prefixes in checkout session |
| A6 | Architecture | Delete `QUIZ_FAQ` export and `gate_email.next` dead routing config |
| DEP1 | Deployment | Confirm Vercel Pro plan for cron cadence; document requirement |
| DEP2 | Deployment | Throw at startup in production if Firebase Admin credentials are missing |
| UX1 | UX | Show timeout error when checkout return polling exceeds 30 s |
| UX2 | Legal | Add Terms of Service and Privacy Policy pages before live charging |

*Review date: M5–M7 adversarial pass 2026-04-26.*

---

## M8 blocker remediation (2026-04-26)

| Blocker | Change |
|---------|--------|
| **B1 — Catalog wrong** | `generated/stripe-product-data.json` replaced with two spec-correct plans: `mindmirror-monthly` at $12.99/mo (no trial) and `mindmirror-annual` at $79.99/yr (7-day trial, highlighted). Annual is default plan. `foundationVersion` bumped to 2. |
| **B2 — CAPI deduplication broken** | Webhook (`invoice.paid`) now stores `subscriptionId` on `capi_purchases_pending` docs. Batcher `buildEventId` rewritten to produce `purchase_{uid}_{subscriptionId}`, matching the browser Pixel format exactly. Fallback `purchase_{invoiceId}` used when subscriptionId is absent. Removed unused `createHash` import from batcher. |
| **B3 — No rate limit on confirm-email** | Added `buildCheckoutEmailIpRateLimitKey` and `buildCheckoutEmailRateLimitKey` to `lib/request-rate-limit.ts`. `app/api/checkout/confirm-email/route.ts` now checks per-IP (20/10 min) and per-email+IP (5/10 min) before any Firestore or Stripe calls. |
| **B4 — CRON fail-open** | `app/api/cron/capi-batcher/route.ts` returns 503 immediately in `NODE_ENV === "production"` when `CRON_SECRET` is unset. Dev mode without a secret remains open for local testing. |

---

## M9 adversarial review (2026-04-26)

Adversarial pass on all M9 work: landing page composition, pricing cards, legal pages, sitemap, robots, and SEO metadata. Verified live with `curl` against the running dev server. Issues ordered critical-first.

---

### Hard Blockers

#### B1. OG image does not exist — social sharing is entirely broken

`lib/metadata.ts` and `app/layout.tsx` reference `/og-default.png` in every OG and Twitter card
tag. The `public/` directory is empty. `curl -sI http://localhost:3000/og-default.png` returns
`Content-Type: text/html` — Next.js is serving an HTML fallback, not an image. The OG URL
resolves to a page, not a 1200×630 PNG.

**Impact:** Twitter card validator, Facebook debugger, Slack, iMessage, LinkedIn — every social
share preview is broken. FOUNDATION M9 smoke test explicitly requires "OG images render on Twitter
card validator." This milestone cannot pass its own acceptance criteria.

**Fix:** Place an actual `og-default.png` (1200×630, ≤200KB) in `public/`. As a minimum
placeholder, generate a simple branded PNG with any image tool or use a `next/og` `ImageResponse`
route at `app/opengraph-image.tsx`. The file must exist before the M9 smoke test is attempted.

---

#### B2. Page `<title>` tags are double-branded on every page

`app/layout.tsx` sets `title.template: "%s · MindMirror"`. `buildPageMetadata` returns a flat
string — for example `"Pricing — MindMirror"`. Next.js applies the template to produce
`"Pricing — MindMirror · MindMirror"`. Confirmed live:

```
<title>Pricing — MindMirror · MindMirror</title>
<title>Terms of Service — MindMirror · MindMirror</title>
<title>MindMirror — See what you keep thinking but never change · MindMirror</title>
```

Every page served to search engines and social platforms has a malformed, redundant title. Google
may truncate or rewrite it; at minimum it looks unprofessional and wastes title real-estate.

**Fix (two options):**

- **Option A (recommended):** Strip the brand suffix from title strings in `messages/en.json`.
  `meta.home_title` → `"MindMirror — See what you keep thinking but never change"` should become
  `"See what you keep thinking but never change"` so the template produces the correct full string.
  Same for `pricing_title` → `"Pricing"`, `terms_title` → `"Terms of Service"`, etc. The home
  page is an exception — pass `title: { absolute: ... }` to bypass the template entirely.

- **Option B:** Remove `title.template` from root layout and manage full titles in each page.
  This couples every page to remembering the brand suffix but removes the template ambiguity.

---

### Architecture Issues

#### A1. "How it works" nav anchor scrolls to the Features section, not HowItWorks

`config/site.ts` routes `{ labelKey: "how_it_works", href: "/#features" }`. The Features
component (`components/marketing/features.tsx`) has `id="features"` — a 6-card product feature
grid. The HowItWorks component (`components/marketing/how-it-works.tsx`) has `id="how-it-works"`
and is never linked from any nav or footer item. Clicking "How it works" in the navbar and footer
scrolls to the feature cards ("Voice-first journaling", "AI transcription"…), not to the 3-step
process explanation. The hero secondary CTA "See how it works" has the same mismatch.

This means `id="how-it-works"` on the HowItWorks section is dead — no user can navigate there
directly. The nav label makes a promise ("how it works") and lands somewhere else ("what it does").

**Fix:** Update `config/site.ts` nav and footer `how_it_works` href from `"/#features"` to
`"/#how-it-works"`. Update the hero secondary CTA link in `components/marketing/hero.tsx`
accordingly. Remove `id="features"` from the Features section (it has no inbound anchor links now).
The two sections are adjacent on the page so a user scrolling past Features immediately sees
HowItWorks anyway — but the anchor target should be accurate.

---

#### A2. Annual savings strings are hardcoded in i18n, disconnected from actual catalog data

`messages/en.json` contains:
```json
"annual_monthly_equiv": "$6.67/mo",
"annual_savings": "Save 48%"
```

`components/marketing/pricing-plans.tsx` renders these as fixed strings when
`plan.intervalUnit === "year"`. The catalog already has `plan.amountCents = 7999` (annual) and
the monthly plan at `amountCents = 1299`. If either price changes in Stripe and the catalog is
re-synced, these display strings will silently show stale numbers while the actual charge changes.

The math is correct today ($79.99 / 12 = $6.666… ≈ $6.67, savings = 48.7% ≈ 48%) but is
coincidentally accurate rather than derived.

**Fix:** Compute both values in `PlanCard` from `plan.amountCents` and the catalog's monthly
plan amount. Pass the monthly plan amount as a prop or look it up from the catalog. Remove
`annual_monthly_equiv` and `annual_savings` from `messages/en.json`. Example:

```ts
// In PricingPlans, find monthly plan for comparison
const monthlyPlan = catalog.plans.find(p => p.intervalUnit === "month" && p.intervalCount === 1);

// In PlanCard, if annual:
const monthlyEquiv = plan.intervalUnit === "year"
  ? formatPrice(Math.round(plan.amountCents / 12), plan.currency)
  : null;
const savings = monthlyPlan && plan.intervalUnit === "year"
  ? Math.round((1 - plan.amountCents / (monthlyPlan.amountCents * 12)) * 100)
  : null;
```

---

#### A3. Legal page body content is hardcoded English TSX, violating the FOUNDATION spec

FOUNDATION §17.3 states: *"Boilerplate ToS and Privacy templates live in `messages/en.json`
namespaces. The product layer overrides the body text but keeps the page shell."*

The `legal` namespace in `messages/en.json` contains only four keys:
`terms_title`, `terms_last_updated`, `privacy_title`, `privacy_last_updated`. All eleven sections
of each document are hardcoded JSX strings inside the page components. Changing copy requires
editing TSX, not messages. Adding any future locale requires rewriting both page files.

**Fix:** Move the 11-section body of each document into `messages/en.json` under
`legal.terms.*` and `legal.privacy.*` namespaces. Each section needs a `heading`, `body`, and
where applicable `list_item_*` keys. The page components then `t()` every string. This is more
verbose in the JSON but correct per the spec and necessary for any future i18n work.

---

#### A4. `CtaBanner` and `Features` heading bypass i18n with hardcoded English

`components/marketing/cta-banner.tsx` contains four English strings inlined in JSX:
- `"Start your 7-day free trial — $0 today"`
- `"Cancel anytime · No questions asked · Your data is yours"`
- `"Discover your thought patterns →"` (duplicated from `hero.cta_primary` — inconsistency risk)
- `"Trusted by 4,200+ founders and professionals"`

`components/marketing/features.tsx` contains one:
- `"Everything you need to understand your own mind"`

`components/marketing/faq.tsx` contains one:
- `"Frequently asked questions"`

None of these go through `getTranslations` / `useTranslations`. They cannot be updated via the
messages file and will diverge from copy edits made there. The `CtaBanner` CTA copy also
duplicates `hero.cta_primary` — any A/B test or copy change would need to update two files.

**Fix:** Add keys to `messages/en.json` under appropriate namespaces (`cta.*`, `features.heading`,
`faq.heading`) and replace hardcoded strings with `t()` calls. `CtaBanner` should reference
`hero.cta_primary` key rather than duplicating the string.

---

#### A5. Orphaned keys in `messages/en.json`

Two keys are now dead after the M9 `buildPageMetadata` refactor:
- `pricing.meta_title` — previously used by the pricing page `generateMetadata`, now superseded
  by `meta.pricing_title`
- `pricing.meta_description` — same

Neither is referenced anywhere in the codebase. They remain in the JSON and will confuse future
maintainers into thinking they control page metadata when they do not.

**Fix:** Remove `pricing.meta_title` and `pricing.meta_description` from `messages/en.json`.

---

#### A6. `SocialProof` uses array index as React `key`

```tsx
{stats.map((stat, i) => (
  <div key={i} ...>
{quotes.map((quote, i) => (
  <blockquote key={i} ...>
```

Both loops use `key={i}`. These arrays are static (content from `t()`), so there is no
reordering risk in practice. However, it is a React anti-pattern that would cause bugs if the
arrays were ever made dynamic (e.g. A/B-tested testimonials, CMS-driven quotes). The strings
themselves are stable identifiers.

**Fix:** Use the stat/quote string value as key, or a stable constant key array. Since the
arrays are fixed, keying on the string content is safe:
```tsx
{stats.map((stat) => <div key={stat} ...>
{quotes.map((quote) => <blockquote key={quote} ...>
```

---

#### A7. `@tailwindcss/typography` not installed — `prose` classes are no-ops on legal pages

Legal pages use `className="prose prose-invert prose-sm max-w-none ..."`. The `@tailwindcss/typography`
package is not in `package.json` (confirmed: zero matches in all deps). In Tailwind v4, without
the plugin imported in `globals.css`, all `prose` and `prose-*` classes generate no CSS.

The legal pages are readable because the custom Tailwind arbitrary selectors
(`[&_h2]:font-semibold`, `[&_h2]:mt-8`, etc.) and explicit utilities (`list-disc pl-5 space-y-1`)
do apply. However:
- Base prose typography rhythm (paragraph spacing, line-height normalisation) is absent
- `prose-invert` color overrides are absent (prose assumes white bg by default; our bg is near-black)
- The `max-w-none` inside the prose container has no prose container to override
- Removing `prose prose-invert prose-sm` from the className would have zero effect on output

**Fix (two options):**

- **Option A:** Install `@tailwindcss/typography` and import it in `globals.css` via
  `@plugin "@tailwindcss/typography"`. This is the correct approach if prose classes are intended.

- **Option B:** Remove all `prose*` classes from the legal page classNames since they do nothing.
  Keep and expand the explicit arbitrary selectors and Tailwind utilities that already work. This
  avoids an extra dependency for boilerplate legal pages.

Option B is simpler given the content is not authored Markdown — it is hand-written JSX with
explicit structure. The explicit selectors we already have cover all the cases we need.

---

### Summary — burn-down before M10

| # | Severity | Item |
|---|---|---|
| B1 | **Blocker** | OG image `/og-default.png` missing — social sharing + M9 smoke test broken |
| B2 | **Blocker** | Title template double-brands every page (`"Pricing — MindMirror · MindMirror"`) |
| A1 | Architecture | Nav + hero "How it works" anchor scrolls to Features section, not HowItWorks |
| A2 | Architecture | Annual savings strings hardcoded in i18n, not computed from catalog |
| A3 | Architecture | Legal body content hardcoded in TSX (violates FOUNDATION §17.3) |
| A4 | Architecture | CtaBanner + Features + FAQ headings bypass i18n |
| A5 | Architecture | Dead keys `pricing.meta_title` + `pricing.meta_description` in en.json |
| A6 | Minor | `key={i}` anti-pattern in SocialProof |
| A7 | Minor | `prose` plugin not installed — legal page classes are no-ops |

*Review date: M9 adversarial pass 2026-04-26.*
