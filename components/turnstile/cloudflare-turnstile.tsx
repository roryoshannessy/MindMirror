"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; theme?: "light" | "dark" | "auto"; callback?: (token: string) => void },
      ) => string;
      remove: (id: string) => void;
      getResponse: (id: string) => string | undefined;
      reset: (id: string) => void;
    };
  }
}

export type CloudflareTurnstileHandle = {
  getToken: () => string | undefined;
  reset: () => void;
};

type Props = { className?: string };

export const CloudflareTurnstile = forwardRef<CloudflareTurnstileHandle, Props>(
  function CloudflareTurnstile({ className }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      getToken: () => {
        if (typeof window === "undefined" || !window.turnstile || !widgetId.current) {
          return undefined;
        }
        return window.turnstile.getResponse(widgetId.current);
      },
      reset: () => {
        if (typeof window === "undefined" || !window.turnstile || !widgetId.current) return;
        window.turnstile.reset(widgetId.current);
      },
    }));

    useEffect(() => {
      if (!siteKey || !containerRef.current) return;

      const mount = () => {
        const el = containerRef.current;
        if (!el || !window.turnstile) return;
        widgetId.current = window.turnstile.render(el, {
          sitekey: siteKey,
          theme: "dark",
        });
      };

      if (window.turnstile) {
        mount();
        return () => {
          if (widgetId.current && window.turnstile) {
            window.turnstile.remove(widgetId.current);
            widgetId.current = null;
          }
        };
      }

      const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
      if (existing) {
        const iv = window.setInterval(() => {
          if (window.turnstile) {
            window.clearInterval(iv);
            mount();
          }
        }, 50);
        return () => {
          window.clearInterval(iv);
          if (widgetId.current && window.turnstile) {
            window.turnstile.remove(widgetId.current);
            widgetId.current = null;
          }
        };
      }

      const sc = document.createElement("script");
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      sc.async = true;
      sc.defer = true;
      sc.onload = () => mount();
      document.head.appendChild(sc);

      return () => {
        if (widgetId.current && window.turnstile) {
          window.turnstile.remove(widgetId.current);
          widgetId.current = null;
        }
      };
    }, [siteKey]);

    if (!siteKey) return null;
    return <div ref={containerRef} className={className} />;
  },
);
