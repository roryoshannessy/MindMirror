# MindMirror Landing Page Iterations

Use this file to preserve landing-page directions before paid traffic. Each version should record the idea, CTA, visual direction, risk, and whether it is live, local, or only a concept.

## Current Live Version — Pattern Quiz Funnel

- Status: live on production after May 30 Gate 1 offer-clarity pass
- Hero promise: `See the patterns your mind keeps repeating.`
- Primary CTA: `Start the pattern quiz`
- Secondary CTA: `See how it works`
- Visual direction:
  - Dark minimal dashboard preview
  - Pattern-profile UI shown directly in the hero
  - Waitlist-only status visible near the CTA
- Strength:
  - Honest about early-access validation
  - Stronger wedge than generic AI journaling
  - Quiz-first path gives visitors a small preview before checkout
- Weakness:
  - Does not yet make the product feel as instantly tangible as a real app screenshot
  - The dashboard preview is useful, but it is not framed like a phone-native product moment

## Iteration A — Reflectly-Inspired Phone Showcase

- Status: concept
- Reference:
  - Reflectly-style hero where the phone screen is displayed as a separate product object beside the headline
- Hero promise direction:
  - `You have thought about this before. MindMirror shows you the loop.`
  - Alternative: `See the thought loop you keep returning to.`
- Primary CTA:
  - `Start the pattern quiz`
- Secondary CTA:
  - `Preview the app`
- Visual direction:
  - Left side: dark minimal headline and short value prop
  - Right side: large phone mockup showing the actual MindMirror app surface
  - Behind the phone: one or two flat dashboard panels, not decorative cards
  - Phone screen should show:
    - today's reflection
    - detected pattern
    - repeated topic count
    - one clear next reflection question
- Why this may work:
  - Makes MindMirror feel more real before the full app is built
  - Gives visitors a concrete mental model of what they are joining
  - Preserves our sharper positioning while borrowing the product-proof structure competitors use well
- Risks:
  - If too polished, it may imply the finished app already exists
  - Must keep early-access/waitlist language visible near the CTA
  - Need to avoid looking like a generic wellness/journaling app

## Iteration B — Pain-First Ad Landing Page

- Status: concept
- Hero promise direction:
  - `You keep circling the same thought.`
  - Supporting copy: `Take the 60-second quiz and see the pattern MindMirror would track over time.`
- Primary CTA:
  - `Find my pattern`
- Visual direction:
  - Less app UI at first
  - More emotional specificity
  - Show three example loops:
    - `I need to decide, but I keep waiting for certainty.`
    - `I know what I want, but I do not act on it.`
    - `I keep replaying the same conversation.`
- Why this may work:
  - Stronger for cold paid traffic
  - Makes the visitor self-identify before they understand the product
- Risks:
  - Could feel intense if not balanced with calm product proof

## Iteration C — Product-First Early App Landing Page

- Status: concept
- Hero promise direction:
  - `Your thoughts, reflected back as patterns.`
- Primary CTA:
  - `Open MindMirror`
  - Use only once the real app loop is strong enough
- Visual direction:
  - Lead with the actual `/account` workspace
  - Show entry capture, pattern dashboard, and recent mirrors
- Why this may work:
  - Best once the app is usable
  - Moves us from validation funnel to product-led conversion
- Risks:
  - Too early until AI analysis is meaningfully better than heuristics

## Preservation Rules

- Keep each meaningful landing direction as one of:
  - a Git commit
  - a branch named `codex/landing-*`
  - a screenshot in `references/landing-screenshots/`
  - a route variant such as `/landing/phone-preview` if we want live A/B testing later
- Do not overwrite a promising version without either committing it or saving a screenshot.
- For first ads, test one main page only unless analytics are fully clean.
