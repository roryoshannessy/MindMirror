import { notFound } from "next/navigation";
import { LeadCaptureTestClient } from "./lead-capture-test-client";

export const dynamic = "force-dynamic";

export default function LeadCaptureTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-[60vh] px-4 py-12 sm:px-6">
      <LeadCaptureTestClient />
    </div>
  );
}
