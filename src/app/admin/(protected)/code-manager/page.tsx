import { Code2, Power, Plus } from "lucide-react";
import { getSiteContent } from "@/lib/store";
import { CodeItemEditor } from "@/components/admin/code-item-editor";
import { saveCodeDraftAction, setCodeGlobalEnabledAction } from "../../actions";

export default async function AdminCodeManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const content = await getSiteContent();
  const { ok } = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg border border-border-soft bg-surface-2 text-accent">
          <Code2 className="size-5" />
        </span>
        <h1 className="text-2xl text-foreground">Code Manager</h1>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Inject your own HTML/CSS/JavaScript into specific slots of your site — an analytics snippet,
        a badge, an embedded widget. This code never touches your git repository; it lives here and
        goes through a <strong className="text-foreground">draft → preview → publish</strong> flow.
        Whoever has access to this admin panel can run arbitrary JavaScript on your site — treat it
        the same way you&apos;d treat FTP/SSH access.
      </p>

      {ok === "draft" && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-surface px-4 py-2 text-sm text-accent">
          Draft saved (not live yet).
        </p>
      )}
      {ok === "published" && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-surface px-4 py-2 text-sm text-accent">
          Published — now live on the site.
        </p>
      )}
      {ok === "1" && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-surface px-4 py-2 text-sm text-accent">Saved.</p>
      )}

      <form
        action={setCodeGlobalEnabledAction}
        className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-surface p-5"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${
              content.code.enabled ? "border-accent/50 bg-accent-soft text-accent" : "border-border-soft text-muted-foreground"
            }`}
          >
            <Power className="size-4" />
          </span>
          <div>
            <h2 className="text-lg text-foreground">All custom code</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Turn this off and nothing published runs on the site — a fast kill switch if something
              goes wrong.
            </p>
          </div>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="enabled" defaultChecked={content.code.enabled} className="size-4" />
          Enabled
        </label>
        <button type="submit" className="tactile shrink-0 rounded-lg border border-border-soft bg-surface-2 px-4 py-2 text-sm font-medium text-foreground">
          Save
        </button>
      </form>

      {content.code.items.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {content.code.items.map((item) => (
            <CodeItemEditor key={item.id} item={item} action={saveCodeDraftAction} />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center gap-2">
        <Plus className="size-4 text-accent" />
        <h2 className="text-lg text-foreground">Add new code</h2>
      </div>
      <div className="mt-3">
        <CodeItemEditor action={saveCodeDraftAction} />
      </div>
    </div>
  );
}
