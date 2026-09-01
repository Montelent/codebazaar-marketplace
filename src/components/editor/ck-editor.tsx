"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
};

/** CKEditor 5 Classic (CDN) — fully interactive toolbar + editable area. */
export function CKEditorField({
  value,
  onChange,
  placeholder = "Write content…",
  minHeight = 240,
  disabled = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        await loadClassic();
        if (cancelled || !hostRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ClassicEditor = (window as any).ClassicEditor;
        if (!ClassicEditor) throw new Error("ClassicEditor missing");

        hostRef.current.innerHTML = "";

        const editor = await ClassicEditor.create(hostRef.current, {
          placeholder,
          toolbar: [
            "heading", "|",
            "bold", "italic", "underline", "link",
            "bulletedList", "numberedList", "|",
            "blockQuote", "insertTable", "undo", "redo",
          ],
        });

        if (cancelled) {
          await editor.destroy();
          return;
        }

        if (valueRef.current) editor.setData(valueRef.current);
        editor.model.document.on("change:data", () => {
          onChangeRef.current(editor.getData());
        });

        editorRef.current = editor;
        setReady(true);
        setError("");
      } catch (e) {
        console.error("[CKEditor]", e);
        setError(e instanceof Error ? e.message : "Editor failed");
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
    if (value !== ed.getData()) ed.setData(value || "");
  }, [value, ready]);

  if (error) {
    return (
      <textarea
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  return (
    <div
      className="ck-field relative rounded-md border border-slate-200 bg-white"
      style={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
    >
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-xs text-slate-500">
          Loading editor…
        </div>
      )}
      <div ref={hostRef} className="ck-host min-h-[120px] bg-white" style={{ minHeight }} />
      <style jsx global>{`
        .ck-field .ck.ck-editor { width: 100%; }
        .ck-field .ck.ck-editor__main > .ck-editor__editable {
          min-height: ${minHeight}px !important;
          background: #fff !important;
          color: #0f172a !important;
          cursor: text !important;
          pointer-events: auto !important;
        }
        .ck-field .ck.ck-toolbar {
          background: #f8fafc !important;
          pointer-events: auto !important;
        }
        .ck-field .ck.ck-button {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .ck-field .ck-editor__editable:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 1px #10b981 !important;
        }
      `}</style>
    </div>
  );
}

function loadClassic(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== "undefined" && (window as any).ClassicEditor) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-ckeditor-classic]");
    if (existing) {
      if ((window as unknown as { ClassicEditor?: unknown }).ClassicEditor) {
        resolve();
        return;
      }
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
