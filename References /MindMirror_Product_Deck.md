# MindMirror Product Deck
> Everything Cursor needs to build the funnel. Brand · Quiz · Copy · Pricing.

---

## 1. What MindMirror Is

**Working name:** MindMirror

**One-line pitch:** "An app that shows you what you keep thinking but aren't changing."

**Description:** A voice-first journaling app that analyzes your thoughts over time and reveals patterns you don't notice yourself.

**Core insight:** People don't need more journaling — they need awareness of what they keep repeating.

**How it works:**
1. User records voice or video
2. App transcribes it
3. App analyzes patterns over time
4. App returns insights like:
   - "You've mentioned this problem 12 times"
   - "This goal appears often but without action"
   - "You talk about this every week"

---

## 2. Brand Config (`config/brand.ts`)

```ts
export const brand = {
  NAME: "MindMirror",
  TAGLINE: "See what you keep thinking but never change.",
  DESCRIPTION: "A voice-first journaling app that detects your thought patterns over time and shows you what's holding you back.",
  DOMAIN: "mindmirror.app",
  EMAIL_NOREPLY: "hello@mindmirror.app",
  EMAIL_SUPPORT: "support@mindmirror.app",
  TWITTER: "@mindmirrorapp",
  LOGO_TYPE: "wordmark",
};
```

---

## 3. Theme Config (`config/theme.ts`)

Dark, minimal, intelligent. Feels like a premium tool — not a wellness app.

```ts
export const theme = {
  background: "#0a0a0a",         // Main background — near black
  foreground: "#fafafa",         // Primary text
  primary: "#6366f1",            // Indigo — CTAs, highlights, active states
  primaryForeground: "#ffffff",  // Text on primary buttons
  secondary: "#1c1c1e",          // Card backgrounds, input fields
  muted: "#27272a",              // Subtle backgrounds
  mutedForeground: "#a1a1aa",    // Placeholder text, secondary labels
  border: "#27272a",             // Dividers, input borders
  accent: "#8b5cf6",             // Violet — pattern highlights, badges
  destructive: "#ef4444",        // Error states
  radius: "0.75rem",             // Border radius across all components
};
```

**Font:** Inter (headings + body). Use `next/font/google`. Clean, modern, highly legible.

---

## 4. Pricing (`config/commercial-catalog.ts`)

Two plans. Simple. Goal is to test purchase intent.

### Plans

| Plan ID | Display Name | Price | Interval | Highlighted | Trial |
|---|---|---|---|---|---|
| `mindmirror-monthly` | Monthly | $12.99 | Monthly | No | None |
| `mindmirror-annual` | Annual | $79.99 | Yearly ($6.67/mo) | **YES** | 7 days free |

### Features (both plans)
- Unlimited voice + video journal entries
- AI transcription of every entry
- Pattern detection across all entries
- Weekly insight report
- Thought timeline view
- Pattern alerts (when a topic repeats 5+ times)
- Export your data anytime

### Annual plan only
- Priority insight processing
- Advanced pattern breakdown (topics, emotions, goals)
- 7-day free trial

---

## 5. Quiz Tree (`config/quiz.ts`)

The quiz is the core acquisition path. It is psychological — questions create personalization, interstitials sell, the theater screen builds anticipation, and the results wall converts.

### Full Flow
```
START → Q1 (role) → Q2 (struggle) → Q3 (journal habit) 
→ INTERSTITIAL 1 → Q4 (goal) → Q5 (awareness) 
→ INTERSTITIAL 2 → NAME GATE → EMAIL GATE 
→ THEATER (analyzing...) → RESULTS WALL → CHECKOUT
```

---

### Node: `q1_role` — QUESTION
**Title:** "First, what best describes you?"
**Subtitle:** "We'll tailor your MindMirror profile to your life."

Options:
- `founder_entrepreneur` → "Founder / Entrepreneur"
- `professional` → "Professional / Executive"
- `creative` → "Creative / Artist"
- `student` → "Student"
- `other` → "Something else"

---

### Node: `q2_struggle` — QUESTION
**Title:** "What's your biggest mental challenge right now?"

Options:
- `overthinking` → "I overthink everything and go in circles"
- `no_clarity` → "I struggle to get clear on what I actually want"
- `stuck` → "I keep setting goals but never follow through"
- `stress` → "I carry stress without knowing why"
- `patterns` → "I feel like I keep repeating the same mistakes"

---

### Node: `q3_journal` — QUESTION
**Title:** "How often do you currently journal or reflect?"

Options:
- `never` → "Never — I don't have a habit"
- `sometimes` → "Sometimes — but I'm not consistent"
- `regularly` → "Regularly — but I don't get much from it"
- `always` → "Always — I journal a lot"

---

### Node: `interstitial_1` — INTERSTITIAL
**Headline:** "78% of MindMirror users discover a thought pattern they had no idea existed — within their first week."
**Body:** "Most people journal without ever seeing the bigger picture. MindMirror is the first app that connects the dots across everything you've said."
**CTA:** "Continue →"

---

### Node: `q4_goal` — QUESTION
**Title:** "What would getting clarity on your thinking patterns give you?"
**Subtitle:** "Pick the one that resonates most."

Options:
- `confidence` → "More confidence in my decisions"
- `momentum` → "Finally make progress on my goals"
- `peace` → "Less mental noise and stress"
- `understanding` → "Understand why I keep self-sabotaging"
- `growth` → "Accelerate my personal growth"

---

### Node: `q5_awareness` — QUESTION
**Title:** "How self-aware do you think you are?"
**Subtitle:** "Be honest — this shapes your results."

Options:
- `very` → "Very — I reflect constantly"
- `somewhat` → "Somewhat — I try but miss things"
- `not_much` → "Not much — I'm not sure where to start"
- `unsure` → "I genuinely don't know"

---

### Node: `interstitial_2` — INTERSTITIAL
**Headline:** "\"I didn't realise I had been talking about quitting my job for 9 months until MindMirror showed me.\""
**Body:** "— James R., Founder, London\n\nMindMirror doesn't just store your thoughts. It shows you what they mean over time."
**CTA:** "See your profile →"

---

### Node: `gate_name` — GATE (Name)
**Title:** "What should we call you?"
**Subtitle:** "Your results will be personalized to you."
**Placeholder:** "Your first name"

---

### Node: `gate_email` — GATE (Email — lead created here)
**Title:** "Where should we send your pattern report?"
**Subtitle:** "We'll also save your personalized results here."
**Placeholder:** "your@email.com"

---

### Node: `theater` — THEATER (3500ms)
Steps shown in sequence:
1. "Analysing your responses..."
2. "Mapping your thought patterns..."
3. "Building your personal profile..."
4. "Your MindMirror is ready."

---

### Results Wall — PERSONALIZED BY NAME + ANSWERS

The results wall uses the person's name and answers to make everything feel personal.

**Structure:**
1. Headline: "[Name], here's what your mind keeps doing."
2. Pattern card — based on their `q2_struggle` answer
3. Insight stat — based on their `q1_role` answer
4. Social proof: "Trusted by 4,200+ founders and professionals"
5. **CTA: "Start your 7-day free trial — $0 today"**
6. Trust line: "Cancel anytime · No questions asked · Your data is yours"
7. Testimonials (3 cards)
8. FAQ section (5 questions)
9. Pricing again
10. Final CTA: "Unlock MindMirror"

---

## 6. Landing Page Copy (`messages/en.json`)

### Hero
```json
{
  "hero.headline": "You've thought about this before. And the time before that.",
  "hero.subheadline": "MindMirror is the first app that shows you what you keep thinking but never change. Voice journal. AI analysis. Pattern recognition.",
  "hero.cta_primary": "Discover your thought patterns →",
  "hero.cta_secondary": "See how it works",
  "hero.social_proof": "Join 4,200+ people who finally see clearly"
}
```

### Features
```json
{
  "features.f1.title": "Voice-first journaling",
  "features.f1.body": "Record a thought in 30 seconds. No writing required. Just speak.",
  "features.f2.title": "AI transcription",
  "features.f2.body": "Every word, captured and stored. Your thoughts become searchable.",
  "features.f3.title": "Pattern detection",
  "features.f3.body": "See which topics, problems and goals keep coming back — across weeks and months.",
  "features.f4.title": "Honest insights",
  "features.f4.body": "Not 'you're doing great.' More like: 'You've said this 11 times and nothing's changed.'",
  "features.f5.title": "Progress tracking",
  "features.f5.body": "Watch your language shift from stuck to moving. Or catch yourself going backwards.",
  "features.f6.title": "Your data, forever",
  "features.f6.body": "Export everything anytime. Your thoughts belong to you."
}
```

### Social Proof
```json
{
  "social.stat1": "4,200+ active journallers",
  "social.stat2": "94% say they discovered something they didn't know about themselves",
  "social.stat3": "Average 3.4 patterns identified in first month",
  "social.quote1": "\"I didn't realise I had been talking about quitting for 9 months.\" — James R.",
  "social.quote2": "\"It's like therapy, but it actually shows you the data.\" — Priya M.",
  "social.quote3": "\"Finally an app that tells me the truth about my own thinking.\" — Tom K."
}
```

### FAQ
```json
{
  "faq.q1": "Is this just another journaling app?",
  "faq.a1": "No. Most journaling apps store your thoughts. MindMirror analyzes them over time and surfaces patterns. It's the difference between a diary and a dashboard.",
  "faq.q2": "How does the pattern detection work?",
  "faq.a2": "After each entry is transcribed, our AI identifies topics, goals, emotions and recurring phrases. Over time, it connects the dots and shows you what keeps coming up.",
  "faq.q3": "Do I have to write or type anything?",
  "faq.a3": "No. MindMirror is voice-first. Just press record and speak. The app handles the rest.",
  "faq.q4": "Can I cancel anytime?",
  "faq.a4": "Yes. No contracts, no questions asked. Cancel from your account settings at any time.",
  "faq.q5": "Is my data private?",
  "faq.a5": "Your entries are private and encrypted. We never sell or share your data. You can export and delete everything at any time."
}
```

---

## 7. Nav & Footer (`config/site.ts`)

### Nav links
```ts
nav: [
  { label: "How it works", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Take the quiz", href: "/quiz" }, // PRIMARY CTA — stands out in nav
]
```

### Footer columns
```ts
footer: {
  product: [
    { label: "Pricing", href: "/pricing" },
    { label: "How it works", href: "/#features" },
    { label: "Take the quiz", href: "/quiz" },
  ],
  legal: [
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
  ],
  support: [
    { label: "support@mindmirror.app", href: "mailto:support@mindmirror.app" },
  ],
}
```

---

## 8. Master Prompt for Cursor

Paste this at the start of your Cursor session:

```
You are a senior full-stack developer building MindMirror — a voice-first AI journaling 
app that detects thought patterns over time.

We are building a conversion funnel (NOT the app itself yet). The funnel tests 
purchase intent before we build the full product.

FOUNDATION: Follow the FOUNDATION.md build spec exactly, milestone by milestone (M0–M10).

PRODUCT CONTEXT (this file — MindMirror_Product_Deck.md):
- Brand, theme, pricing, quiz tree, copy and nav are all defined here
- Dark minimal UI (near-black #0a0a0a background, indigo primary #6366f1)
- Font: Inter
- Two plans: Monthly $12.99 / Annual $79.99 (7-day free trial, highlighted)
- Quiz funnel is the core acquisition path

Start with M0. Confirm each milestone before moving to the next.
Ask me before making any decisions not covered in the spec.
```

---

## 9. Accounts Needed Before Starting

| Service | What for | Free? | URL |
|---|---|---|---|
| Vercel | Deploy the app | Yes | vercel.com |
| Firebase | Auth + database | Yes | firebase.google.com |
| Stripe | Payments | Yes (test mode) | stripe.com |
| PostHog | Analytics + session replay | Yes | posthog.com |
| Meta Business | Pixel + CAPI for ads | Free | business.facebook.com |
| GitHub | Code repo (personal!) | Yes | github.com |
| Resend | Magic link emails | Yes | resend.com |

---

*MindMirror Product Deck · Built in Bali · April 2026*
