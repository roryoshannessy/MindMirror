export const theme = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  primary: "#6366f1",
  primaryForeground: "#ffffff",
  secondary: "#1c1c1e",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  border: "#27272a",
  accent: "#8b5cf6",
  destructive: "#ef4444",
  radius: "0.75rem",
} as const;

export type Theme = typeof theme;
