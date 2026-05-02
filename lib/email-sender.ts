import { brand } from "@/config/brand";

export type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(
  email: TransactionalEmail,
): Promise<void> {
  const provider = process.env.EMAIL_SENDER_PROVIDER;
  const from =
    process.env.EMAIL_SENDER_FROM?.trim() || brand.EMAIL_NOREPLY;

  if (provider === "http") {
    const key = process.env.EMAIL_SENDER_API_KEY;
    if (!key) {
      throw new Error(
        "EMAIL_SENDER_API_KEY is required when EMAIL_SENDER_PROVIDER=http",
      );
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${brand.NAME} <${from}>`,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error ${res.status}: ${err}`);
    }
    return;
  }

  if (provider === "smtp") {
    throw new Error(
      "EMAIL_SENDER_PROVIDER=smtp is not wired yet. Use http (Resend) or leave provider empty in development.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(
      "[email-sender:dev] No EMAIL_SENDER_PROVIDER — logging message instead of sending.",
      { to: email.to, subject: email.subject },
    );
    console.info("[email-sender:dev] text body:\n", email.text);
    return;
  }

  throw new Error(
    "Transactional email is not configured. Set EMAIL_SENDER_PROVIDER=http and EMAIL_SENDER_API_KEY (e.g. Resend).",
  );
}
