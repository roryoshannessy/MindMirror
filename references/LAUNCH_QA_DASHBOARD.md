# MindMirror Launch QA Dashboard

Last updated: June 9, 2026

Use this before any paid ad spend. The goal is not perfection. The goal is to confirm that a cold mobile user can understand the offer, complete the funnel, and try the first MindMirror loop without trust-breaking confusion.

## Gate 1 — Production Is Stable

Status: Not started

- [ ] Production homepage loads: https://getmindmirror.com
- [ ] Mobile homepage first screen explains: speak one thought, see the recurring loop
- [ ] Mobile homepage CTA goes to the quiz
- [ ] Pricing page says early beta access, not waitlist-only
- [ ] Privacy page discloses AI processing
- [ ] Terms page discloses AI processing
- [ ] No obvious broken layout on iPhone Safari/Chrome

## Gate 2 — Quiz Is Clear

Status: Not started

- [ ] Q1 audience/use-case options are understandable
- [ ] Anxiety branch stays anxiety-specific
- [ ] Founder branch stays founder/business-specific
- [ ] Habit branch stays habit-specific
- [ ] Result page explains the thought pattern in plain English
- [ ] Result page has one obvious next CTA
- [ ] No confusing duplicate checkout buttons on mobile

## Gate 3 — Checkout Works

Status: Not started

- [ ] Checkout email step is clear
- [ ] Review page says early beta access
- [ ] Stripe checkout opens with correct product/price
- [ ] Return page tells the user to claim their account
- [ ] Claim email arrives
- [ ] Claim link opens the account/welcome page

## Gate 4 — Product Loop Works

Status: Not started

- [ ] Sign-in works on phone
- [ ] `/en/account` opens after sign-in
- [ ] User can type a reflection
- [ ] User can use browser dictation where available
- [ ] Raw entry saves privately
- [ ] Mirror generates or deterministic fallback appears
- [ ] Mirror includes private mirror, loop, emotion, trigger/context, forgetting, questions, and one next action
- [ ] User can answer a follow-up question
- [ ] Second-layer reflection appears
- [ ] Existing entries can be deleted

## Gate 5 — Analytics And Attribution

Status: Not started

- [ ] Meta Pixel PageView visible in Events Manager
- [ ] Lead event fires from quiz/email capture
- [ ] InitiateCheckout fires
- [ ] Purchase fires in browser Pixel
- [ ] CAPI Purchase fires server-side
- [ ] Browser/CAPI purchase dedupe works by event ID
- [ ] PostHog records landing, quiz, checkout, and purchase events

## Gate 6 — Trust And Safety

Status: Not started

- [ ] Privacy page mentions AI provider processing
- [ ] Terms page mentions AI provider processing
- [ ] Product does not claim to replace therapy
- [ ] FAQ therapy disclaimer is visible
- [ ] Voice dictation disclosure appears before recording
- [ ] No fake clinical claims or fake professional endorsements
- [ ] Refund/beta/payment language is consistent

## Gate 7 — Launch Decision

Status: Not started

Do not launch paid ads until:

- [ ] Gates 1-4 pass on a real phone
- [ ] Gate 5 has at least PageView, InitiateCheckout, and Purchase visible
- [ ] Gate 6 has no major trust issue
- [ ] You have at least 3 ad creatives ready
- [ ] You have a daily budget cap decided

## First Ad Test Notes

- Recommended first spend: small controlled test only
- Primary objective: purchase intent, not scale
- Stop conditions:
  - broken checkout
  - analytics not firing
  - users confused about beta/payment status
  - no one reaches checkout after meaningful clicks

