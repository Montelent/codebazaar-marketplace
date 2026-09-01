"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
};

/** CKEditor 5 Classic loaded from CDN (works on Vercel without local webpack plugins). */
export function CKEditorField({
  value,
  onChange,
  placeholder = "Write content…",
  minHeight = 220,
  disabled = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<{
    getData: () => string;
    setData: (d: string) => void;
    destroy: () => Promise<void>;
    model: { document: { on: (e: string, cb: () => void) => void } };
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        await loadClassicEditor();
        if (cancelled || !hostRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ClassicEditor = (window as any).ClassicEditor;
        if (!ClassicEditor) throw new Error("ClassicEditor not available");
        const editor = await ClassicEditor.create(hostRef.current, {
          placeholder,
          toolbar: [
            "heading", "|", "bold", "italic", "link", "bulletedList", "numberedList",
            "|", "blockQuote", "insertTable", "undo", "redo",
          ],
        });
        if (cancelled) {
          await editor.destroy();
          return;
        }
        if (value) editor.setData(value);
        editor.model.document.on("change:data", () => {
          onChangeRef.current(editor.getData());
        });
        editorRef.current = editor;
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Editor failed to load");
      }
    }
    boot();
    return () => {
      cancelled = true;
      const ed = editorRef.current;
      editorRef.current = null;
      if (ed) ed.destroy().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !ready) return;
    const current = ed.getData();
    if (value !== current) ed.setData(value || "");
  }, [value, ready]);

  if (error) {
    return (
      <textarea
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="ck-wrapper overflow-hidden rounded-md border border-slate-200 bg-white">
      <div ref={hostRef} style={{ minHeight }} />
      {!ready && <p className="px-3 py-2 text-xs text-slate-400">Loading editor…</p>}
      <style jsx global>{`
        .ck-wrapper .ck-editor__editable { min-height: ${minHeight}px; }
        .ck-wrapper .ck-editor__editable:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 1px #10b981 !important;
        }
      `}</style>
    </div>
  );
}

function loadClassicEditor(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== "undefined" && (window as any).ClassicEditor) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-ckeditor-classic]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("CKEditor script error")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js";
    script.async = true;
    script.dataset.ckeditorClassic = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load CKEditor CDN"));
    document.head.appendChild(script);
  });
}
