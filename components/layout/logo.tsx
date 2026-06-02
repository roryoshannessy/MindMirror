import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";

export function Logo() {
  return (
    <Link
      href="/"
      className="text-lg font-semibold tracking-tight text-current"
    >
      {brand.NAME}
    </Link>
  );
}
