"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
};

/** CKEditor 5 Super-build from CDN — full toolbar. */
export function CKEditorField({
  value,
  onChange,
  placeholder = "Write content…",
  minHeight = 280,
  disabled = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<{
    getData: () => string;
    setData: (d: string) => void;
    destroy: () => Promise<void>;
    model: { document: { on: (e: string, cb: () => void) => void } };
    enableReadOnlyMode?: (id: string) => void;
    disableReadOnlyMode?: (id: string) => void;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        await loadSuperEditor();
        if (cancelled || !hostRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const CKEDITOR = (window as any).CKEDITOR;
        const ClassicEditor = CKEDITOR?.ClassicEditor;
        if (!ClassicEditor) throw new Error("CKEditor Super-build not available");

        const editor = await ClassicEditor.create(hostRef.current, {
          placeholder,
          removePlugins: [
            "AIAssistant", "CKBox", "CKFinder", "EasyImage",
            "RealTimeCollaborativeComments", "RealTimeCollaborativeTrackChanges",
            "RealTimeCollaborativeRevisionHistory", "PresenceList", "Comments",
            "TrackChanges", "TrackChangesData", "RevisionHistory", "Pagination",
            "WProofreader", "MathType", "SlashCommand", "Template",
            "DocumentOutline", "FormatPainter", "TableOfContents",
            "PasteFromOfficeEnhanced", "CaseChange",
          ],
          toolbar: {
            items: [
              "undo", "redo", "|",
              "heading", "|",
              "fontSize", "fontFamily", "fontColor", "fontBackgroundColor", "|",
              "bold", "italic", "underline", "strikethrough", "subscript", "superscript", "code", "removeFormat", "|",
              "link", "uploadImage", "insertImage", "mediaEmbed", "insertTable", "blockQuote", "codeBlock", "horizontalLine", "specialCharacters", "|",
              "alignment", "|",
              "bulletedList", "numberedList", "todoList", "outdent", "indent", "|",
              "findAndReplace", "sourceEditing",
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
          },
          fontSize: { options: [10, 12, 14, "default", 18, 20, 24, 28, 32, 36] },
          image: {
            toolbar: [
              "imageTextAlternative", "toggleImageCaption",
              "imageStyle:inline", "imageStyle:block", "imageStyle:side", "linkImage",
            ],
          },
          table: {
            contentToolbar: [
              "tableColumn", "tableRow", "mergeTableCells",
              "tableCellProperties", "tableProperties",
            ],
          },
          link: {
            decorators: {
              openInNewTab: {
                mode: "manual",
                label: "Open in a new tab",
                attributes: { target: "_blank", rel: "noopener noreferrer" },
              },
            },
          },
          mediaEmbed: { previewsInData: true },
        });

        if (cancelled) { await editor.destroy(); return; }
        if (value) editor.setData(value);
        editor.model.document.on("change:data", () => {
          onChangeRef.current(editor.getData());
        });
        if (disabled) editor.enableReadOnlyMode?.("ck-disabled");
        editorRef.current = editor;
        setReady(true);
      } catch (e) {
        console.error(e);
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
    if (value !== ed.getData()) ed.setData(value || "");
  }, [value, ready]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed || !ready) return;
    if (disabled) ed.enableReadOnlyMode?.("ck-disabled");
    else ed.disableReadOnlyMode?.("ck-disabled");
  }, [disabled, ready]);

  if (error) {
    return (
      <div>
        <p className="mb-1 text-xs text-amber-700">Editor fallback: {error}</p>
        <textarea
          className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm"
          style={{ minHeight }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="ck-wrapper overflow-hidden rounded-md border border-slate-200 bg-white">
      <div ref={hostRef} style={{ minHeight }} />
      {!ready && <p className="px-3 py-2 text-xs text-slate-400">Loading full editor…</p>}
      <style jsx global>{`
        .ck-wrapper .ck-editor__editable { min-height: ${minHeight}px !important; }
        .ck-wrapper .ck-editor__editable:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 1px #10b981 !important;
        }
        .ck-wrapper .ck.ck-editor { width: 100%; }
        .ck-wrapper .ck-toolbar { flex-wrap: wrap !important; }
      `}</style>
    </div>
  );
}

function loadSuperEditor(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== "undefined" && (window as any).CKEDITOR?.ClassicEditor) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-ckeditor-super]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("CKEditor super-build script error")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.ckeditor.com/ckeditor5/41.4.2/super-build/ckeditor.js";
    script.async = true;
    script.dataset.ckeditorSuper = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load CKEditor Super-build CDN"));
    document.head.appendChild(script);
  });
}
