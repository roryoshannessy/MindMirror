import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const runtime = "nodejs";
export const alt = brand.NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 32,
            letterSpacing: "-2px",
          }}
        >
          {brand.NAME}
        </div>

        <div
          style={{
            fontSize: 36,
            color: "#a0aec0",
            textAlign: "center",
            marginBottom: 48,
            maxWidth: "90%",
            lineHeight: 1.3,
          }}
        >
          {brand.TAGLINE}
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#6366f1",
            }}
          />
          <span
            style={{
              fontSize: 20,
              color: "#cbd5e1",
              fontWeight: 500,
            }}
          >
            See what you keep thinking but never change
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
