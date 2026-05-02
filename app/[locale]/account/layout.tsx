import { AuthGuard } from "@/components/auth/auth-guard";

type Props = { children: React.ReactNode };

export default function AccountLayout({ children }: Props) {
  return <AuthGuard>{children}</AuthGuard>;
}
