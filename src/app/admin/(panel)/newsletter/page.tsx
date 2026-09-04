"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CKEditorField } from "@/components/editor/ck-editor";

export default function AdminNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hello from CodeBazaar…</p>");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Send failed");
        return;
      }
      setMsg(`Sent to ${data.sent} of ${data.total} subscribers.`);
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSend} className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Newsletter</h1>
        <p className="text-sm text-slate-500">
          Email all users who opted in. Requires RESEND_API_KEY + EMAIL_FROM on Vercel.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Body</label>
        <CKEditorField value={html} onChange={setHtml} minHeight={240} />
      </div>
      {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{msg}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send newsletter"}
      </Button>
    </form>
  );
}
