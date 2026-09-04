"use client";

import { useEffect, useState } from "react";

export function AnnouncementBar() {
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || {};
        setEnabled(Boolean(s["header.announcementEnabled"]));
        setText(
          String(s["header.announcement"] || "")
            .replace(/<[^>]+>/g, "")
            .trim()
        );
      })
      .catch(() => {});
  }, []);

  if (!enabled || !text) return null;
  return (
    <div className="bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white">
      {text}
    </div>
  );
}
