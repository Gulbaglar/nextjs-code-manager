"use client";

import { useEffect, useRef, useState } from "react";

// Minimal typings for the parts of the Monaco API this component actually uses (Monaco itself is
// loaded from a CDN at runtime, not installed as a dependency).
type MonacoEditorInstance = { getValue(): string; onDidChangeModelContent(cb: () => void): void; dispose(): void };
type MonacoNamespace = {
  editor: { create(el: HTMLElement, opts: Record<string, unknown>): MonacoEditorInstance };
};

declare global {
  interface Window {
    monaco?: MonacoNamespace;
    require?: { config: (opts: Record<string, unknown>) => void; (deps: string[], cb: () => void): void };
    __monacoLoad?: Promise<MonacoNamespace>;
  }
}

const MONACO_VERSION = "0.52.2";
const LANGUAGE_BY_KIND: Record<"html" | "css" | "js", string> = { html: "html", css: "css", js: "javascript" };

// Loads Monaco (the VS Code editor) from jsDelivr on first use. If it fails — offline, CDN blocked —
// the caller falls back to a plain <textarea>, so the feature degrades instead of breaking.
function loadMonaco(): Promise<MonacoNamespace> {
  if (window.monaco) return Promise.resolve(window.monaco);
  if (window.__monacoLoad) return window.__monacoLoad;
  window.__monacoLoad = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs/loader.js`;
    script.onload = () => {
      try {
        window.require!.config({ paths: { vs: `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs` } });
        window.require!(["vs/editor/editor.main"], () => resolve(window.monaco!));
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Monaco"));
    document.head.appendChild(script);
  });
  return window.__monacoLoad;
}

export function CodeTextarea({
  value,
  onChange,
  kind,
  label,
  rows = 8,
}: {
  value: string;
  onChange: (value: string) => void;
  kind: "html" | "css" | "js";
  label?: string;
  rows?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const [ready, setReady] = useState(false);
  // Monaco owns its own internal state once created, so the effect below intentionally runs only
  // once (an empty dep array) instead of re-creating the editor on every keystroke. Because of
  // that, `value` inside the effect's closure would normally be stale by the time the CDN script
  // finishes loading (which can take a few seconds) — this ref is kept fresh on every render so
  // Monaco starts from whatever the user has already typed into the fallback textarea, not from
  // whatever `value` was at mount time.
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  });

  useEffect(() => {
    let cancelled = false;
    loadMonaco()
      .then((monaco) => {
        if (cancelled || !containerRef.current) return;
        const editor = monaco.editor.create(containerRef.current, {
          value: latestValue.current,
          language: LANGUAGE_BY_KIND[kind],
          theme: "vs-dark",
          minimap: { enabled: false },
          fontSize: 13,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        });
        editorRef.current = editor;
        editor.onDidChangeModelContent(() => onChange(editor.getValue()));
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      cancelled = true;
      editorRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {label && <span className="text-muted-foreground">{label}</span>}
      {!ready && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="rounded-lg border border-border-soft bg-background px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-accent"
        />
      )}
      <div
        ref={containerRef}
        style={{ height: ready ? rows * 19 : 0 }}
        className="overflow-hidden rounded-lg border border-border-soft"
      />
    </div>
  );
}
