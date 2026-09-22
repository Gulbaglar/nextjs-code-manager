# Next.js Code Manager

**Write custom HTML, CSS and JavaScript from an admin panel — with draft → sandboxed live preview → publish, version history, one-click rollback and an emergency kill switch. Built for the Next.js App Router.**

🇹🇷 Türkçe: [README.tr.md](README.tr.md)

> *Restrict the damage, not the developer.* You write real code with a Monaco (VS Code) editor; Preview, Version history, Rollback and the kill switch limit what a mistake can do.

This is a small, self-contained reference implementation — not an npm package. Fork it, or copy the three folders it consists of (`src/lib`, `src/components`, `src/app/admin`) straight into your own Next.js App Router project. It ships as a runnable demo site so you can see it working before you wire it into anything.

## Why this exists

I built the first version of this for my own portfolio site ([gulbaglar.com](https://gulbaglar.com)) so I could drop a tracking snippet, a small widget or a one-off style tweak into the live site without opening a code editor, committing, and waiting for a deploy. Once it worked well there, I pulled it out into its own repository so it's usable on any Next.js site.

## Features

- **Draft → Preview → Publish.** Saving a draft never touches the live site. "Save & Publish" is the only action that does. A preview button renders the *exact* draft in a sandboxed `<iframe>` (`sandbox="allow-scripts"`, no `allow-same-origin`) before you publish it — no server round-trip needed.
- **Slots.** Define named insertion points anywhere in your JSX with `<CodeSlot slot="after-hero" />`. Slots are just string keys you invent — see [`src/lib/content-data.ts`](src/lib/content-data.ts).
- **Version history.** Every publish pushes the previous live version onto a capped history stack (15 by default). Restore any of them with one click — it becomes the new live version, and what it replaced is pushed onto the stack in turn, so nothing is ever lost.
- **Kill switch.** One checkbox on the admin page turns off *every* published snippet at once, without touching individual items — useful the moment something looks wrong.
- **A real code editor.** [Monaco](https://microsoft.github.io/monaco-editor/) (the editor VS Code is built on) is loaded from a CDN on demand. If it can't load — offline, blocked CDN — the admin UI falls back to a plain `<textarea>` instead of breaking.
- **No new dependency for rendering.** Published HTML/CSS/JS is rendered server-side as plain markup (`<style>…</style>`, raw HTML, `<script>…</script>`), so the browser's own HTML parser runs it — the same mechanism a static HTML page would use. No client runtime, no `new Function()` sandbox to maintain.
- **Single admin, JSON-file storage.** Auth is a bcrypt-hashed password + an HMAC-signed session cookie, no external services. Content lives in `data/content.json` (gitignored, created on first save). Swap [`src/lib/store.ts`](src/lib/store.ts) for a database call if you need more than one editor or more traffic than a JSON file comfortably handles.

## Quick start

```bash
git clone https://github.com/Gulbaglar/nextjs-code-manager.git
cd nextjs-code-manager
npm install
npm run dev
```

- `http://localhost:3000/` — the demo site, with four slots already placed.
- `http://localhost:3000/admin/setup` — create your admin account (first visit only).
- `http://localhost:3000/admin/code-manager` — add something, e.g. slot **"After the hero section"**, HTML `<p id="hello">Hello!</p>`, CSS `#hello{color:tomato}`. **Preview** it, then **Save & Publish**, then reload the demo page.

## Bringing it into your own site

1. Copy `src/lib/content-data.ts`, `src/lib/store.ts`, `src/lib/admin-store.ts`, `src/lib/auth.ts`, `src/components/code-slot.tsx`, `src/components/admin/`, and `src/app/admin/` into your project (adjust the `src/lib/store.ts` content type to include your own site's fields alongside `code`).
2. Edit `CODE_SLOTS` in `content-data.ts` to match your actual site's sections.
3. Drop `<CodeSlot slot="your-key" />` wherever you want in your layouts or pages.
4. Add `data/` to your `.gitignore` — this module's content and your admin credentials should never be committed.
5. Make sure whatever page/layout renders your `<CodeSlot/>` placements is `export const dynamic = "force-dynamic"` (see `src/app/page.tsx`) — otherwise Next.js may prerender it once at build time and newly published code won't appear until the next deploy.

## Deploying — a real bug we hit, so you don't have to

If you deploy on a platform where the build happens *before* an admin account exists (e.g. CI builds the app, a separate server just runs it), make sure **every** file under `src/app/admin/` — or at minimum a root `src/app/admin/layout.tsx` — exports:

```ts
export const dynamic = "force-dynamic";
```

Without it, Next.js can statically optimize `/admin/login`'s redirect while no account exists yet ("no account → redirect to `/admin/setup`") and cache that response. After you create the account, `/admin/setup` correctly redirects you to `/admin/login` — but the *stale cached* `/admin/login` response redirects you right back to `/admin/setup`. Forever. `ERR_TOO_MANY_REDIRECTS`. This repo already has the fix in place (see `src/app/admin/layout.tsx`); it's called out here because it's easy to lose if you restructure the admin routes.

## Limitations, honestly

- No infinite-loop guard in the preview iframe — a `while(true){}` in your draft will hang that tab. Close it.
- No multi-user roles, no audit log beyond version history — this is sized for "one trusted admin," not a team.
- Slot content is not localized — if your site is multilingual, published code renders identically in every locale (the same way a `<script>` tag in your `<head>` would).

## License

MIT — see [LICENSE](LICENSE).
