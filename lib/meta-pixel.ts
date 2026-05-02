declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const SCRIPT_ID = "mm-meta-pixel-fbevents";

function pixelId(): string | null {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return null;
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  return id && id.length > 0 ? id : null;
}

let initDone = false;
let loadPromise: Promise<void> | null = null;

function injectPixelScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.fbq) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const waitForFbq = (started: number) => {
      if (window.fbq) {
        resolve();
        return;
      }
      if (Date.now() - started > 15_000) {
        loadPromise = null;
        reject(new Error("Meta Pixel: fbq not available"));
        return;
      }
      requestAnimationFrame(() => waitForFbq(started));
    };

    if (document.getElementById(SCRIPT_ID)) {
      waitForFbq(Date.now());
      return;
    }

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    s.onload = () => waitForFbq(Date.now());
    s.onerror = () => {
      loadPromise = null;
      reject(new Error("Meta Pixel script failed to load"));
    };
    document.head.appendChild(s);
  });

  return loadPromise;
}

/** Resolves when `fbq` is available (script loaded + `init` run). */
export function ensureMetaPixelReady(): Promise<void> {
  const id = pixelId();
  if (!id || typeof window === "undefined") return Promise.resolve();

  return injectPixelScript().then(() => {
    if (!window.fbq) return;
    if (!initDone) {
      window.fbq("init", id);
      initDone = true;
    }
  });
}

/** Reserved for a single bootstrap path; PostHogProvider drives pixel today. */
export function initPixel(): void {
  if (typeof window === "undefined") return;
  void ensureMetaPixelReady().catch(() => {
    /* optional */
  });
}

export function trackPixelPageView(): void {
  if (typeof window === "undefined") return;
  if (!pixelId()) return;
  if (window.fbq) {
    window.fbq("track", "PageView");
  }
}

export function identifyPixelUser(externalId: string): void {
  if (typeof window === "undefined") return;
  if (!pixelId() || !window.fbq) return;
  window.fbq("set", "userId", externalId);
}

export function trackPixelPurchase(args: {
  value: number;
  currency: string;
  contentName?: string;
  eventId: string;
}): void {
  if (typeof window === "undefined") return;
  if (!pixelId() || !window.fbq) return;
  window.fbq(
    "track",
    "Purchase",
    {
      value: args.value,
      currency: args.currency,
      content_name: args.contentName,
    },
    { eventID: args.eventId },
  );
}

export function getMetaCookies(): { fbp: string | undefined; fbc: string | undefined } {
  if (typeof document === "undefined") {
    return { fbp: undefined, fbc: undefined };
  }
  const raw = document.cookie;
  const pick = (name: string): string | undefined => {
    const parts = raw.split(";").map((p) => p.trim());
    const prefix = `${name}=`;
    for (const p of parts) {
      if (p.startsWith(prefix)) {
        return decodeURIComponent(p.slice(prefix.length));
      }
    }
    return undefined;
  };
  return { fbp: pick("_fbp"), fbc: pick("_fbc") };
}
