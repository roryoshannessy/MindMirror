import { brand } from "@/config/brand";
import { formatPrice } from "@/lib/format-price";
import type { TransactionalEmail } from "@/lib/email-sender";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildRefundProcessedEmail(input: {
  to: string;
  amountRefundedCents: number;
  currency: string;
  isFullRefund: boolean;
}): TransactionalEmail {
  const amount = formatPrice(input.amountRefundedCents, input.currency);
  const subject = input.isFullRefund
    ? `${brand.NAME} refund confirmed - you are on the waitlist`
    : `Your ${brand.NAME} partial refund is confirmed`;
  const support = brand.EMAIL_SUPPORT;
  const accessNote = input.isFullRefund
    ? "You have not bought access to a live MindMirror app. This checkout was an early-access demand test. Your payment has been refunded, you do not need to cancel anything, and you are now on the waitlist only."
    : "Your subscription may remain active after a partial refund. If that was not expected, contact support and we will help.";

  const text = [
    subject,
    "",
    `Stripe has processed your ${amount} refund.`,
    "",
    accessNote,
    "",
    "Depending on your bank, the refund can take 5-10 business days to appear on your statement.",
    "",
    `Questions? Email ${support}.`,
  ].join("\n");

  const html = `
    <div style="margin:0;background:#0a0a0a;padding:32px 20px;font-family:Inter,Arial,sans-serif;color:#f5f5f5;">
      <div style="margin:0 auto;max-width:560px;">
        <p style="margin:0 0 18px;font-size:14px;letter-spacing:0;color:#a3a3a3;">${escapeHtml(brand.NAME)}</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">Refund confirmed. Waitlist only.</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#e5e5e5;">Stripe has processed your <strong style="color:#ffffff;">${escapeHtml(amount)}</strong> refund.</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#d4d4d4;">${escapeHtml(accessNote)}</p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a3a3a3;">Depending on your bank, the refund can take 5-10 business days to appear on your statement.</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#a3a3a3;">Questions? Email <a href="mailto:${escapeHtml(support)}" style="color:#818cf8;">${escapeHtml(support)}</a>.</p>
      </div>
    </div>
  `;

  return {
    to: input.to,
    subject,
    text,
    html,
  };
}
