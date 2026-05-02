import { Navbar } from "./navbar";
import { Footer } from "./footer";

type Props = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
