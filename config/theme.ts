export const theme = {
  background: "#f6fbfa",
  foreground: "#101918",
  primary: "#172120",
  primaryForeground: "#ffffff",
  secondary: "#eef7f4",
  muted: "#e7f0ed",
  mutedForeground: "#60706d",
  border: "#d8e7e3",
  accent: "#dce8e5",
  destructive: "#ef4444",
  radius: "0.75rem",
} as const;

export type Theme = typeof theme;
