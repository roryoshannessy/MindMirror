import { AuthGuard } from "@/components/auth/auth-guard";
import type { CSSProperties } from "react";

type Props = { children: React.ReactNode };

const accountSurfaceStyle: CSSProperties & Record<`--${string}`, string> = {
  "--accent": "#2b2b2b",
  "--accent-foreground": "#f5f5f5",
  "--background": "#0a0a0a",
  "--border": "#2b2b2b",
  "--card": "#161616",
  "--card-foreground": "#f5f5f5",
  "--foreground": "#f5f5f5",
  "--input": "#2b2b2b",
  "--muted": "#242424",
  "--muted-foreground": "#a3a3a3",
  "--popover": "#161616",
  "--popover-foreground": "#f5f5f5",
  "--primary": "#f5f5f5",
  "--primary-foreground": "#0a0a0a",
  "--ring": "#f5f5f5",
  "--secondary": "#1f1f1f",
  "--secondary-foreground": "#f5f5f5",
  background:
    "radial-gradient(circle at 50% 0%, rgb(255 255 255 / 0.08), transparent 38rem), #0a0a0a",
  color: "var(--foreground)",
};

export default function AccountLayout({ children }: Props) {
  return (
    <div className="min-h-[calc(100dvh-4rem)]" style={accountSurfaceStyle}>
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
