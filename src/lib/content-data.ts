// Types and defaults for the Code Manager's own content. This is the ONLY data the module owns —
// it does not know anything about the rest of your site's content model.

// Slots are just string keys. Define as many as you like and place <CodeSlot slot="..."/> anywhere
// in your JSX (layouts or pages). These four are a generic example for a typical marketing site.
export type CodeSlotKey = "page-top" | "page-bottom" | "after-hero" | "before-footer";

export const CODE_SLOTS: { key: CodeSlotKey; label: string; scope: string }[] = [
  { key: "page-top", label: "Top of every page", scope: "All pages" },
  { key: "page-bottom", label: "Bottom of every page", scope: "All pages" },
  { key: "after-hero", label: "After the hero section", scope: "Home page" },
  { key: "before-footer", label: "Before the footer", scope: "Home page" },
];

export type CodeSnapshot = { html: string; css: string; js: string };
export type CodeVersion = CodeSnapshot & { savedAt: string };
export const CODE_MAX_HISTORY = 15;

export type CodeItem = {
  id: string;
  slot: CodeSlotKey;
  label: string;
  enabled: boolean;
  // Draft: what you're editing, not live yet. Preview it before publishing.
  draft: CodeSnapshot;
  // Published: what the live site renders. null = never published, even if a draft exists.
  published: CodeSnapshot | null;
  updatedAt: string;
  publishedAt: string | null;
  history: CodeVersion[]; // previously PUBLISHED versions, newest first, capped at CODE_MAX_HISTORY
};

export type CodeManagerState = {
  enabled: boolean; // global kill switch — overrides every item's own enabled flag
  items: CodeItem[];
};

// Replace this with your own site's content type — `code` is the only field this module needs.
export type SiteContent = {
  code: CodeManagerState;
};

export const defaultSiteContent: SiteContent = {
  code: { enabled: true, items: [] },
};
