import { createHash } from "crypto";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = "https://graph.facebook.com";

function pixelId(): string | null {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null;
}

function accessToken(): string | null {
  return process.env.META_CAPI_ACCESS_TOKEN?.trim() || null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

function sha256Raw(value: string): string {
  return createHash("sha256").update(value.trim()).digest("hex");
}

export type CapiUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  /** Passed unhashed. */
  fbp?: string | null;
  /** Passed unhashed. */
  fbc?: string | null;
  /** Passed unhashed. */
  clientIpAddress?: string | null;
  /** Passed unhashed. */
  clientUserAgent?: string | null;
  externalId?: string | null;
};

export type SendPurchaseOptions = {
  eventId: string;
  /** Unix seconds. */
  eventTime: number;
  eventSourceUrl?: string | null;
  userData: CapiUserData;
  customData: {
    value: number;
    currency: string;
    contentName?: string | null;
  };
  /** If set, routes the event to the test event group in Events Manager. */
  testEventCode?: string | null;
};

function buildUserData(u: CapiUserData): Record<string, string | undefined> {
  return {
    em: u.email ? sha256(u.email) : undefined,
    ph: u.phone ? sha256(u.phone) : undefined,
    fn: u.firstName ? sha256(u.firstName) : undefined,
    ln: u.lastName ? sha256(u.lastName) : undefined,
    ct: u.city ? sha256(u.city) : undefined,
    st: u.state ? sha256(u.state) : undefined,
    zp: u.zip ? sha256Raw(u.zip) : undefined,
    country: u.country ? sha256(u.country) : undefined,
    external_id: u.externalId ? sha256(u.externalId) : undefined,
    // Unhashed fields
    fbp: u.fbp ?? undefined,
    fbc: u.fbc ?? undefined,
    client_ip_address: u.clientIpAddress ?? undefined,
    client_user_agent: u.clientUserAgent ?? undefined,
  };
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * Send a Purchase event to Meta CAPI.
 * Returns `{ ok: true }` on success, `{ ok: false; error: string }` on failure.
 * No-ops silently when NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN are not set.
 */
export async function sendPurchase(opts: SendPurchaseOptions): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const pid = pixelId();
  const token = accessToken();
  if (!pid || !token) {
    return { ok: true }; // not configured — treat as no-op
  }

  const userData = stripUndefined(buildUserData(opts.userData) as Record<string, unknown>);

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: opts.eventTime,
        event_id: opts.eventId,
        event_source_url: opts.eventSourceUrl ?? undefined,
        action_source: "website",
        user_data: userData,
        custom_data: stripUndefined({
          value: opts.customData.value,
          currency: opts.customData.currency,
          content_name: opts.customData.contentName ?? undefined,
        }),
      },
    ],
    access_token: token,
  };

  if (opts.testEventCode) {
    payload.test_event_code = opts.testEventCode;
  }

  const url = `${GRAPH_BASE}/${GRAPH_API_VERSION}/${pid}/events`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    return { ok: false, error: `CAPI HTTP ${res.status}: ${text.slice(0, 512)}` };
  }

  return { ok: true };
}
