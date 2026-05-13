export type NavLink = {
  labelKey: string;
  href: string;
  variant?: "default" | "cta";
};

export type FooterLink = {
  labelKey: string;
  href: string;
};

export const siteConfig = {
  nav: [
    { labelKey: "how_it_works", href: "/#how-it-works" },
    { labelKey: "pricing", href: "/pricing" },
    { labelKey: "quiz", href: "/quiz", variant: "cta" },
  ] satisfies NavLink[],
  footer: {
    product: [
      { labelKey: "pricing", href: "/pricing" },
      { labelKey: "how_it_works", href: "/#how-it-works" },
      { labelKey: "quiz", href: "/quiz" },
    ] satisfies FooterLink[],
    legal: [
      { labelKey: "terms", href: "/legal/terms" },
      { labelKey: "privacy", href: "/legal/privacy" },
    ] satisfies FooterLink[],
    support: [
      {
        labelKey: "support_contact",
        href: "mailto:support@getmindmirror.com",
      },
    ] satisfies FooterLink[],
  },
} as const;
