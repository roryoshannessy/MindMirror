# MindMirror Launch QA Scratchpad

Last updated: May 13, 2026

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
- Firebase lead capture: code path implemented; re-verify with one fresh mobile QA run before ads

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
- Run Stripe decline matrix.
- Run one fresh mobile screen recording from ad URL through checkout/refund.
