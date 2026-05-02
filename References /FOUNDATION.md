# FOUNDATION

A product-agnostic, brand-agnostic, copy-agnostic web platform foundation. Once a junior receives a brand, copy deck, and product idea, this foundation lets them ship a full landing-to-checkout funnel without rebuilding the plumbing.

This document is the build spec. It is opinionated, complete, and ordered for sequential execution.

---

## 1. What this foundation is

A pre-architected Next.js + Vercel + Firebase + Stripe Hosted Checkout platform that includes:

- A marketing surface (landing, feature pages, pricing, legal, sitemap, robots, locale-aware metadata).
- A quiz funnel (multi-step state machine with theater, gates, and a results wall).
- A page-based checkout flow: email confirmation page, plan review page, redirect to Stripe Hosted Checkout, return/confirmation page, account claim via magic link. Every step is a real route and the back button works throughout.
- Auth via Firebase magic link and Google OAuth, with realtime profile sync from Firestore to a Zustand store.
- Lead and identity stitching across browsers, driven by a PostHog distinct-id bootstrap carried in the magic-link state.
- First-touch and last-touch attribution capture, with Meta Pixel on the browser and Meta CAPI server-side, deduplicated via a shared `event_id`.
- A single brand-config swap point that rebrands the entire app.
- A single commercial-catalog SPI that lets a product define its plans and prices.
- English-only at launch, with the routing structure ready to add locales later.
- A thin backend: two Vercel route handlers (Stripe webhook + CAPI cron).
- Copy sourced from `messages/en.json` and `config/*` files, with no CMS dependency.

---

## 2. Stack pinned

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js latest stable (App Router, Turbopack) | Route-level middleware lives in `proxy.ts`. |
| Runtime | React latest stable | Server Components by default; mark client islands with `"use client"`. |
| Language | TypeScript latest, `"strict": true`, `moduleResolution: "bundler"` | Zod validates every external boundary. |
| Styling | Tailwind v4 (`@tailwindcss/postcss`) | CSS-first theme via `@theme` in `globals.css`. |
| Components | shadcn v4 (latest CLI, registry-based) + LaunchUI premium components | Install via `npx shadcn@latest add ...`. LaunchUI powers marketing sections; shadcn powers primitives. Compose them at the page level. |
| Icons | `lucide-react` | Single icon library across the app. |
| State | `zustand` | Two stores: `auth-store` and `quiz-store`. Everything else lives in URL or React state. |
| Forms | `react-hook-form` + `zod` resolver | Every form uses this pair. |
| i18n | `next-intl` v4+ | English (`en`) at launch; routing config is multi-locale-ready. |
| Animation | `motion` (Framer Motion successor) | Reserved for theater and micro-interactions. |
| Toasts | `sonner` | Mounted once in the locale layout. |
| Auth | Firebase Auth (magic link + Google) | Client SDK in browser, Admin SDK in server routes. |
| Database | Firebase Firestore | Six collections, listed in section 11. |
| Payments | Stripe Hosted Checkout (`stripe` Node SDK latest) | Subscriptions at v1, served via Stripe-hosted pages. |
| Analytics | PostHog (`posthog-js`) | Identity, typed events, and session replays. Autocapture stays off; events are explicit. |
| Ad attribution | Meta Pixel (browser) + Meta CAPI (server) | Deduplicated via a shared `event_id`. |
| Hosting | Vercel | App, cron, and webhook all run on Vercel. |
| Validation | `zod` v4 | One schema per request body, server response, and stored document. |
| Lint | ESLint flat config (`eslint.config.mjs`) with `eslint-config-next` | Default preset; add rules only when a recurring class of bug appears. |

---

## 3. Folder structure

Single repo. Webapp at the root.

```
foundation/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                    # Locale shell, providers, html/body
│   │   ├── page.tsx                      # Landing page (composes marketing sections)
│   │   ├── pricing/page.tsx              # Pricing page (reads commercial catalog)
│   │   ├── quiz/
│   │   │   ├── layout.tsx                # Minimal shell (logo + progress)
│   │   │   └── page.tsx                  # Quiz host, mounts QuizExperience
│   │   ├── checkout/
│   │   │   ├── email/page.tsx            # Email entry + lead resolution
│   │   │   ├── review/page.tsx           # Plan summary + coupon + go-to-stripe button
│   │   │   ├── return/page.tsx           # Post-Stripe confirmation, polls for settlement
│   │   │   └── recover/page.tsx          # Resume token recovery for abandoned sessions
│   │   ├── auth/
│   │   │   ├── login/page.tsx            # Magic link request + Google button
│   │   │   ├── signup/page.tsx           # Same UI as login, different copy + source
│   │   │   └── callback/page.tsx         # Handles signInWithEmailLink + identity stitching
│   │   ├── account/
│   │   │   ├── layout.tsx                # Authed shell
│   │   │   ├── welcome/page.tsx          # Post-claim landing (one-time)
│   │   │   ├── billing/page.tsx          # Stripe portal redirect + plan summary
│   │   │   └── settings/page.tsx         # Email, name, sign out
│   │   ├── legal/
│   │   │   ├── terms/page.tsx
│   │   │   └── privacy/page.tsx
│   │   └── not-found.tsx
│   ├── api/
│   │   ├── lead/capture/route.ts         # POST. Persist lead + attribution.
│   │   ├── auth/
│   │   │   ├── magic-link/route.ts       # POST. Trigger magic-link send.
│   │   │   └── hydrate-profile/route.ts  # POST (authed). Stitch lead → user.
│   │   ├── checkout/
│   │   │   ├── confirm-email/route.ts    # POST. Resolve email, create checkout_session.
│   │   │   ├── session/route.ts          # POST. Create Stripe Checkout Session, return URL.
│   │   │   ├── resume/route.ts           # GET. Reconcile session state, expose claim hooks.
│   │   │   └── claim/send/route.ts       # POST. Send post-checkout magic link.
│   │   ├── quiz/
│   │   │   └── complete/route.ts         # POST. Persist completion, create lead, queue handoff.
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts           # POST. Stripe webhook (signature verified).
│   │   └── cron/
│   │       └── capi-batcher/route.ts     # GET. Vercel Cron, drains capi_purchases_pending.
│   ├── layout.tsx                        # Root passthrough (metadataBase, icons, manifest)
│   ├── global-error.tsx                  # Top-level error boundary
│   ├── globals.css                       # Tailwind v4 + CSS vars + @theme
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                               # shadcn primitives (button, input, card, ...)
│   ├── launchui/                         # LaunchUI premium marketing sections
│   ├── layout/                           # navbar, footer, logo, locale-switcher, user-menu
│   ├── providers/                        # auth-provider, posthog-provider, intl-provider
│   ├── auth/                             # login-form, callback-handler, auth-guard
│   ├── checkout/                         # email-form, plan-summary, return-state
│   ├── quiz/                             # quiz-experience, question-card, gate-name, gate-email,
│   │                                     # interstitial-card, theater-screen, completion-shell,
│   │                                     # progress-bar
│   └── marketing/                        # hero, features, pricing-cards, social-proof, faq, cta
├── config/
│   ├── brand.ts                          # The single brand swap point
│   ├── theme.ts                          # Color tokens consumed by globals.css
│   ├── fonts.ts                          # Font swap point (next/font)
│   ├── site.ts                           # Nav links, footer columns
│   ├── analytics.ts                      # PostHog + Meta Pixel ids and event names enum
│   ├── commercial-catalog.ts             # Plans + addons SPI (default impl reads generated/)
│   └── quiz.ts                           # Quiz node tree (content-specific, swappable)
├── i18n/
│   ├── routing.ts                        # next-intl routing, locales, default, prefix mode
│   ├── request.ts                        # getRequestConfig with fallback chain
│   └── navigation.ts                     # Locale-aware Link, redirect, usePathname
├── messages/
│   └── en.json                           # All copy, namespaced
├── lib/
│   ├── firebase.ts                       # Client SDK singleton
│   ├── firebase-admin.ts                 # Admin SDK singleton
│   ├── auth.ts                           # signInWithGoogle, sendAuthMagicLink, completeMagicLinkSignIn
│   ├── firestore.ts                      # User profile CRUD + onSnapshot subscribe
│   ├── firestore-admin.ts                # Server-side mutations (lead hydration, billing sync)
│   ├── billing-access.ts                 # hasActiveBillingAccess(claims) pure function
│   ├── checkout-session.ts               # checkout_session domain types + helpers
│   ├── stripe-server.ts                  # Stripe singleton + price cache
│   ├── stripe-hosted-checkout.ts         # Plan-to-Stripe-Checkout-Session resolver
│   ├── stripe-billing-projection.ts      # Stripe event → user billing fields normalization
│   ├── lead-schema.ts                    # buildLeadRecord + types
│   ├── normalize-email.ts                # Lowercase + trim, used as Firestore doc id
│   ├── attribution.ts                    # Client first/last-touch attribution in localStorage
│   ├── attribution-server.ts             # Multi-source merge into one CommercialAttributionContext
│   ├── magic-link-state.ts               # Encode/decode base64 state for cross-browser stitching
│   ├── funnel-session.ts                 # Funnel session id (24h TTL) in localStorage
│   ├── posthog.ts                        # initPostHog with bootstrap from magic-link state
│   ├── meta-pixel.ts                     # initPixel + trackPixel + identifyPixelUser
│   ├── meta-capi.ts                      # Server-side CAPI client (used by cron)
│   ├── purchase-attribution.ts           # Snapshot builder used by webhook + cron
│   ├── analytics.ts                      # Typed event API (PostHog + Pixel co-firing)
│   ├── metadata.ts                       # buildLocaleMetadata helper
│   ├── fonts.ts                          # Font instances (re-exports next/font config)
│   ├── utils.ts                          # cn() and tiny pure helpers
│   └── request-rate-limit.ts             # Simple per-IP rate-limit for public POSTs
├── stores/
│   ├── auth-store.ts                     # Zustand: user, claims, profile status
│   └── quiz-store.ts                     # Zustand: sessionId, path, answers, derived
├── hooks/
│   ├── use-checkout.ts                   # Wraps the checkout API calls
│   ├── use-pricing.ts                    # Reads commercial catalog
│   └── use-media-query.ts
├── generated/
│   └── stripe-product-data.json          # Output of npm run stripe:sync
├── scripts/
│   └── sync-stripe.mjs                   # Pulls Stripe products + prices into generated/
├── public/                               # Brand assets (logos, OG images, favicon)
├── styles/                               # Optional: keyframes too large for globals.css
├── proxy.ts                              # next-intl middleware
├── next.config.ts                        # next-intl plugin + PostHog reverse proxy rewrites
├── instrumentation-client.ts             # captureAttribution + initPostHog + initPixel
├── tsconfig.json                         # ES2022 target, bundler resolution, @/* alias
├── postcss.config.mjs                    # @tailwindcss/postcss plugin
├── eslint.config.mjs
├── firestore.rules                       # User-owned docs only; deny everything else
├── firestore.indexes.json
├── vercel.json                           # Cron schedule for capi-batcher
├── .env.example                          # Full variable list with comments
└── package.json
```

---

## 4. Brand swap layer (the per-product configuration surface)

A new brand is applied by editing four config files and adding the brand assets under `public/`. Every component reads from these via imports.

### 4.1 `config/brand.ts`

```ts
export const brand = {
  NAME: "ProductName",
  DOMAIN: "product.com",
  TAGLINE: "One-line value prop.",

  // Storage key prefix used by attribution, funnel session, quiz context
  STORAGE_PREFIX: "pn",

  // Emails (transactional sender, support, legal)
  EMAIL_SUPPORT: "hey@product.com",
  EMAIL_LEGAL: "legal@product.com",
  EMAIL_NOREPLY: "noreply@product.com",

  // Legal entity (for ToS, Privacy, Stripe)
  LEGAL_ENTITY: "Operating Co. LLC",
  LEGAL_ADDRESS: "Street, City, ZIP, Country",
  LEGAL_PHONE: "+1 555 555 5555",
} as const;

export type Brand = typeof brand;
```

Used by: metadata, footer, transactional copy, Stripe Customer creation, magic-link sender envelope.

### 4.2 `config/theme.ts`

```ts
export const theme = {
  brand: "#000000",         // primary action color
  brandDark: "#000000",     // hover / active
  brandFg: "#FFFFFF",       // text on brand surfaces
  radiusBase: "12px",
  radiusPill: "999px",
} as const;
```

Consumed by `app/globals.css` via CSS variables in `:root`. shadcn token names map onto these via the existing shadcn HSL conventions.

### 4.3 `config/fonts.ts`

```ts
import { Inter, JetBrains_Mono } from "next/font/google";

export const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Add a display font here if the brand needs one.
```

Used in `app/[locale]/layout.tsx` via `<body className={\`${sans.variable} ${mono.variable}\`}>`.

### 4.4 `config/site.ts`

```ts
export const siteConfig = {
  nav: [
    { labelKey: "nav.pricing", href: "/pricing" },
    { labelKey: "nav.quiz", href: "/quiz" },
  ],
  footer: {
    product: [{ labelKey: "footer.pricing", href: "/pricing" }],
    legal: [
      { labelKey: "footer.terms", href: "/legal/terms" },
      { labelKey: "footer.privacy", href: "/legal/privacy" },
    ],
  },
};
```

### 4.5 Assets

Place under `public/`:

```
public/
├── logo.svg                # navbar
├── logo-mark.svg           # favicon source / small badge
├── favicon.ico
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── og-default.png          # 1200×630 default social share
└── manifest.webmanifest
```

### 4.6 Copy

`messages/en.json` is the only copy file at v1. Namespaces:

```
common, nav, footer, hero, features, social_proof, pricing, faq, quiz,
checkout, auth, account, legal, errors, meta
```

Every component reads strings via `useTranslations("namespace")`. All user-facing strings live in `messages/en.json`.

---

## 5. Commercial layer SPI (defined by the foundation, populated by the product)

The commercial layer defines what the product sells. The foundation gives an interface and a default implementation; the product fills it.

### 5.1 The contract

`config/commercial-catalog.ts`:

```ts
import productData from "@/generated/stripe-product-data.json";

export interface Plan {
  id: string;                         // internal id, e.g., "starter-monthly-USD"
  name: string;                       // display name, e.g., "Starter"
  stripeRecurringLookupKey: string;   // resolved against Stripe at runtime
  stripeIntroLookupKey?: string;      // optional intro price (e.g., $1 trial)
  trialDays?: number;
  intervalUnit: "day" | "week" | "month" | "year";
  intervalCount: number;
  amountCents: number;                // display-only, billing truth is Stripe
  currency: string;                   // ISO 4217
  features: string[];                 // i18n keys
  highlighted?: boolean;              // pricing card emphasis
  metadata?: Record<string, string>;  // forwarded as Stripe Checkout metadata
}

export interface Addon {
  id: string;
  name: string;
  stripeLookupKey: string;
  amountCents: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CommercialCatalog {
  plans: Plan[];
  addons: Addon[];
  defaultPlanId: string;
}

export function getCatalog(): CommercialCatalog {
  // Default impl: read from generated/stripe-product-data.json.
  // A product can override this file and fetch from its own source.
  return mapStripeDataToCatalog(productData);
}

export function getPlanById(id: string): Plan | undefined {
  return getCatalog().plans.find(p => p.id === id);
}
```

### 5.2 How a product populates it

1. Create products and prices in Stripe Dashboard. Tag every Price with a `lookup_key` and put internal id into Price `metadata.internal_id`.
2. Run `npm run stripe:sync`. The script writes `generated/stripe-product-data.json`.
3. Adjust feature lists and i18n keys in the generated mapper if needed.

The webapp reads from the generated JSON. No price ids are hardcoded. Re-running the sync is the only way the catalog changes.

### 5.3 What the foundation provides at the billing boundary

The foundation provides three contracts that any commercial layer plugs into:

- `users/{uid}.billingPlan` — string field whose value is a `Plan.id` from the catalog (or `"free"`).
- `users/{uid}.billingStatus` — string mirrored from Stripe (`active | trialing | past_due | canceled | ...`).
- `lib/billing-access.ts:hasActiveBillingAccess(claims)` — single pure function consulted by the `AuthGuard` to decide gated access. The product layer can extend its body to apply custom rules.

Anything beyond plan id and status (entitlement counters, seat counts, usage windows, etc.) is added by the product layer through `lib/user-defaults.ts` and the Stripe webhook projection in `lib/stripe-billing-projection.ts`.

---

## 6. Module: Shell, routing, i18n

### 6.1 Files

- `app/layout.tsx` (passthrough; sets `metadataBase`, icons, manifest, font CSS variables on `<html>`).
- `app/[locale]/layout.tsx` (locale-aware; loads messages, html `lang`, mounts providers, renders `Toaster`).
- `i18n/routing.ts` (defineRouting, `locales: ["en"]`, `defaultLocale: "en"`, `localePrefix: "as-needed"`).
- `i18n/request.ts` (getRequestConfig with fallback to `en`).
- `i18n/navigation.ts` (createNavigation re-exports for Link, redirect, usePathname, useRouter).
- `proxy.ts` (`createMiddleware(routing)`, matcher excludes `api`, `t/`, `_next`, `_vercel`, asset extensions).
- `next.config.ts` (next-intl plugin + PostHog `/t/*` reverse-proxy rewrites + `skipTrailingSlashRedirect: true`).

### 6.2 Provider tree (in `app/[locale]/layout.tsx`, top to bottom)

```
NextIntlClientProvider
  PostHogProvider          // mounts before Auth so anonymous events still fire
    AuthProvider           // Firebase onAuthStateChanged + Firestore onSnapshot
      <main>{children}</main>
      <Toaster />
```

Pricing is read directly via the `useCatalog()` hook from `config/commercial-catalog.ts`.

### 6.3 Metadata

`lib/metadata.ts` exports `buildLocaleMetadata({ titleKey, descriptionKey, path, locale })` returning Next `Metadata` with canonical url, hreflang alternates, OG image, Twitter card. Every page that needs SEO calls it from `generateMetadata`.

### 6.4 Acceptance

- `/` renders English landing without locale prefix.
- `/de/` returns 404 (only `en` configured).
- `/api/lead/capture` reaches the API route handler directly (the next-intl matcher excludes `api`).
- `/t/decide?...` is rewritten to `https://us.i.posthog.com/decide?...` in production.

---

## 7. Module: Theme, Tailwind v4, shadcn + LaunchUI

### 7.1 Tailwind setup

`postcss.config.mjs`:

```js
export default { plugins: ["@tailwindcss/postcss"] };
```

`app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand: var(--brand);
  --color-brand-dark: var(--brand-dark);
  --color-brand-fg: var(--brand-fg);
  --radius: 12px;
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}

:root {
  --brand: #000000;
  --brand-dark: #000000;
  --brand-fg: #ffffff;

  /* shadcn semantic tokens — keep in sync with shadcn defaults */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: var(--brand);
  --primary-foreground: var(--brand-fg);
  /* ... */
}
```

A junior swaps the `:root` brand vars from `config/theme.ts`. The full app re-skins with that single change.

### 7.2 shadcn install

```bash
npx shadcn@latest init
# Use the New York style, base color = neutral, css variables = yes.
```

Add primitives as needed:

```bash
npx shadcn@latest add button input label card dialog dropdown-menu \
  tabs accordion progress tooltip sheet skeleton form select badge
```

`Dialog` and `Sheet` are reserved for confirm prompts, mobile menus, and similar local UI. The checkout, auth, and quiz flows are page-based.

### 7.3 LaunchUI install

LaunchUI is a premium component library that lives next to shadcn. Install per the LaunchUI docs (CLI add command similar to shadcn) into `components/launchui/`. Use it for marketing sections (hero, feature grid, pricing table, testimonial wall, FAQ, CTA banner). Compose LaunchUI sections at the page level and keep the library files untouched so future upgrades stay clean.

### 7.4 Acceptance

- `Button` renders with the brand color from `:root`.
- Swapping `:root --brand` propagates to every shadcn variant that uses `--primary`.
- LaunchUI hero renders correctly on mobile and desktop with brand color baked in.

---

## 8. Module: Firebase (minimal)

### 8.1 Client SDK (`lib/firebase.ts`)

```ts
import { getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const config = { /* read from NEXT_PUBLIC_FIREBASE_* env vars */ };
const app = getApps().length ? getApps()[0] : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Optional emulator wiring guarded by NEXT_PUBLIC_USE_FIREBASE_EMULATOR.
```

### 8.2 Admin SDK (`lib/firebase-admin.ts`)

```ts
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function init() {
  if (getApps().length) return;
  const json = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!json) {
    initializeApp(); // ADC on Vercel
    return;
  }
  initializeApp({ credential: cert(JSON.parse(json)) });
}
init();
export const adminAuth = getAuth();
export const adminDb = getFirestore();
```

Vercel env: either `FIREBASE_ADMIN_CREDENTIALS` (full service account JSON) or use Workload Identity. Pick one and document it.

### 8.3 Firestore rules

`firestore.rules`:

```
rules_version='2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read:   if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
    match /{document=**} {
      allow read, write: if false; // everything else is server-only via Admin SDK
    }
  }
}
```

`leads`, `checkout_sessions`, `stripe_webhook_log`, `capi_purchases_pending`, and `capi_purchases_processed` are all server-only. Never expose them to the client.

### 8.4 Acceptance

- A signed-in user can read `users/{their_uid}` from the browser.
- A signed-in user cannot read `users/{other_uid}` or `leads/anything`.
- Server routes can read/write all collections.

---

## 9. Module: Auth

### 9.1 User-facing pages

| Path | Purpose |
|---|---|
| `/auth/login` | Magic-link request form + Google button. |
| `/auth/signup` | Same form, copy framed as new account. Server records `source: "signup"` on the lead. |
| `/auth/callback` | Receives Firebase email-link redirect. Completes sign-in, decodes magic-link state, calls `/api/auth/hydrate-profile`, redirects to `returnTo`. |

### 9.2 Auth library (`lib/auth.ts`)

Exports:

- `signInWithGoogle()`
- `sendAuthMagicLink(email, returnTo, source)` (calls `/api/auth/magic-link`)
- `completeMagicLinkSignIn()` (used on the callback page)
- `getCurrentIdToken(): Promise<string>` (used by client → server fetches)
- `signOut()`

Magic link emails are sent via `/api/auth/magic-link`. That route uses Firebase Admin to generate the link (`adminAuth.generateSignInWithEmailLink`) and hands it to a transactional sender abstracted behind `lib/email-sender.ts`. The foundation defines the interface (`sendTransactionalEmail({ to, subject, html, text })`) and leaves the concrete sender (SMTP via Nodemailer, or any HTTP transactional API) as a product-layer choice driven by env vars.

### 9.3 Auth state (`stores/auth-store.ts`)

```ts
interface AuthClaims {
  uid: string;
  email: string | null;
  displayName: string | null;
  billingPlan: string;             // "free" | Plan.id
  billingStatus: string | null;    // mirrored from Stripe
  billingCustomerId: string | null;// "cus_..."
  // product layer extends here
}

interface AuthState {
  user: User | null;
  claims: AuthClaims | null;
  profileStatus: "idle" | "loading" | "ready" | "error";
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

### 9.4 AuthProvider (`components/providers/auth-provider.tsx`)

Responsibilities:

1. `onAuthStateChanged(auth, ...)` listens for sign-in / sign-out.
2. On sign-in, calls `getOrCreateUserProfile(uid, ...)` (server-safe through a route or directly via client SDK with Firestore rules).
3. Subscribes to `users/{uid}` via `onSnapshot` and pushes the doc into the Zustand `claims` slot. This is how the UI sees plan upgrades in real time.
4. On sign-out, unsubscribes and resets PostHog identity (`posthog.reset()`).

### 9.5 AuthGuard (`components/auth/auth-guard.tsx`)

Three states:

| State | Behavior |
|---|---|
| `isLoading` | Render shell with skeleton; do not redirect. |
| `!isAuthenticated` | `router.replace("/auth/login?returnTo=...")`. |
| Authed but `!hasActiveBillingAccess(claims)` and route is paid-only | `router.replace("/pricing?reason=paywall")`. |
| Authed with active access | Render children. |

Paid-only routes are listed as a constant set in `components/auth/auth-guard.tsx`. `/account/welcome`, `/account/billing`, `/account/settings` are not paid-only (the user must always be able to manage billing).

### 9.6 Acceptance

- New email → magic link arrives → callback page signs in, creates `users/{uid}`, hydrates lead → lands on intended page.
- Existing free user navigating to a paid route is redirected to `/pricing?reason=paywall`.
- `users/{uid}` updated server-side (e.g., Stripe webhook) reflects in the UI within 1 second without reload.

---

## 10. Module: Lead capture and attribution

### 10.1 Cookie / storage schema

| Key | Storage | TTL | Shape |
|---|---|---|---|
| `${prefix}_attribution` | localStorage | 30 days | First-touch UTM + fbclid + landing_page + referrer + captured_at. |
| `${prefix}_attribution_last` | localStorage | 30 days | Last-touch (always overwritten when URL has new params). |
| `${prefix}_funnel_session` | localStorage | 24h | `{ id, createdAt }`, used to stitch multiple leads with different emails. |
| `${prefix}_activation_context` | sessionStorage | session | `{ funnelSessionId, checkoutSessionId }`, restored from magic-link state on callback. |

`prefix` = `brand.STORAGE_PREFIX` from `config/brand.ts`.

### 10.2 Capture flow

`instrumentation-client.ts` runs on every client page load:

```ts
import { captureAttribution } from "@/lib/attribution";
import { initPostHog } from "@/lib/posthog";
import { initPixel } from "@/lib/meta-pixel";

captureAttribution();
initPostHog();
initPixel();
```

`captureAttribution()` (from `lib/attribution.ts`) reads URL params, writes first-touch (only if not set), always updates last-touch.

The PostHog provider also calls it on every SPA route change inside its pageview effect.

### 10.3 Lead capture API

`POST /api/lead/capture` body:

```ts
{
  email: string;
  source: "signup" | "login" | "quiz" | "checkout";
  posthogDistinctId?: string;
  posthogSessionId?: string;
  metaFbp?: string;          // _fbp cookie
  metaFbc?: string;          // _fbc cookie
  attribution?: LeadAttributionInput;
  funnelSessionId?: string;
  entryUrl?: string;
  locale?: string;
  browserLanguage?: string;
  timezone?: string;
}
```

Server actions (`app/api/lead/capture/route.ts`):

1. Validate with Zod (reject bad email, too-long fields).
2. Rate-limit via `lib/request-rate-limit.ts` (8 req / 10 min by IP+UA+email hash).
3. Pull geo from Vercel headers (`x-vercel-ip-country`, `-region`, `-city`).
4. Build doc via `lib/lead-schema.ts:buildLeadRecord(...)`.
5. `adminDb.doc('leads/' + normalizeEmail(email)).set(doc, { merge: true })`. Set `createdAt` and `convertedToUser=false` only on create.
6. Return `{ ok: true, leadId: normalizedEmail }`.

### 10.4 Server-side attribution merge

`lib/attribution-server.ts:resolveCommercialAttribution({ uid?, email?, checkoutSessionId? })` merges, in priority order:

1. The user doc (if `uid`).
2. Related leads sharing the same `funnelSessionId`.
3. The direct lead (by `normalizeEmail(email)`).
4. The checkout session.
5. Current request signals (geo, IP, UA).

Returns `CommercialAttributionContext` with two halves:

- **Acquisition** (utm fields + fbclid + landing_page) — first-touch wins.
- **Matching** (metaFbp, metaFbc, IP, country, region, city, UA, posthogDistinctId, posthogSessionId, funnelSessionId) — fresh wins.

This single object is what the Stripe webhook and CAPI batcher consume.

### 10.5 Acceptance

- Visiting `/?utm_source=meta&utm_campaign=spring` writes first-touch attribution; revisiting `/?utm_source=tiktok` updates last-touch but leaves first-touch untouched.
- Submitting the email gate writes `leads/{email}` with all attribution fields populated.
- Hitting `/api/lead/capture` with the same email twice does not overwrite `createdAt`.

---

## 11. Data model

### 11.1 Firestore collections

| Collection | Doc id | Owner | Purpose |
|---|---|---|---|
| `users` | Firebase Auth uid | server (Admin SDK only writes; client reads its own) | Profile + billing claims (mirrors Stripe). |
| `leads` | `normalizeEmail(email)` | server | Pre-conversion staging + attribution snapshot. Holds optional `quiz` payload when the funnel includes one. |
| `checkout_sessions` | `chk_<uuid>` | server | Local ledger linking lead → Stripe session → user. |
| `stripe_webhook_log` | Stripe `event.id` | server | Idempotency + audit. |
| `capi_purchases_pending` | Stripe `invoice.id` | server | Queue for Meta CAPI batcher. |
| `capi_purchases_processed` | Stripe `invoice.id` | server | Archive (sent / skipped / failed). |

The full data model is the six collections above. The quiz stores its state on the lead doc.

### 11.2 `users/{uid}` shape (foundation fields only; product extends)

```ts
{
  uid: string;
  email: string | null;
  emailNormalized: string | null;
  displayName: string | null;
  locale: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp | null;

  // Billing (mirrored from Stripe)
  billingPlan: string;              // "free" | Plan.id
  billingStatus: string | null;     // active | trialing | past_due | canceled | ...
  billingCustomerId: string | null; // "cus_..."
  billingSubscriptionId: string | null;
  billingCurrentTermEnd: Timestamp | null;
  billingScheduledCancellation: boolean;
  billingPaymentFailed: boolean;
  firstPaidAt: Timestamp | null;

  // Attribution (carried from lead at hydration)
  attributionSource: string | null;
  attributionMedium: string | null;
  attributionCampaign: string | null;
  attributionAdset: string | null;
  attributionTerm: string | null;
  attributionContent: string | null;
  attributionPlacement: string | null;
  attributionFbclid: string | null;
  attributionLandingPage: string | null;
  attributionReferrer: string | null;

  // Matching signals (refreshed on each session)
  metaFbp: string | null;
  metaFbc: string | null;
  posthogDistinctId: string | null;
  posthogSessionId: string | null;
  funnelSessionId: string | null;

  // Last-known runtime context
  lastKnownIp: string | null;
  lastKnownCountry: string | null;
  lastKnownRegion: string | null;
  lastKnownCity: string | null;
  lastKnownUserAgent: string | null;

  // Last purchase attribution snapshot (used by CAPI batcher fallback)
  lastPurchaseAttribution: PurchaseAttributionSnapshot | null;

  isTestUser: boolean;
}
```

### 11.3 `checkout_sessions/{id}` shape

```ts
{
  id: string;
  email: string;
  emailNormalized: string;
  uid: string | null;                // null until pre-create at email confirm
  status: "created" | "email_confirmed" | "provider_handoff"
        | "completed" | "failed" | "expired" | "abandoned";
  planId: string;                    // Plan.id from commercial catalog
  externalCheckoutSessionId: string | null; // Stripe cs_...
  externalSubscriptionId: string | null;    // sub_...
  externalInvoiceId: string | null;         // in_...
  externalCustomerId: string | null;        // cus_...

  resumeTokenHash: string;           // for /checkout/recover deep link

  claim: { status: "pending" | "email_sent" | "claimed" | "not_needed";
           emailSentAt?: Timestamp; claimedAt?: Timestamp };
  entitlement: { status: "pending" | "granted" | "not_granted" | "not_needed";
                 grantedAt?: Timestamp };

  attributionSnapshot: CommercialAttributionContext;
  funnelSessionId: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
}
```

### 11.4 `leads/{normalizedEmail}` shape

See `lib/lead-schema.ts`. Carries email, source, attribution (utm + fbclid), funnelSessionId, posthog ids, meta fbp/fbc, geo, locale, language, timezone, UA, createdAt, updatedAt, convertedToUser, uid (when claimed). Quiz payload optional.

### 11.5 `capi_purchases_pending/{invoiceId}`

```ts
{
  invoiceId: string;
  uid: string;
  amountPaidCents: number;
  currencyCode: string;
  contentName: string;               // plan display name
  attributionSnapshot: PurchaseAttributionSnapshot;
  queuedFromEvent: string;           // Stripe event.id that produced this row
  queuedAt: Timestamp;
}
```

After processing, the doc moves to `capi_purchases_processed/{invoiceId}` with a `status` field and is deleted from pending.

---

## 12. Module: Quiz

The quiz is a single-page state machine. The URL stays `/quiz` throughout; the internal state machine drives the visible step.

### 12.1 Stage types (the structural vocabulary)

| Kind | Purpose |
|---|---|
| `question_single` | One choice from N options. Drives routing. |
| `question_multi` | M choices from N options, with `minSelections`. |
| `question_binary` | Yes / No. |
| `interstitial` | Trust-building screen with one of four variants: `stat`, `stepper`, `testimonial`, `pillars`. Does not increment progress. |
| `gate_name` | First-name capture. Mandatory. |
| `gate_email` | Email capture. Posts to `/api/lead/capture` with `source: "quiz"`. |
| `theater` | Full-screen processing animation: ordered steps (each with `durationMs`) + scrolling reviews. Captive screen between gates and results. |

### 12.2 Node tree (`config/quiz.ts`)

```ts
export type QuizNode =
  | QuestionSingleNode
  | QuestionMultiNode
  | QuestionBinaryNode
  | InterstitialNode
  | GateNameNode
  | GateEmailNode
  | TheaterNode;

interface NodeBase {
  id: string;
  kind: QuizNodeKind;
  progressStep?: boolean;           // default true except for interstitials
  next?: { rules?: Rule[]; fallback: string };
}

interface Rule { when?: { key: string; equals?: string; includes?: string }; next: string; }

export const QUIZ_NODES: Record<string, QuizNode> = { /* product fills this in */ };
export const QUIZ_START_NODE_ID = "first_question";
export const QUIZ_DISPLAY_TOTAL_STEPS = 12; // tunable
```

The product team writes `QUIZ_NODES` for their funnel. The foundation provides:

- The state machine that walks the tree.
- The card components for each kind.
- The progress bar.
- The session persistence.
- The hand-off to lead capture and checkout.

### 12.3 Components (`components/quiz/`)

- `quiz-experience.tsx` — host. Owns the state machine, walks nodes, renders the right card by `kind`, handles forward/back, fires analytics.
- `question-card.tsx` — renders single, multi, binary.
- `interstitial-card.tsx` — switch on `variant`.
- `gate-name.tsx`, `gate-email.tsx`.
- `theater-screen.tsx` — animation engine with steps + review carousel.
- `completion-shell.tsx` — results page that derives a "score" from answers, shows comparison/roadmap, mounts the pricing wall.
- `pricing-wall.tsx` — pricing tier picker. CTA navigates to `/checkout/email?planId=...&session=quiz&qz=<sessionId>`.
- `progress-bar.tsx`.

### 12.4 Storage

- Browser: `${prefix}_quiz_context` in localStorage holds `{ sessionId, path, answers, createdAt }`. 24h TTL. This is the single source of truth during the funnel.
- Server: final answers + any derived profile are merged into `leads/{normalizedEmail}.quiz` at the email gate and again at completion.

### 12.5 Quiz API

- `POST /api/quiz/complete` — body: `{ sessionId, locale, email, firstName, answers, path, attribution, funnelSessionId, posthogDistinctId, metaFbp, metaFbc, entryUrl }`. Validates with Zod, builds the lead record via `buildLeadRecord({ source: "quiz", ..., quiz: { sessionId, answers, path, completedAt, derived? } })`, and merges into `leads/{normalizedEmail}`. Returns a completion payload whose concrete shape is owned by the product layer (the foundation only guarantees it is JSON-serializable).

### 12.6 Acceptance

- The quiz can be walked end-to-end, the URL never changes, and the back button returns to the previous node within the experience.
- Submitting the email gate writes `leads/{email}` and the next node renders without a full reload.
- Refreshing the page mid-quiz resumes from the current node (state pulled from localStorage).

---

## 13. Module: Checkout

### 13.1 The flow

```
[Pricing or Quiz CTA]
   ↓ navigates to
/checkout/email?planId=...&session=<source>
   ↓ user enters email, server confirms
POST /api/checkout/confirm-email
   → creates checkout_sessions/{id}, sets uid (pre-creates Firebase user via Admin SDK), returns redirect path
/checkout/review?session=<chk_id>
   ↓ shows plan summary, terms acceptance, optional coupon, "Continue to payment"
POST /api/checkout/session
   → creates Stripe Checkout Session with success_url + cancel_url, stores externalCheckoutSessionId
   → returns Stripe url
window.location = stripeUrl
   ↓ user pays on hosted page
Stripe success_url = /checkout/return?session=<chk_id>
   ↓ Return page polls /api/checkout/resume until status=completed
   → fires PostHog purchase + Meta Pixel Purchase (with eventId for CAPI dedup)
   → triggers /api/checkout/claim/send (magic-link email to canonical address)
[user clicks magic link]
/auth/callback (signs in, hydrates profile)
   ↓
/account/welcome (first-purchase landing)
```

Every step is a real route; a refresh at any step is safe.

### 13.2 Page contracts

`/checkout/email/page.tsx`
- Props: `planId`, `session`.
- Content: email input, legal note, submit button.
- On submit: `POST /api/checkout/confirm-email` → on success, `router.push("/checkout/review?session=...")`.
- If email belongs to an existing paid user: `router.push("/account/billing?reason=already_subscribed")`.

`/checkout/review/page.tsx`
- Reads `checkout_sessions/{session}` server-side (server component or RSC fetch via Admin SDK from a server route — the page itself is a client component that hydrates a server-prefetched payload).
- Shows plan name, recurring price, intro price (if any), trial days, coupon input, terms checkbox, "Pay with card" button.
- Button click: `POST /api/checkout/session` → redirect to Stripe URL.

`/checkout/return/page.tsx`
- Polls `GET /api/checkout/resume?session=...` every 1500ms up to 30s.
- States: `payment_pending`, `payment_settled_claim_pending`, `claim_email_sent`, `already_claimed`.
- On `payment_settled_claim_pending`, automatically calls `POST /api/checkout/claim/send` once.
- Shows confirmation copy, plan summary, "Check your inbox to access your account" message with the canonical email.
- Fires PostHog `purchase_completed` and Meta Pixel `Purchase` (with `event_id` = `purchase_<uid>_<subscriptionId>`) once per successful completion.

`/checkout/recover/page.tsx`
- Accepts `?token=...` from a Stripe `cancel_url`. Looks up the checkout session by token hash and hydrates the user back to `/checkout/review`.

### 13.3 API contracts

`POST /api/checkout/confirm-email`
- Body: `{ email, planId, source, locale, attribution, funnelSessionId, posthogDistinctId, metaFbp, metaFbc, entryUrl }`.
- Validates email. Resolves catalog plan. Creates or resumes a `checkout_sessions/{id}` doc. Pre-creates Firebase Auth user (idempotent: `getUserByEmail` then `createUser` if missing). Pre-creates `users/{uid}` profile (idempotent merge). Pre-creates Stripe Customer (`stripe.customers.search` by email then `.create`).
- Returns `{ checkoutSessionId, resolution: "new_email" | "existing_free_user" | "existing_paid_user", nextStep: "proceed_to_payment" | "show_already_subscribed" }`.

`POST /api/checkout/session`
- Body: `{ checkoutSessionId, couponCode? }`.
- Loads catalog plan + Stripe price (intro + recurring). Calls `stripe.checkout.sessions.create({ mode: "subscription", customer, line_items, subscription_data: { trial_period_days, metadata }, success_url, cancel_url, allow_promotion_codes: true, payment_method_types: ["card"] })`.
- Stripe metadata MUST include: `checkoutSessionId`, `uid`, `planId`, `funnelSessionId`. The webhook reads these to stitch the event back to the local session.
- Updates the local session: `status="provider_handoff"`, `externalCheckoutSessionId`.
- Returns `{ url }`.

`GET /api/checkout/resume?session=<id>`
- Reads `checkout_sessions/{id}` and re-checks Stripe (read-through if the webhook hasn't landed yet).
- Returns the current claim/entitlement state and a normalized status string the return page can switch on.

`POST /api/checkout/claim/send`
- Body: `{ checkoutSessionId }`.
- Idempotent: only sends if `claim.status === "pending"`. Generates a Firebase email-link and emails it via the email-sender abstraction. Encodes magic-link state with `funnelSessionId`, `checkoutSessionId`, PostHog ids, meta fbp/fbc, attribution. Sets `claim.status = "email_sent"`.

### 13.4 Acceptance

- A new email can complete a paid plan end-to-end across the routes listed in 13.1 with the back button working at each step.
- Refreshing `/checkout/review` does not lose the chosen plan or re-trigger any side effect.
- Refreshing `/checkout/return` after payment continues polling and eventually shows the confirmation state.
- Clicking the magic link from a different browser still signs the same PostHog person in (verified by `posthog.get_distinct_id()` matching across both browsers).

---

## 14. Module: Stripe webhook

`POST /api/webhooks/stripe`

### 14.1 Responsibilities

1. Verify signature: `stripe.webhooks.constructEvent(rawBody, header, STRIPE_WEBHOOK_SECRET)`. The Next.js route handler reads the raw body via `await req.text()` (do not parse first).
2. Idempotency: `adminDb.doc('stripe_webhook_log/' + event.id).create(...)` (use `.create`, not `.set`; rely on the AlreadyExists error to skip duplicates).
3. Event handling switch on `event.type`. Handle:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `customer.subscription.created` / `.updated` / `.deleted` / `.trial_will_end`
   - `invoice.paid` (distinguish first-payment via `billing_reason === "subscription_create"` vs renewal)
   - `invoice.payment_failed`
   - `payment_intent.succeeded` / `.payment_failed` (only if you add one-time addons)
   - `charge.refunded` / `.dispute.created`
4. Person resolution chain:
   - `event.data.object.metadata.uid`
   - then `customer_email` → `users` lookup
   - then `customer` (Stripe id) → `users.billingCustomerId` lookup
   - then `subscription` → `checkout_sessions.externalSubscriptionId` lookup
5. Update `users/{uid}` via `lib/stripe-billing-projection.ts:reconcileBillingFromStripeEvent(event, currentProfile)`.
6. Update `checkout_sessions/{id}` (`status`, `externalSubscriptionId`, `externalInvoiceId`, `entitlement.status`).
7. On a successful first-paid invoice, push a row into `capi_purchases_pending/{invoiceId}` with the snapshot built by `lib/purchase-attribution.ts:buildPurchaseAttributionSnapshotFromStripeEvent(event, profile)`.
8. Return `200 { received: true }` always once verified — never let downstream errors cause Stripe to retry forever; log and continue.

### 14.2 Acceptance

- Replaying the same Stripe event id twice does not double-mutate `users/{uid}`.
- A test purchase in test mode flips `billingPlan` from `"free"` to the catalog plan id and `billingStatus` to `"active"` (or `"trialing"`).
- One row appears in `capi_purchases_pending` per first-paid invoice.

---

## 15. Module: PostHog

### 15.1 Init (`lib/posthog.ts`)

Already documented in section 10. Key choices:

- `defaults: "2026-01-30"` (or whichever is latest at build time).
- `person_profiles: "always"` so anonymous → identified merge works.
- `capture_pageview: false` (we capture manually so SPA navigations are tracked).
- `autocapture: false` (explicit events only).
- `capture_performance: false`.
- `disable_session_recording: isDev`.
- `api_host: isDev ? POSTHOG_HOST : "/t"` (production routes through `next.config.ts` rewrites to bypass ad blockers; the rewrite path is short and intentionally non-obvious).

Bootstrap from `?state=...` magic-link param so cross-browser claim continues as the same anonymous person without an `alias` call.

### 15.2 Provider (`components/providers/posthog-provider.tsx`)

- Wraps children in `PHProvider`.
- Mounts an inner pageview component that listens to `pathname` + `searchParams` and fires `$pageview` on change. Also calls `captureAttribution()` on each navigation.

### 15.3 Event API (`lib/analytics.ts`)

A small typed wrapper. Each function fires PostHog and (where it makes sense) Meta Pixel with a shared `eventId`.

```ts
export const Events = {
  // Page-level
  pageView: (props: { path: string; locale: string }) => void,
  // Funnel
  quizStarted: (props: { quizId: string }) => void,
  quizCompleted: (props: { quizId: string; score?: number }) => void,
  emailCaptured: (props: { source: "signup" | "login" | "quiz" | "checkout" }) => void,
  checkoutStarted: (props: { planId: string; entryPoint: string }) => void,
  paymentInfoSubmitted: (props: { planId: string }) => void,
  // Conversion
  purchaseCompleted: (props: { uid: string; subscriptionId: string;
                                planId: string; valueCents: number;
                                currency: string }) => void,
  signupCompleted: (props: { uid: string }) => void,
  loginCompleted: (props: { uid: string }) => void,
};
```

Identity:

- `identifyUser(uid, traits)` calls `posthog.identify(uid, traits)` and `identifyPixelUser(email)` for advanced matching.
- `posthog.reset()` on sign-out.

### 15.4 Acceptance

- A first visit shows one anonymous person in PostHog.
- Submitting the email gate produces an `email_captured` event with the correct `source`.
- Completing checkout produces one `purchaseCompleted` event in PostHog and one `Purchase` event on the Pixel with the same `event_id` as the eventual CAPI Purchase.

---

## 16. Module: Meta Pixel + CAPI

### 16.1 Browser (`lib/meta-pixel.ts`)

- `initPixel()` injects `fbevents.js` and calls `fbq('init', PIXEL_ID)` then `fbq('track', 'PageView')`.
- `trackPixel(eventName, params, eventId?)` wraps `fbq('track', ...)` with an optional `eventID` for CAPI dedup.
- `identifyPixelUser(email)` re-inits the pixel with `{ em: email }` (advanced matching). Meta hashes internally.

Skips entirely when `NEXT_PUBLIC_META_PIXEL_ID` is empty.

### 16.2 Server CAPI (`lib/meta-capi.ts`)

A thin client around the Meta Conversions API (`https://graph.facebook.com/v<latest>/<PIXEL_ID>/events`). Exports `sendPurchase({ eventId, eventTime, eventSourceUrl, userData, customData, testEventCode? })`.

Hashes (SHA-256 hex) email, phone, first/last name, city, region, zip before sending. Forwards `fbp`, `fbc`, `client_ip_address`, `client_user_agent` unhashed.

### 16.3 CAPI batcher (`/api/cron/capi-batcher`)

Vercel Cron (`vercel.json`):

```json
{
  "crons": [{ "path": "/api/cron/capi-batcher", "schedule": "*/20 * * * *" }]
}
```

Route handler (`app/api/cron/capi-batcher/route.ts`):

1. Authorize via `Authorization: Bearer ${CRON_SECRET}` (Vercel adds this automatically when `CRON_SECRET` is configured).
2. Read `capi_purchases_pending` where `queuedAt < now() - 20 min` AND not already in `capi_purchases_processed`.
3. Group by `uid + currencyCode + queuedAt` proximity.
4. For each group, build the CAPI payload via `lib/purchase-attribution.ts` (prefer the snapshot on the pending doc; fall back to `users/{uid}.lastPurchaseAttribution`).
5. Compute deterministic `event_id`: `purchase_${uid}_${batchHash}`. Same id used by the browser Pixel `Purchase` call.
6. Send via `meta-capi.sendPurchase`.
7. On success, write `capi_purchases_processed/{invoiceId}` with `status: "sent"`, then delete `capi_purchases_pending/{invoiceId}`.
8. On failure, leave pending; reaper deletes after 72h with `status: "expired"`.

### 16.4 Acceptance

- A test purchase produces both a Pixel `Purchase` event and a CAPI `Purchase` event with matching `event_id` (Meta Events Manager shows them deduplicated).
- A failed CAPI POST does not delete the pending doc; a retry later succeeds.

---

## 17. Module: Marketing surface

The foundation ships with a small set of generic marketing pages composed from LaunchUI sections. Each page is a thin shell that picks copy from `messages/en.json`.

### 17.1 Landing (`app/[locale]/page.tsx`)

Default composition:

1. Hero (LaunchUI `Hero` variant) with brand name, tagline, primary CTA → `/quiz` when the quiz is configured for this product, otherwise `/auth/signup`. Secondary CTA → `/pricing`.
2. Social proof strip.
3. Feature grid (3 to 6 features from `messages.features.items`).
4. How-it-works (3-step section).
5. Pricing teaser (mini cards summarizing the catalog).
6. FAQ accordion.
7. Final CTA banner.

Each section is a pure function of i18n + brand. Reorder freely per product.

### 17.2 Pricing (`app/[locale]/pricing/page.tsx`)

- Reads `getCatalog()` and renders one card per plan.
- CTA on each card → `/checkout/email?planId=<id>&session=pricing`.
- Highlighted plan is determined by `Plan.highlighted`.

### 17.3 Legal

- `/legal/terms` and `/legal/privacy` are MDX or plain TSX with i18n strings. Boilerplate ToS and Privacy templates live in `messages/en.json` namespaces. The product layer overrides the body text but keeps the page shell.

### 17.4 SEO

- `app/sitemap.ts` enumerates `/`, `/pricing`, `/quiz`, `/legal/*`, plus any tool/feature pages defined by the product.
- `app/robots.ts` is a default allow with `/api`, `/account`, `/checkout` disallowed for crawlers.

---

## 18. Environment variables

`.env.example` (copy to `.env.local` and fill):

```
# Brand identity is set in config/brand.ts; no env vars required.

# Firebase client (NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase admin (server only)
FIREBASE_ADMIN_CREDENTIALS=               # full service account JSON (Vercel encrypted env)

# Stripe
STRIPE_SECRET_KEY=                        # sk_test_... in dev, sk_live_... in prod
STRIPE_WEBHOOK_SECRET=                    # whsec_...
STRIPE_WEBHOOK_API_VERSION=2026-03-25.dahlia
STRIPE_PUBLISHABLE_KEY=                   # pk_test_... (only if you decide to surface payment status copy that needs it)

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Meta
NEXT_PUBLIC_META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_CAPI_TEST_EVENT_CODE=                # optional, for staging dedup checks

# Email sender (one of)
EMAIL_SENDER_PROVIDER=                    # "smtp" | "http" — selects the implementation in lib/email-sender.ts
EMAIL_SENDER_API_KEY=                     # for HTTP transactional providers
EMAIL_SENDER_SMTP_URL=                    # smtp(s)://user:pass@host:port  for SMTP providers
EMAIL_SENDER_FROM=                        # falls back to brand.EMAIL_NOREPLY when empty

# Vercel cron auth (Vercel sets this automatically when CRON_SECRET env exists)
CRON_SECRET=

# Misc
NEXT_PUBLIC_SITE_URL=https://product.com  # used for canonical URLs and Stripe success/cancel URLs
```

---

## 19. The build sequence (junior playbook)

Each milestone ends in a green CI run and a manual smoke. Every milestone passes with placeholder copy; final copy can land at any point.

### M0 — Repo bootstrap (half day)

- `npx create-next-app@latest` with App Router, TS, ESLint.
- Install dependencies from section 2.
- Add `tsconfig.json`, `eslint.config.mjs`, `proxy.ts`, `next.config.ts`, `instrumentation-client.ts` per this spec.
- Run `npm run dev` and confirm `/` returns the default Next page.

### M1 — Brand + theme + shell

- Create `config/brand.ts`, `config/theme.ts`, `config/fonts.ts`, `config/site.ts` with placeholder values.
- Create `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `messages/en.json` (empty namespaces).
- Wire `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/globals.css`.
- Install shadcn (init + a few primitives) and LaunchUI.
- Smoke: `/` renders a Hero section using brand color and brand name.

### M2 — Firebase foundation

- Create the Firebase project, enable Auth (Email link + Google), enable Firestore.
- Add `firestore.rules` per section 8.3 and deploy them.
- Add `lib/firebase.ts` and `lib/firebase-admin.ts`.
- Smoke: a temporary `/dev/firebase-test` page can read and write a test doc consistent with the rules.

### M3 — Auth pages + AuthProvider + AuthGuard

- Build `lib/auth.ts`, `stores/auth-store.ts`, `components/providers/auth-provider.tsx`, `components/auth/auth-guard.tsx`.
- Build `/auth/login`, `/auth/signup`, `/auth/callback`.
- Build `/api/auth/magic-link` and `/api/auth/hydrate-profile`.
- Implement `lib/email-sender.ts` against the `sendTransactionalEmail` interface; pick SMTP or an HTTP transactional API and wire env vars.
- Smoke: magic-link sign-in works end-to-end on `localhost`. `users/{uid}` is created. Sign-out clears state.

### M4 — Lead capture + attribution + PostHog + Meta Pixel

- Add `lib/attribution.ts`, `lib/funnel-session.ts`, `lib/magic-link-state.ts`, `lib/normalize-email.ts`, `lib/lead-schema.ts`, `lib/attribution-server.ts`.
- Add `lib/posthog.ts`, `lib/meta-pixel.ts`, `components/providers/posthog-provider.tsx`, `lib/analytics.ts`.
- Wire `instrumentation-client.ts`.
- Build `/api/lead/capture`.
- Smoke: visiting `/?utm_source=meta` writes first-touch in localStorage. Submitting an email on a temporary form writes `leads/{email}` with full attribution. PostHog dashboard shows the anonymous person.

### M5 — Commercial catalog + Stripe sync

- Build `scripts/sync-stripe.mjs` that pulls products + prices via the Stripe SDK (filter by metadata flag, e.g., `metadata.foundation = "true"`) into `generated/stripe-product-data.json`.
- Build `config/commercial-catalog.ts`.
- Smoke: `npm run stripe:sync` populates the file. `/pricing` renders cards with the right names and prices.

### M6 — Checkout + Stripe webhook

- Build `lib/checkout-session.ts`, `lib/stripe-server.ts`, `lib/stripe-hosted-checkout.ts`, `lib/stripe-billing-projection.ts`, `lib/purchase-attribution.ts`.
- Build pages `/checkout/email`, `/checkout/review`, `/checkout/return`, `/checkout/recover`.
- Build APIs `/api/checkout/confirm-email`, `/api/checkout/session`, `/api/checkout/resume`, `/api/checkout/claim/send`.
- Build webhook `/api/webhooks/stripe`.
- Configure Stripe webhook in dashboard pointing at `https://<deployment>/api/webhooks/stripe`.
- Smoke: a test purchase with card `4242 4242 4242 4242` flips `billingPlan` in Firestore and `users/{uid}` shows `billingStatus = "active"` within seconds. The return page shows the confirmation. The magic-link claim email arrives. Clicking it signs the user in.

### M7 — Quiz

- Build `config/quiz.ts` with a placeholder 8-node tree (one of each kind).
- Build `components/quiz/*`, `stores/quiz-store.ts`, `app/[locale]/quiz/page.tsx`.
- Build `/api/quiz/complete`.
- Smoke: walk the placeholder quiz, gate captures email, lead doc is written with `quiz` payload, completion shell renders, pricing wall navigates to `/checkout/email?planId=...&session=quiz&qz=...`.

### M8 — CAPI batcher

- Build `lib/meta-capi.ts`, `app/api/cron/capi-batcher/route.ts`.
- Add `vercel.json` with the cron schedule.
- Smoke: a test purchase populates `capi_purchases_pending`. Manually invoking the cron URL drains it and writes to `capi_purchases_processed`. Meta Events Manager shows the deduplicated `Purchase` event.

### M9 — Marketing pages + legal + SEO

- Compose `/`, `/pricing`, `/legal/terms`, `/legal/privacy`.
- `app/sitemap.ts`, `app/robots.ts`, `lib/metadata.ts` powering all `generateMetadata` calls.
- Smoke: Lighthouse on `/` is green. `/sitemap.xml` lists all routes. OG images render on Twitter card validator.

### M10 — Hardening

- Rate-limit on every public POST.
- Wire an error-monitoring service of the team's choice into `app/global-error.tsx` and the API route handlers.
- A `/dev/*` namespace gated by `NODE_ENV !== "production"` for debug pages.
- Document the production deploy checklist in `README.md`.

A junior with the brand, copy deck, and product idea on day 1 can be live by the end of these milestones with a real funnel that converts.

---

## 20. Operational notes

- **Branching**: `main` deploys to production, `dev` deploys to a Vercel Preview. Never push directly to `main`.
- **Stripe modes**: `dev` uses test mode and points at the test webhook. Production uses live mode and the live webhook. Never share secrets across modes.
- **Test users**: any account created from `localhost` or a `dev`-tagged origin should set `users/{uid}.isTestUser = true`. The CAPI batcher must skip test users (`status: "skipped_test_user"`).
- **Deletion**: never hard-delete from `users`, `leads`, or `checkout_sessions`. Soft-delete with `deletedAt` if the product needs it. Webhook log and CAPI processed/pending may be pruned after 90 days.

---

## 21. Hand-off checklist for the product team

When the brand, copy, and idea land, the product team needs to deliver:

1. `config/brand.ts` values.
2. `config/theme.ts` values + `public/` assets (logo, favicons, OG image).
3. `config/fonts.ts` font choices.
4. `config/site.ts` nav and footer.
5. `messages/en.json` strings for every namespace (or a translation contractor can fill these from a copy doc).
6. Stripe products + prices + lookup keys, then a successful `npm run stripe:sync`.
7. (If using the quiz) `config/quiz.ts` node tree + the completion derivation logic.
8. `.env.local` with all values from section 18.

Everything else is the foundation.

---

End of FOUNDATION.
