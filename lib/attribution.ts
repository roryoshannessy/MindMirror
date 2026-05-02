import { brand } from "@/config/brand";
import type { AttributionTouch, LeadAttributionInput } from "@/lib/lead-attribution.types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type Stored = { touch: AttributionTouch; storedAt: number };

function storageKeys() {
  const p = brand.STORAGE_PREFIX;
  return { first: `${p}_attribution`, last: `${p}_attribution_last` } as const;
}

function pickParam(qs: URLSearchParams, key: string): string | null {
  const v = qs.get(key);
  if (!v) return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, 512) : null;
}

/** Returns partial only when at least one marketing param is present. */
function parseMarketingParams(search: string): Partial<AttributionTouch> | null {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const qs = new URLSearchParams(q);
  const utmSource = pickParam(qs, "utm_source");
  const utmMedium = pickParam(qs, "utm_medium");
  const utmCampaign = pickParam(qs, "utm_campaign");
  const utmTerm = pickParam(qs, "utm_term");
  const utmContent = pickParam(qs, "utm_content");
  const fbclid = pickParam(qs, "fbclid");
  const gclid = pickParam(qs, "gclid");
  const msclkid = pickParam(qs, "msclkid");
  if (
    !utmSource &&
    !utmMedium &&
    !utmCampaign &&
    !utmTerm &&
    !utmContent &&
    !fbclid &&
    !gclid &&
    !msclkid
  ) {
    return null;
  }
  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    fbclid,
    gclid,
    msclkid,
  };
}

function buildTouch(
  partial: Partial<AttributionTouch>,
  landingPage: string,
  referrer: string,
): AttributionTouch {
  return {
    utmSource: partial.utmSource ?? null,
    utmMedium: partial.utmMedium ?? null,
    utmCampaign: partial.utmCampaign ?? null,
    utmTerm: partial.utmTerm ?? null,
    utmContent: partial.utmContent ?? null,
    fbclid: partial.fbclid ?? null,
    gclid: partial.gclid ?? null,
    msclkid: partial.msclkid ?? null,
    landingPage: landingPage.slice(0, 2048),
    referrer: referrer.slice(0, 2048),
    capturedAt: new Date().toISOString(),
  };
}

function readStored(key: string): Stored | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (typeof s.storedAt !== "number" || !s.touch || typeof s.touch.capturedAt !== "string") {
      return null;
    }
    if (Date.now() - s.storedAt > THIRTY_DAYS_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeStored(key: string, touch: AttributionTouch) {
  const stored: Stored = { touch, storedAt: Date.now() };
  localStorage.setItem(key, JSON.stringify(stored));
}

/**
 * Reads URL params on the current page and updates last-touch; sets first-touch once (30d TTL).
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return;

  const { first, last } = storageKeys();
  const search = window.location.search ?? "";
  const partial = parseMarketingParams(search);
  const landingPage = `${window.location.pathname}${search}`;
  const referrer = document.referrer || "";

  const existingFirst = readStored(first);

  if (partial) {
    const touch = buildTouch(partial, landingPage, referrer);
    writeStored(last, touch);
    if (!existingFirst) {
      writeStored(first, touch);
    }
  }
}

export function readLeadAttributionInput(): LeadAttributionInput {
  if (typeof window === "undefined") {
    return { firstTouch: null, lastTouch: null };
  }
  const { first, last } = storageKeys();
  const f = readStored(first);
  const l = readStored(last);
  return {
    firstTouch: f?.touch ?? null,
    lastTouch: l?.touch ?? null,
  };
}
