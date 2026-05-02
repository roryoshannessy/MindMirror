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
- M5 Stripe sync ⚠️ (sandbox key mismatch — needs fix)
- M6 Checkout flow ✅
- M7 Quiz ✅ (built, needs smoke test)
- M8 CAPI batcher — next
- M9 Marketing pages + SEO — next
- M10 Hardening + deploy — next

## Known issues
- Stripe sandbox key mismatch — needs correct test key from dashboard
- STRIPE_WEBHOOK_SECRET not yet configured
- Firebase Admin credentials not set (needed for server routes)

## Rules
- Follow references/FOUNDATION.md exactly, milestone by milestone
- Confirm before moving to next milestone
- Ask before any decision not covered in the spec
- Dark minimal UI only — no light mode
- Font: Inter

## References
All specs and strategy docs are in `references/`:
- `references/FOUNDATION.md` — complete build spec
- `references/MindMirror_Product_Deck.md` — brand, quiz, copy, pricing
- `references/MindMirror_Chat1_Summary.pdf` — build history
- `references/Voice_Recordings_.pdf` — strategy from advisor
- `references/MindMirror_App_Summary.pdf` — product concept
