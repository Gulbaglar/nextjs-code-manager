import { getSiteContent } from "@/lib/store";
import type { CodeSlotKey } from "@/lib/content-data";

// Renders whatever has been PUBLISHED for this slot. Server-rendered plain HTML, so the browser's
// own HTML parser executes any <script> tag exactly like it would in a static page — no client
// runtime, no `new Function` sandbox, no hydration mismatch. This is intentionally the same trust
// model as any other admin-authored HTML on a single-admin site: the person editing it is trusted.
export async function CodeSlot({ slot }: { slot: CodeSlotKey }) {
  const { code } = await getSiteContent();
  if (!code.enabled) return null;

  const items = code.items.filter((item) => item.slot === slot && item.enabled && item.published);
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item) => {
        const published = item.published!;
        const parts = [
          published.css.trim() && `<style>${published.css}</style>`,
          published.html.trim(),
          published.js.trim() && `<script>${published.js}</script>`,
        ].filter(Boolean);
        if (parts.length === 0) return null;
        return <div key={item.id} data-code-slot={item.id} dangerouslySetInnerHTML={{ __html: parts.join("\n") }} />;
      })}
    </>
  );
}
