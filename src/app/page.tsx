import { CodeSlot } from "@/components/code-slot";

// Content is read from disk on every request (see src/lib/store.ts) — this page must stay
// force-dynamic, or Next.js will prerender it once at build time and newly published code won't
// show up on reload until the next build/deploy. On a real site, put this on whichever
// layout/page wraps your <CodeSlot/> placements.
export const dynamic = "force-dynamic";

// A deliberately plain demo page — the point is the four <CodeSlot/> placements below, not the
// design. Visit /admin/code-manager, add something to "After the hero section", and reload.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <CodeSlot slot="page-top" />

      <main className="flex-1 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Demo site</p>
          <h1 className="mt-4 text-4xl text-foreground">This is your hero section.</h1>
          <p className="mt-4 text-muted-foreground">
            Everything below is placeholder content. The interesting part is in{" "}
            <a href="/admin/code-manager" className="text-accent underline">
              /admin/code-manager
            </a>
            .
          </p>
        </div>

        <CodeSlot slot="after-hero" />

        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {["Fast", "Simple", "Yours"].map((title) => (
            <div key={title} className="rounded-xl border border-border-soft bg-surface p-6 text-center">
              <h3 className="text-lg text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Placeholder card content.</p>
            </div>
          ))}
        </div>

        <CodeSlot slot="before-footer" />
      </main>

      <footer className="border-t border-border-soft px-6 py-8 text-center text-xs text-muted-foreground">
        Demo footer — nextjs-code-manager
      </footer>

      <CodeSlot slot="page-bottom" />
    </div>
  );
}
