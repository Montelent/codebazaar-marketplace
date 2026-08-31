"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = document.cookie.includes("cb_consent=1");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    document.cookie = "cb_consent=1; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">
          Please review and accept our Terms & Policies
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          We use cookies and similar technologies to improve your experience,
          analyze traffic, and personalize content. By continuing you agree to
          our{" "}
          <a href="/terms" className="text-emerald-600 underline">
            Terms of Use
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-emerald-600 underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={accept}>
            Cookie Settings
          </Button>
          <Button size="sm" onClick={accept}>
            Agree & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
