import Link from "next/link";
import { getSiteContent } from "@/lib/store";

export default async function AdminDashboardPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="text-2xl text-foreground">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">This demo has one section. Add more admin pages the same way.</p>
      <Link
        href="/admin/code-manager"
        className="tactile mt-8 block max-w-sm rounded-xl border border-border-soft bg-surface p-6"
      >
        <h2 className="text-lg text-foreground">Code Manager</h2>
        <p className="mt-1 text-sm text-muted-foreground">Custom HTML/CSS/JS injected into your site&apos;s slots.</p>
        <p className="mt-4 text-xs text-accent">{content.code.items.length} item(s)</p>
      </Link>
    </div>
  );
}
