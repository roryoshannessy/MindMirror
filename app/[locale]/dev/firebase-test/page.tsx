import { notFound } from "next/navigation";
import { FirebaseTestClient } from "./firebase-test-client";

export const dynamic = "force-dynamic";

export default function FirebaseTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-[60vh] px-4 py-12 sm:px-6">
      <FirebaseTestClient />
    </div>
  );
}
