"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Method = {
  provider: string;
  name: string;
  enabled: boolean;
  isManual: boolean;
  instructions?: string | null;
  config: Record<string, string>;
  secrets?: Record<string, string>;
};

const DEFAULTS: Method[] = [
  { provider: "STRIPE", name: "Stripe", enabled: false, isManual: false, config: { publishableKey: "", currency: "usd" }, secrets: { secretKey: "", webhookSecret: "" } },
  { provider: "PAYPAL", name: "PayPal", enabled: false, isManual: false, config: { clientId: "", mode: "sandbox" }, secrets: { clientSecret: "" } },
  { provider: "BANK_TRANSFER", name: "Bank transfer", enabled: false, isManual: true, instructions: "Transfer to the account below. Orders stay pending until approved.", config: { bankName: "", accountName: "", accountNumber: "", iban: "", swift: "" } },
  { provider: "MANUAL", name: "Manual / invoice", enabled: true, isManual: true, instructions: "Pay offline. Admin marks the order as paid after confirmation.", config: { contactEmail: "support@codebazaar.com" } },
];

export default function PaymentsSettingsPage() {
  const [methods, setMethods] = useState<Method[]>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch("/api/admin/payments").then((r) => r.json()).then((d) => {
      if (d.methods?.length) setMethods(d.methods);
    }).catch(() => {});
  }, []);

  const m = methods[active];
  function update(partial: Partial<Method>) {
    setMethods((list) => list.map((item, i) => (i === active ? { ...item, ...partial } : item)));
  }
  function updateConfig(key: string, value: string) {
    update({ config: { ...m.config, [key]: value } });
  }
  function updateSecret(key: string, value: string) {
    update({ secrets: { ...(m.secrets || {}), [key]: value } });
  }

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ methods }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.hint || data.error || "Save failed");
      return;
    }
    setMsg("Payment methods saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment methods</h1>
        <p className="text-sm text-slate-500">Automatic gateways and manual / offline options</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-2">
          {methods.map((method, i) => (
            <button key={method.provider + method.name} type="button" onClick={() => setActive(i)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm ${
                active === i ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"
              }`}>
              <span className="font-medium">{method.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                method.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>{method.enabled ? "On" : "Off"}</span>
            </button>
          ))}
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{m.name}</h2>
              <p className="text-xs text-slate-500">{m.isManual ? "Manual · admin confirmation" : "Automatic gateway"}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={m.enabled} onChange={(e) => update({ enabled: e.target.checked })} className="accent-emerald-600" />
              Enabled
            </label>
          </div>
          {m.provider === "STRIPE" && (
            <>
              <Field label="Publishable key"><Input value={m.config.publishableKey || ""} onChange={(e) => updateConfig("publishableKey", e.target.value)} /></Field>
              <Field label="Secret key"><Input type="password" value={m.secrets?.secretKey || ""} onChange={(e) => updateSecret("secretKey", e.target.value)} /></Field>
              <Field label="Webhook secret"><Input type="password" value={m.secrets?.webhookSecret || ""} onChange={(e) => updateSecret("webhookSecret", e.target.value)} /></Field>
            </>
          )}
          {m.provider === "PAYPAL" && (
            <>
              <Field label="Client ID"><Input value={m.config.clientId || ""} onChange={(e) => updateConfig("clientId", e.target.value)} /></Field>
              <Field label="Client secret"><Input type="password" value={m.secrets?.clientSecret || ""} onChange={(e) => updateSecret("clientSecret", e.target.value)} /></Field>
            </>
          )}
          {m.provider === "BANK_TRANSFER" && (
            <>
              <Field label="Bank name"><Input value={m.config.bankName || ""} onChange={(e) => updateConfig("bankName", e.target.value)} /></Field>
              <Field label="Account name"><Input value={m.config.accountName || ""} onChange={(e) => updateConfig("accountName", e.target.value)} /></Field>
              <Field label="Account number"><Input value={m.config.accountNumber || ""} onChange={(e) => updateConfig("accountNumber", e.target.value)} /></Field>
              <Field label="IBAN"><Input value={m.config.iban || ""} onChange={(e) => updateConfig("iban", e.target.value)} /></Field>
            </>
          )}
          {m.isManual && (
            <Field label="Buyer instructions">
              <textarea className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" rows={3} value={m.instructions || ""} onChange={(e) => update({ instructions: e.target.value })} />
            </Field>
          )}
          {msg && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>}
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save payment methods"}</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
