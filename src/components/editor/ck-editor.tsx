"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
  disabled?: boolean;
};

declare global {
  interface Window {
    tinymce?: {
      init: (config: Record<string, unknown>) => Promise<unknown> | void;
      get: (id: string) => {
        remove: () => void;
        setContent: (html: string) => void;
        getContent: () => string;
        on: (event: string, cb: () => void) => void;
      } | null;
      remove: (id: string) => void;
    };
  }
}

/**
 * Free TinyMCE (self-hosted CDN) — more toolbar tools than free CKEditor Classic.
 * Exported as CKEditorField for drop-in compatibility with existing admin forms.
 */
export function CKEditorField({
  value,
  onChange,
  minHeight = 200,
  placeholder = "Write content…",
  disabled = false,
}: Props) {
  return (
    <TinyMCEField
      value={value}
      onChange={onChange}
      minHeight={minHeight}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

export function TinyMCEField({
  value,
  onChange,
  minHeight = 200,
  placeholder = "Write content…",
  disabled = false,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const editorId = `tinymce-${uid}`;
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const inited = useRef(false);

  onChangeRef.current = onChange;
  valueRef.current = value;

  useEffect(() => {
    if (disabled || typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      try {
        await loadTinyMCE();
        if (cancelled || !window.tinymce || inited.current) return;

        const existing = window.tinymce.get(editorId);
        if (existing) {
          try {
            existing.remove();
          } catch {
            /* ignore */
          }
        }

        await window.tinymce.init({
          selector: `#${editorId}`,
          base_url: "https://cdn.jsdelivr.net/npm/tinymce@7.6.0",
          suffix: ".min",
          height: minHeight + 80,
          menubar: true,
          branding: false,
          promotion: false,
          license_key: "gpl",
          statusbar: true,
          resize: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ].join(" "),
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
            "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | link image media table | " +
            "removeformat code fullscreen preview | help",
          toolbar_mode: "sliding",
          font_size_formats: "10px 12px 14px 16px 18px 20px 24px 28px 32px 36px",
          content_style:
            "body { font-family: Inter, system-ui, sans-serif; font-size: 14px; color: #0f172a; line-height: 1.6; padding: 8px 12px; }",
          placeholder,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setup: (editor: any) => {
            editor.on("init", () => {
              editor.setContent(valueRef.current || "");
              if (!cancelled) setReady(true);
            });
            const emit = () => onChangeRef.current(editor.getContent());
            editor.on("change", emit);
            editor.on("input", emit);
            editor.on("keyup", emit);
            editor.on("NodeChange", emit);
          },
        });
        inited.current = true;
      } catch (e) {
        console.error("[TinyMCE]", e);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      try {
        window.tinymce?.get(editorId)?.remove();
      } catch {
        /* ignore */
      }
      inited.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorId, disabled, minHeight]);

  useEffect(() => {
    if (!ready || !window.tinymce) return;
    const ed = window.tinymce.get(editorId);
    if (!ed) return;
    const current = ed.getContent();
    if ((value || "") !== current) {
      ed.setContent(value || "");
    }
  }, [value, ready, editorId]);

  if (disabled) {
    return (
      <textarea
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
        style={{ minHeight }}
        value={value}
        readOnly
        disabled
      />
    );
  }

  if (failed) {
    return (
      <textarea
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="relative rounded-md border border-slate-200 bg-white">
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-xs text-slate-500">
          Loading editor…
        </div>
      )}
      <textarea id={editorId} defaultValue={value} />
    </div>
  );
}

function loadTinyMCE(): Promise<void> {
  if (typeof window !== "undefined" && window.tinymce) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-tinymce-cdn]");
    if (existing) {
      if (window.tinymce) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("TinyMCE script error")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tinymce@7.6.0/tinymce.min.js";
    script.async = true;
    script.dataset.tinymceCdn = "1";
    script.referrerPolicy = "origin";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load TinyMCE CDN"));
    document.head.appendChild(script);
  });
}
