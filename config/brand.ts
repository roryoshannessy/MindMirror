export const brand = {
  NAME: "MindMirror",
  TAGLINE: "See what you keep thinking but never change.",
  DESCRIPTION:
    "A voice-first journaling app that detects your thought patterns over time and shows you what's holding you back.",
  DOMAIN: "getmindmirror.com",

  STORAGE_PREFIX: "mm",

  SOCIAL_PROOF_COUNT: "4,200+",

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
