# Adversarial Review: CAPI Attribution Fix

## Status: BLOCKER FOUND - AD-READY: NO

---

## BLOCKER #1: Event ID Mismatch Breaks Pixel/CAPI Deduplication

### The Problem

Pixel and CAPI send different event_ids in the fallback case (when subscriptionId is null).

**Pixel event_id** (`lib/checkout-analytics.client.ts` line 13-16):
```typescript
props.uid && props.subscriptionId
  ? `purchase_${props.uid}_${props.subscriptionId}`
  : `purchase_${props.planId}_${Date.now()}`;  // ← FALLBACK
```

**CAPI event_id** (`app/api/cron/capi-batcher/route.ts` line 33-38):
```typescript
function buildEventId(uid: string, subscriptionId: string | null, invoiceId: string): string {
  if (uid && subscriptionId) {
    return `purchase_${uid}_${subscriptionId}`;
  }
  return `purchase_${invoiceId}`;  // ← FALLBACK
}
```

### When This Breaks

If `subscriptionId` is null (e.g., Stripe invoice.parent.subscription_details.subscription is missing):

- **Pixel sends:** `purchase_mindmirror-monthly_1738425600000`
- **CAPI sends:** `purchase_inv_1234567890`

Meta receives two different event_ids for the same purchase → counts as 2 events → double-counts revenue.

### Impact

- ✗ CAPI deduplication breaks
- ✗ Meta sees inflated revenue (double-counting)
- ✗ Attribution model is confused

### Likelihood

**MEDIUM RISK** — subscriptionId should normally be present (Stripe creates subscriptions on first payment), but defensive code assumes it might be null. If it ever is null in production, deduplication breaks silently.

---

## BLOCKER #2: No Manual Verification Performed

### The Claim

I claimed: "TypeScript compiles. Build succeeds. Ad-ready YES."

### The Reality

- ✓ TypeScript compiles (verified)
- ✓ Build succeeds (verified)
- ✗ **Actual checkout → webhook → CAPI flow NOT tested**
- ✗ **No verification that checkout_sessions actually contains attributionSnapshot at webhook time**
- ✗ **No verification that CAPI payload includes fbp/fbc**
- ✗ **No verification that Meta receives Purchase events**

**Declaring "AD-READY YES" without end-to-end testing is unjustified.**

---

## Architecture Concerns (Non-Blockers)

### Concern #1: checkoutSessionId Lookup Failure Handling

**Code** (`app/api/webhooks/stripe/route.ts` lines 110-121):
```typescript
let checkoutAttribution = null;
if (checkoutSessionId) {
  try {
    const checkoutSnap = await db.doc(`checkout_sessions/${checkoutSessionId}`).get();
    if (checkoutSnap.exists) {
      const checkoutData = checkoutSnap.data();
      checkoutAttribution = checkoutData?.attributionSnapshot ?? null;
    }
  } catch (e) {
    console.warn(`[stripe webhook] failed to read checkout session ${checkoutSessionId}`, e);
  }
}
```

**Issue:** If the checkout_sessions document is missing, attribution is silently lost. No error, just logs a warning.

**Why it's not a blocker:** Code falls back to lead data, which is better than nothing. But we should verify this doesn't happen in practice.

### Concern #2: Attribution Only Preserved if Checkout Session Exists

**Risk:** If a checkout session is somehow deleted or the database is corrupted, the attribution in capi_purchases_pending will have `attributionContext: null`, and CAPI will use stale lead data.

**Severity:** Low (extremely unlikely in practice, but possible edge case).

### Concern #3: Trial → Paid Not Handled

As noted in the original spec: trial-to-paid conversion tracking is not implemented. 

- If a user converts on trial ($5), CAPI sends value=$5
- If they upgrade to annual ($79.99), a new invoice.paid fires, but CAPI doesn't know it's an upgrade
- Meta receives two separate Purchase events instead of one order with two line items
- This is not broken, just suboptimal for LTV optimization

Not a blocker for ads, but limits Meta's ability to optimize for high-value customers.

---

## Questions Answered (Verification Results)

### ✓ Q1: Does `PurchaseAttributionSnapshot` preserve attribution without breaking reads/writes?

**YES.** Type added correctly:
```typescript
attributionContext: CommercialAttributionContext | null;
```

- Backward compatible (null is valid)
- TypeScript compiles
- No migration needed

### ✓ Q2: Does Stripe webhook know the correct `checkoutSessionId`?

**YES.** checkoutSessionId is extracted from:
1. invoice.metadata.checkoutSessionId
2. subscription.metadata.checkoutSessionId (via Stripe API)

Both paths are populated from metaBase in /api/checkout/session.

### ✓ Q3: Does webhook have access to checkout_sessions/{id} document?

**YES.** Code reads:
```typescript
const checkoutSnap = await db.doc(`checkout_sessions/${checkoutSessionId}`).get();
```

With graceful failure handling (try/catch, warning log).

### ✓ Q4: Is `attributionContext` copied into `capi_purchases_pending`?

**YES.** Webhook stores:
```typescript
attributionSnapshot: snap,
```

Where snap includes `attributionContext: checkoutAttribution`.

### ✓ Q5: Does CAPI batcher read `attributionContext` correctly?

**YES.** Code reads:
```typescript
const checkoutAttribution = attribution?.attributionContext?.matching;
```

### ✓ Q6: Does it prefer checkout fbp/fbc over lead?

**YES.** Batcher does:
```typescript
fbp:
  (checkoutAttribution?.metaFbp as string | undefined) ??
  (leadData.metaFbp as string | undefined) ??
  null,
```

Checkout-time values checked first.

### ✓ Q7: Does it fall back safely to lead data?

**YES.** If checkoutAttribution is null, falls back to leadData.metaFbp.

### ✗ Q8: Does Meta CAPI receive correct Purchase payload?

**PARTIALLY.** CAPI sends:
- ✓ event_name: "Purchase"
- ✓ event_time: (correct timestamp)
- ✗ event_id: **POTENTIALLY WRONG** (see blocker #1)
- ✓ user_data.email
- ✓ user_data.external_id (uid)
- ✓ user_data.fbp (from checkout or lead)
- ✓ user_data.fbc (from checkout or lead)
- ✓ custom_data.value
- ✓ custom_data.currency
- ✓ custom_data.content_name

### ✗ Q9: Is Pixel/CAPI deduplication still valid?

**NO.** Event IDs don't match in fallback case (see blocker #1).

### ⏳ Q10: Trial/subscription edge cases?

Not broken, but trial-to-paid not optimized. Not a blocker.

### ⏳ Q11: Browser-change or resumed-checkout paths?

- Browser change: fbp/fbc updated at checkout time ✓ (checkout session reads current cookies)
- Resumed checkout: Uses original checkout_sessions document ✓ (attribution preserved)

No issues found.

### ✗ Q12: Is "AD-READY YES" justified?

**NO.**

- Blocker #1 (event_id mismatch) must be fixed
- No end-to-end test performed
- Claim made without actual checkout verification

---

## Final Verification Checklist

- [x] TypeScript compiles
- [x] Build succeeds
- [ ] Actual checkout → payment completes
- [ ] Stripe webhook fires and reads checkout_sessions
- [ ] capi_purchases_pending record contains attributionContext with matching data
- [ ] CAPI batcher reads it and sends event_id that matches Pixel
- [ ] Meta Events Manager shows Purchase event with fbp/fbc
- [ ] event_id is identical on Pixel and CAPI (deduplication works)

**Completed:** 2/8  
**Blocked by:** Blocker #1 + lack of manual testing

---

## What Must Happen Before AD-READY YES

### Fix #1 (Required): Align Event ID Fallback Format

Both Pixel and CAPI must use the same fallback format when subscriptionId is null.

**Option A (recommended):** Use invoiceId as fallback in both
```typescript
// Pixel: checkout-analytics.client.ts
const eventId =
  props.uid && props.subscriptionId
    ? `purchase_${props.uid}_${props.subscriptionId}`
    : `purchase_${props.subscriptionId || props.planId}`;  // Or use invoiceId if available

// CAPI: capi-batcher
function buildEventId(uid: string, subscriptionId: string | null, invoiceId: string): string {
  if (uid && subscriptionId) {
    return `purchase_${uid}_${subscriptionId}`;
  }
  return `purchase_${invoiceId}`;  // ← Already correct
}
```

**Option B:** Ensure subscriptionId is never null
- Verify Stripe always includes subscription in invoice metadata
- Log/alert if subscriptionId is missing (don't silently continue)

### Fix #2 (Required): Manual End-to-End Test

Run a real checkout on staging and verify:
1. Complete quiz with UTM params
2. Proceed through email gate
3. Go to Stripe Checkout
4. Pay with test card
5. Check Firestore:
   - `checkout_sessions/{id}.attributionSnapshot` exists ✓
   - `capi_purchases_pending/{invoiceId}.attributionSnapshot.attributionContext` exists ✓
6. Wait for CAPI batch to run (or trigger manually)
7. Check Meta Events Manager:
   - Purchase event appears with fbp/fbc ✓
   - event_id matches Pixel format ✓
8. Verify no double-counting of revenue in Meta

---

## Recommendation

**DO NOT DEPLOY** until:

1. ✓ Fix event_id mismatch (blocker #1)
2. ✓ Run manual end-to-end test
3. ✓ Verify Meta receives correct Purchase event
4. ✓ Confirm Pixel and CAPI deduplicate correctly

**Estimated time:** 1-2 hours (30 min fix + 30-60 min testing)

---

## Summary Table

| Check | Status | Evidence |
|-------|--------|----------|
| TypeScript | ✓ Pass | Compiles without errors |
| Build | ✓ Pass | npm run build succeeds |
| Attribution schema | ✓ Pass | PurchaseAttributionSnapshot type correct |
| Webhook reads checkout | ✓ Pass | Code reads checkoutData?.attributionSnapshot |
| CAPI reads checkout fbp/fbc | ✓ Pass | Batcher prefers checkoutAttribution?.metaFbp |
| Event ID format (Pixel) | ✓ Pass | Correct format when subscriptionId exists |
| Event ID format (CAPI) | ✓ Pass | Correct format when subscriptionId exists |
| Event ID fallback match | ✗ FAIL | Pixel: `_{timestamp}`, CAPI: `_{invoiceId}` (BLOCKER) |
| End-to-end test | ✗ NOT DONE | No actual checkout performed |
| Meta verification | ✗ NOT DONE | No check that Meta received events |

**AD-READY: NO** — Blocker #1 + manual testing required.

