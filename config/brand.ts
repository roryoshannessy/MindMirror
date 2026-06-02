export const brand = {
  NAME: "MindMirror",
  TAGLINE: "See what you keep thinking but never change.",
  DESCRIPTION:
    "An early-access voice-first journaling product for spotting thought patterns over time.",
  DOMAIN: "getmindmirror.com",

  STORAGE_PREFIX: "mm",

  EMAIL_SUPPORT: "support@getmindmirror.com",
  EMAIL_LEGAL: "legal@getmindmirror.com",
  EMAIL_NOREPLY: "noreply@getmindmirror.com",

  LEGAL_ENTITY: "MindMirror",
  LEGAL_ADDRESS: "Contact: support@getmindmirror.com",
  LEGAL_PHONE: "",

  TWITTER: "@mindmirrorapp",
  LOGO_TYPE: "wordmark",
} as const;

export type Brand = typeof brand;
