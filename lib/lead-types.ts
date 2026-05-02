export const LEAD_SOURCES = ["signup", "login", "quiz", "checkout"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
