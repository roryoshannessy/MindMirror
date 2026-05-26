# MindMirror Launch QA Scratchpad

Last updated: May 17, 2026

Use this file as the working log before sending paid traffic. Each run should record:

- Date/time
- Device/browser
- Email used
- Entry URL
- Plan selected
- Stripe result
- Firebase result
- PostHog/Meta result
- Notes/screenshots

## Current Readiness

- Production domain: `https://getmindmirror.com`
- Current launch locale: English only
- Current quiz route: `/quiz`
- Future locale route pattern: `/es/quiz`, `/pt/quiz`, `/pl/quiz`, etc.
- Meta Pixel ID deployed: `26709756288674893`
- CAPI token: still pending
- Stripe refund email: verified
- Firebase lead capture: verified for quiz and checkout in the May 16 mobile QA run
- PostHog: do not launch until the production key/events are confirmed; May 16 QA showed no PostHog IDs on the lead/checkout records
- Attribution: checkout now uses last-touch for the purchase attribution snapshot and stores both first-touch and last-touch on new checkout sessions
- Attribution patch deploy: confirmed in production with checkout `chk_b6461a47bcc35f68ae8200096fe4b3e1`
- Quiz result CTA: now points to the monthly refundable checkout path, not the annual `$0 today` trial path
- Purchase analytics: return-page `purchase_completed` can use Stripe-paid amount from the checkout session when available

## Attribution Simulation URLs

Use these to mimic paid traffic before real ads.

Meta-style test:

```text
https://getmindmirror.com/quiz?utm_source=facebook&utm_medium=paid_social&utm_campaign=qa_launch_test&utm_content=ad_variant_a&utm_term=founders&fbclid=qa_fbclid_001
```

Instagram-style test:

```text
https://getmindmirror.com/quiz?utm_source=instagram&utm_medium=paid_social&utm_campaign=qa_launch_test&utm_content=story_variant_a&fbclid=qa_igclid_001
```

Generic paid test:

```text
https://getmindmirror.com/quiz?utm_source=test_network&utm_medium=cpc&utm_campaign=qa_launch_test&utm_content=quiz_flow
```

Expected:

- Attribution is captured at landing.
- Quiz answers are saved.
- Email lead is written to Firestore.
- Checkout session preserves `funnelSessionId`.
- Purchase/refund paths keep enough context to reconcile the user.

## Core Funnel Tests

| Test | Entry | Expected |
| --- | --- | --- |
| Landing to quiz | `/` -> CTA | Quiz opens at step 1 |
| Direct quiz from ad | attribution URL above | Attribution stored before email gate |
| Quiz completion | Any valid path | Result profile appears |
| Email gate | New test email | Firestore lead created |
| Checkout email | New test email | Checkout review opens |
| Annual checkout | Annual plan | Stripe Checkout shows trial and `$0 today` |
| Monthly checkout | Monthly plan | Stripe charges immediately |
| Return success | Successful payment | Return page shows success |
| Refund | Refund monthly charge in Stripe | Return/resume state shows refunded; email sent |
| Existing subscriber | Same email again | App blocks duplicate subscription clearly |

## QA Runs

### May 17, 2026 — Launch Blocker Fix Pass

- Purpose: remove the mismatch between tested monthly refund QA and the quiz's previous annual trial CTA.
- Changes:
  - Quiz result CTA now prefers `mindmirror-monthly`.
  - CTA copy now says `Join early access — refundable $12.99`.
  - Checkout success copy now says `Checkout received — waitlist only`.
  - Legal terms now include an early-access demand-test refund exception.
  - Stripe `invoice.paid` webhook now stores `amountPaidCents` and `currency` on the checkout session.
  - Checkout resume now returns `amountPaidCents` and `currency` for settled purchases.
  - Browser purchase analytics now uses actual paid amount when available instead of blindly using catalog price.
- Verification:
  - `npm run lint` passed with the existing PostCSS warning only.
  - `npm run build` passed after rerunning with network access for Google Fonts.
- Still blocked:
  - `NEXT_PUBLIC_POSTHOG_KEY` is not available locally and was not found embedded in the live production bundle.
  - Vercel CLI is not logged in on this machine, so env vars were not verified or updated from Codex.
  - Production must be redeployed after adding `NEXT_PUBLIC_POSTHOG_KEY`.
  - One clean mobile QA from a fake Meta URL must still confirm PostHog events and Firestore PostHog IDs.

### May 16, 2026 — Mobile Fake Meta → Quiz → Monthly Checkout → Refund

- Device/browser: Codex in-app browser, mobile viewport `390x844`
- Email used: `rory.oshannessy+codexqa20260516a@gmail.com`
- Entry URL:

```text
https://getmindmirror.com/quiz?utm_source=facebook&utm_medium=paid_social&utm_campaign=qa_launch_test&utm_content=ad_variant_a&utm_term=founders&fbclid=qa_fbclid_codex_20260516
```

- Quiz path:
  - Role: Professional / Executive
  - Struggle: I overthink everything and go in circles
  - Journal habit: Sometimes — but I'm not consistent
  - Goal: More confidence in my decisions
  - Awareness: Somewhat — I try but miss things
  - Name: Rory QA
- Quiz session ID: `5f733792-720d-4035-a9b0-40db46a3415c`
- Checkout session ID: `chk_133c62b11d2b897732578f648820d00c`
- Plan selected: `mindmirror-monthly`
- Stripe result: `$12.99` sandbox charge succeeded, then full refund succeeded
- Refund result:
  - Firestore checkout status: `refunded`
  - Firestore entitlement status: `refunded`
  - Firestore user billing: `free` / `refunded`
  - Stripe subscription cancellation: `cancelled`
  - Refund email status: `sent`
  - Return page copy: `Refund confirmed — waitlist only`
- Firebase result:
  - Lead exists
  - Lead source: `quiz`
  - Lead last capture source: `checkout`
  - `convertedToUser`: `true`
  - `funnelSessionId` preserved from quiz to checkout
  - Meta `_fbp` and `_fbc` captured
  - Quiz payload completed
- Attribution note:
  - This browser had an older test `firstTouch` from May 12.
  - The May 16 fake Meta URL was correctly stored as `lastTouch`.
  - Before the attribution patch, checkout purchase acquisition used the older `firstTouch`; new checkout sessions now use `lastTouch` for purchase attribution and store both touches.
- PostHog note:
  - Firestore showed no `posthogDistinctId` or `posthogSessionId` for the May 16 lead/checkout.
  - Production bundle check found PostHog code but no embedded public PostHog key.
  - This must be resolved or manually confirmed in PostHog before paid ads.

### May 16, 2026 — Production Attribution Patch Smoke Test

- Email used: `rory.oshannessy+codexqa20260516b@gmail.com`
- Checkout session ID: `chk_b6461a47bcc35f68ae8200096fe4b3e1`
- Purpose: confirm checkout attribution patch deployed before the next paid-traffic QA.
- Result:
  - Checkout `attributionSnapshot.acquisition` used the current fake Meta click:
    - `utmSource`: `facebook`
    - `utmMedium`: `paid_social`
    - `utmCampaign`: `qa_after_patch`
    - `fbclid`: `qa_fbclid_after_patch_20260516`
  - Checkout also stored `attributionTouches.firstTouch` and `attributionTouches.lastTouch`.
  - PostHog IDs were still null, which points to missing/invalid production PostHog public key rather than attribution capture.

### May 20, 2026 — Job 1 Launch-Safety Audit

- Purpose: fresh check of paid-traffic readiness before UI work.
- Production bundle checks:
  - `NEXT_PUBLIC_POSTHOG_KEY` is now embedded in the live browser bundle.
  - Meta Pixel ID `26709756288674893` is embedded in the live browser bundle.
  - Quiz bundle contains `quiz_started`, `email_captured`, and `quiz_completed`.
  - Checkout return bundle contains `purchase_completed` and refund-status handling.
  - PostHog proxy `/t` responds through Vercel.
  - CAPI cron endpoint returns `401` without auth, as expected.
- Production Firestore sanitized audit:
  - Leads collection has records from recent QA.
  - Latest lead has PostHog distinct/session IDs.
  - Latest monthly checkout/refund session `chk_26d6572dc132454bb851062a665ccd18` stored:
    - plan `mindmirror-monthly`
    - status `refunded`
    - purchase event id `purchase_chk_26d6572dc132454bb851062a665ccd18`
    - UTM source/medium/campaign/term/content
    - `fbclid`
    - Meta `_fbp` and `_fbc`
    - PostHog distinct/session IDs
    - refund status `refunded`
    - refund email status `sent`
  - `capi_purchase_events` still show `skipped_not_configured`.
  - `capi_purchases_pending` still has a `pending_configuration` document.
  - `capi_purchases_processed` is empty.
- Current blockers:
  - Meta CAPI token is still not configured/verified.
  - Need one fresh mobile QA user after PostHog key is live to confirm actual PostHog events in the dashboard.
  - Need Events Manager proof for Pixel PageView/Purchase and CAPI dedupe once CAPI token exists.
- UI deployment note:
  - Production has the safer checkout/refund/quiz-result language.
  - The latest landing-page redesign/copy polish is still local and not yet deployed.

## Stripe Test Cards

Use future expiry, any valid CVC, and any postal code unless Stripe asks otherwise.

| Scenario | Card |
| --- | --- |
| Success | `4242 4242 4242 4242` |
| Generic decline | `4000 0000 0000 0002` |
| Insufficient funds | `4000 0000 0000 9995` |
| Lost card | `4000 0000 0000 9987` |
| Stolen card | `4000 0000 0000 9979` |
| Expired card | `4000 0000 0000 0069` |
| Incorrect CVC | `4000 0000 0000 0127` |
| Processing error | `4000 0000 0000 0119` |
| 3DS required, succeeds after auth | `4000 0000 0000 3220` |
| 3DS required, declined after auth | `4000 0084 0000 1629` |
| 3DS required, processing error | `4000 0084 0000 1280` |

## Localization Notes

Do not launch paid Spanish traffic until the full path is translated:

- Landing page
- Quiz
- Email gate
- Checkout/review copy
- Refund email
- Auth emails or fallback instructions
- Terms/privacy summaries where needed

When ready, ad URLs should point directly to localized paths, for example:

```text
https://getmindmirror.com/es/quiz?utm_source=facebook&utm_medium=paid_social&utm_campaign=spanish_test
```

## Open QA Items

- Add `META_CAPI_ACCESS_TOKEN`.
- Add `META_CAPI_TEST_EVENT_CODE` only while using Meta Test Events.
- Verify browser Pixel PageView in Meta Events Manager.
- Verify Pixel Purchase and CAPI Purchase dedupe once CAPI token exists.
- Production `NEXT_PUBLIC_POSTHOG_KEY` is now embedded; verify `quiz_started`, `email_captured`, `quiz_completed`, and `purchase_completed` appear in PostHog for a single known fresh test email/session.
- Re-run one fresh mobile QA after the attribution patch deploys, using a fresh/incognito browser or cleared storage.
- Run Stripe decline matrix.
- Run one fresh mobile screen recording from ad URL through checkout/refund.
