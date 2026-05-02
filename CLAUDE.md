# MindMirror — Claude Context

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
- `references/COMPETITOR_ANALYSIS.md` — competitive positioning + messaging insights
- `references/DEEP_MARKET_RESEARCH.md` — real user pain points, desires, market gaps (primary research)

## Competitive Positioning (from COMPETITOR_ANALYSIS.md + DEEP_MARKET_RESEARCH.md)

**Unique positioning angle:** "See What You're Actually Thinking"
- **Competitors focus on:** Mood tracking (Daylio), meditation (Calm), journaling as legacy (Day One)
- **MindMirror focus:** Thought pattern detection + behavioral awareness (completely unowned)
- **Target personas:** Makers/builders, ambitious professionals, anxiety sufferers (underserved)

**3 Unowned Market Gaps (Primary Research):**
1. **Pattern Mirror** — No app shows "here are your recurring thoughts" (MindMirror's core strength)
2. **Accountability Without Judgment** — Apps avoid real accountability (MindMirror's differentiator)
3. **Crisis-Mode Tools** — No app helps when you're anxious RIGHT NOW (MindMirror's opportunity)

**Real User Pain Points (from 100+ app reviews + Reddit discussions):**
- Top complaints: Repetitive prompts (week 2), no behavior change (week 3), guilt streaks (week 1)
- 30-day retention: 3-4% industry average (MindMirror target: 15-20% with pattern + accountability)
- Churn drivers: Rumination loops, lack of insight, no accountability, guilt-based design
- Voice preference: 3.75x faster than typing (150 wpm vs. 40 wpm) — huge friction difference

**Recommended Messaging Hierarchy:**
1. Primary: "See what you keep thinking but aren't changing" (pattern focus)
2. Secondary: "Change what you're actually doing" (accountability focus)
3. Tertiary: "Talk your way out of anxiety" (crisis focus)
4. Differentiator: Voice-first (removes typing friction)

**Pricing context:** Market sweet spot is $4.99-14.99/mo or $79.99-99.99/yr annual
- Current pricing ($12.99/mo, $79.99/yr) aligns with competitor benchmarks ✅

**Ad channels to test:** Instagram Reels, TikTok, Reddit communities (40% higher engagement on Reels)

**Form factor note (per advisor):** Web app + email reminder beats native app onboarding friction for cold traffic. Test the funnel on web first.

**See also:** 
- `references/MARKETING_MESSAGING_STRATEGY.md` — Go-to-market plan, landing page copy, retention strategy
- `references/DEEP_MARKET_RESEARCH.md` — Full pain points, user desires, market gaps
