import type { Metadata, Viewport } from "next";
import { brand } from "@/config/brand";
import { sans, mono } from "@/config/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.DOMAIN}`),
  title: {
    default: brand.NAME,
    template: `%s · ${brand.NAME}`,
  },
  description: brand.DESCRIPTION,
  openGraph: {
    siteName: brand.NAME,
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: brand.NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: brand.TWITTER,
    images: ["/og-default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
