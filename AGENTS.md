# MindMirror — Codex Context

## Project
Voice-first AI journaling app. Detects thought patterns over time.
We are building a **conversion funnel** to test purchase intent — not the app itself yet.
One-line pitch: "An app that shows you what you keep thinking but aren't changing."

## Stack
- Framework: Next.js (App Router) on Vercel
- Auth: Firebase (magic link + Google OAuth) — project: mindmirror-ef993
- Database: Firestore
- Payments: Stripe Hosted Checkout
- Analytics: PostHog + Meta Pixel + Meta CAPI
- UI: shadcn/ui + LaunchUI + Tailwind v4
- State: Zustand (auth-store, quiz-store)
- Email: Resend
- i18n: next-intl (English only at launch)
- Language: TypeScript strict

## Key files
- `config/brand.ts` — brand values
- `config/theme.ts` — color tokens (#0a0a0a bg, #6366f1 indigo primary)
- `config/quiz.ts` — full quiz node tree + results derivation
- `config/commercial-catalog.ts` — pricing plans
- `messages/en.json` — all copy
- `stores/quiz-store.ts` — quiz state machine
- `stores/auth-store.ts` — auth state

## Pricing
- Monthly: $12.99/mo — id: mindmirror-monthly
- Annual: $79.99/yr — id: mindmirror-annual (7-day free trial, highlighted)

## Quiz flow
Q1 role → Q2 struggle → Q3 journal habit → Interstitial 1 → Q4 goal → Q5 awareness → Interstitial 2 → Name gate → Email gate → Theater 3.5s → Results wall → Checkout

## Build milestones (see references/FOUNDATION.md)
- M0 Repo bootstrap ✅
- M1 Brand + theme + shell ✅
- M2 Firebase ✅
- M3 Auth pages ✅
- M4 Lead capture + PostHog + Meta Pixel ✅
- M5 Stripe sync ✅
- M6 Checkout flow ✅
- M7 Quiz ✅
- M8 CAPI code path ✅ (awaiting Meta CAPI token)
- M9 Marketing pages + SEO ✅
- M10 Hardening + deploy ✅

## Current launch status — May 13, 2026
- Production domain: `https://getmindmirror.com`
- Production deploy: live on Vercel
- Meta Pixel deployed: `26709756288674893`
- Meta CAPI: code path ready, access token still pending
- Stripe sandbox checkout: verified end to end
- Stripe webhook: verified delivered/200
- Refund flow: monthly charge refund verified, subscription cancellation wired, branded refund email verified through Resend
- Firebase Admin: configured in production
- Firestore writes: checkout/refund paths verified; lead capture code path implemented and scheduled for one fresh mobile QA pass
- PostHog: configured and used for funnel events
- Resend: domain verified and refund email delivery verified
- Latest UI polish: landing page now shows a concrete pattern-profile preview; quiz options are larger and clearer on mobile
- Launch QA scratchpad: `references/LAUNCH_QA_SCRATCHPAD.md`

## Known issues
- `META_CAPI_ACCESS_TOKEN` still needs to be added once available from Meta
- `META_CAPI_TEST_EVENT_CODE` should only be added while using Meta Test Events
- Browser Pixel PageView should be rechecked in Meta Events Manager after every relevant deploy
- Purchase Pixel + CAPI dedupe must be verified once the CAPI token exists
- Run one fresh mobile QA from an attribution URL through checkout/refund before paid ads
- English only at launch; do not send paid Spanish/other-language traffic until localized landing, quiz, checkout, refund email, and legal/support copy exist

## Rules
- User prefers step-by-step, non-technical guidance, one action at a time
- Dark minimal UI only — no light mode
- Font: Inter

## References
All specs and strategy docs are in `references/`:
- `references/FOUNDATION.md` — complete build spec
- `references/MindMirror_Product_Deck.md` — brand, quiz, copy, pricing
- `references/MindMirror_Chat1_Summary.pdf` — build history
- `references/Voice_Recordings_.pdf` — strategy from advisor
- `references/MindMirror_App_Summary.pdf` — product concept
