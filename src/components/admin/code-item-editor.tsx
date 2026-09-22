"use client";

import { useState } from "react";
import { ChevronDown, Eye, Rocket, Save, Trash2, History, X, MapPin } from "lucide-react";
import { CODE_SLOTS, type CodeItem, type CodeSlotKey } from "@/lib/content-data";
import { CodeTextarea } from "@/components/admin/code-textarea";
import { deleteCodeItemAction, restoreCodeVersionAction } from "@/app/admin/actions";

function buildPreviewDoc(html: string, css: string, js: string): string {
  // Reuse whatever stylesheets the admin page itself already loaded (your app's own Tailwind
  // build) so the preview roughly matches your real site's typography and utility classes.
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((l) => `<link rel="stylesheet" href="${(l as HTMLLinkElement).href}">`)
    .join("\n");
  return `<!doctype html><html><head><meta charset="utf-8">${links}<style>
    body{background:#111318;color:#e7e9ee;padding:24px;font-family:system-ui,sans-serif}
    ${css}
  </style></head><body>${html}<script>${js.replace(/<\/script>/gi, "")}</script></body></html>`;
}

function StatusPill({ item }: { item: CodeItem }) {
  const hasChanges =
    !item.published ||
    item.draft.html !== item.published.html ||
    item.draft.css !== item.published.css ||
    item.draft.js !== item.published.js;

  if (!item.published) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft px-2.5 py-1 text-[0.7rem] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-foreground/40" />
        Never published
      </span>
    );
  }
  if (hasChanges) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[0.7rem] text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        Unpublished changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 text-[0.7rem] text-accent">
      <span className="size-1.5 rounded-full bg-accent" />
      Live
    </span>
  );
}

export function CodeItemEditor({
  item,
  action,
}: {
  item?: CodeItem;
  action: (formData: FormData) => void;
}) {
  const isNew = !item;
  const [expanded, setExpanded] = useState(isNew);
  const [label, setLabel] = useState(item?.label ?? "");
  const [slot, setSlot] = useState<CodeSlotKey>(item?.slot ?? CODE_SLOTS[0].key);
  const [enabled, setEnabled] = useState(item?.enabled ?? true);
  const [html, setHtml] = useState(item?.draft.html ?? "");
  const [css, setCss] = useState(item?.draft.css ?? "");
  const [js, setJs] = useState(item?.draft.js ?? "");
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const slotInfo = CODE_SLOTS.find((s) => s.key === slot);

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-surface transition-colors ${
        item?.published ? "border-l-2 border-l-accent/70 border-border-soft" : "border-border-soft"
      }`}
    >
      <button
        type="button"
        onClick={() => !isNew && setExpanded((v) => !v)}
        disabled={isNew}
        className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left ${!isNew ? "tactile" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {!isNew && (
            <ChevronDown
              className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-foreground">{label || (isNew ? "Add new code" : "Untitled")}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {slotInfo?.label} · {slotInfo?.scope}
              {!enabled && <span className="text-destructive"> · disabled</span>}
            </p>
          </div>
        </div>
        {item && <StatusPill item={item} />}
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 border-t border-border-soft/60 px-5 py-5">
          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={item?.id ?? ""} />
            <input type="hidden" name="label" value={label} />
            <input type="hidden" name="slot" value={slot} />
            <input type="hidden" name="enabled" value={enabled ? "on" : ""} />
            <input type="hidden" name="html" value={html} />
            <input type="hidden" name="css" value={css} />
            <input type="hidden" name="js" value={js} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="text-muted-foreground">Label (for your own reference)</span>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Google Analytics"
                  required
                  className="rounded-lg border border-border-soft bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="text-muted-foreground">Slot</span>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as CodeSlotKey)}
                  className="rounded-lg border border-border-soft bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
                >
                  {CODE_SLOTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label} — {s.scope}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border-soft/60 bg-background/40 p-4">
              <CodeTextarea label="HTML (optional)" kind="html" value={html} onChange={setHtml} rows={4} />
              <CodeTextarea
                label="CSS (optional — wrapped in <style> automatically)"
                kind="css"
                value={css}
                onChange={setCss}
                rows={4}
              />
              <CodeTextarea
                label="JavaScript (optional — wrapped in <script> automatically)"
                kind="js"
                value={js}
                onChange={setJs}
                rows={4}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              Enabled
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(buildPreviewDoc(html, css, js))}
                className="tactile inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-background px-4 py-2 text-sm text-foreground"
              >
                <Eye className="size-4" />
                Preview
              </button>
              <button
                type="submit"
                name="intent"
                value="draft"
                className="tactile inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-surface-2 px-4 py-2 text-sm font-medium text-foreground"
              >
                <Save className="size-4" />
                Save Draft
              </button>
              <button
                type="submit"
                name="intent"
                value="publish"
                className="tactile inline-flex items-center gap-1.5 rounded-lg border border-accent/50 bg-accent-soft px-4 py-2 text-sm font-medium text-accent"
              >
                <Rocket className="size-4" />
                Save &amp; Publish
              </button>
            </div>
          </form>

          {item && item.history.length > 0 && (
            <details className="rounded-lg border border-border-soft bg-background/40 p-3 text-sm">
              <summary className="flex cursor-pointer items-center gap-1.5 text-muted-foreground">
                <History className="size-3.5" />
                Previously published versions ({item.history.length})
              </summary>
              <ul className="mt-3 flex flex-col gap-2">
                {item.history.map((version, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{new Date(version.savedAt).toLocaleString()}</span>
                    <form action={restoreCodeVersionAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="index" value={i} />
                      <button type="submit" className="text-xs text-accent hover:underline">
                        Restore &amp; publish
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {item && (
            <form action={deleteCodeItemAction} className="w-fit">
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </form>
          )}

          {previewDoc && (
            <div className="rounded-lg border border-border-soft">
              <div className="flex items-center justify-between border-b border-border-soft px-3 py-2 text-xs text-muted-foreground">
                <span>Preview — this draft is not live yet, only visible here.</span>
                <button type="button" onClick={() => setPreviewDoc(null)} className="inline-flex items-center gap-1 text-accent hover:underline">
                  <X className="size-3.5" />
                  Close
                </button>
              </div>
              <iframe
                title="Code preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts"
                className="h-64 w-full rounded-b-lg bg-black"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
