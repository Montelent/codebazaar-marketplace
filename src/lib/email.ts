type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; error?: string; id?: string }> {
  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    "CodeBazaar <onboarding@resend.dev>";
  const to = Array.isArray(args.to) ? args.to : [args.to];

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject: args.subject,
          html: args.html,
          text: args.text,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok) {
        return { ok: false, error: data.message || `Resend HTTP ${res.status}` };
      }
      return { ok: true, id: data.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "send failed" };
    }
  }

  console.info("[email:dev]", { from, to, subject: args.subject });
  return {
    ok: true,
    id: "dev-log",
    error:
      process.env.NODE_ENV === "production"
        ? "RESEND_API_KEY not set — email logged only"
        : undefined,
  };
}

export function appBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://codebazaar-marketplace.vercel.app"
  ).replace(/\/$/, "");
}
