import type { Metadata } from "next";
import { brand } from "@/config/brand";

interface BuildPageMetadataOptions {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: BuildPageMetadataOptions): Metadata {
  const url = `https://${brand.DOMAIN}${path}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
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
      title,
      description,
      site: brand.TWITTER,
      images: ["/og-default.png"],
    },
  };
}
