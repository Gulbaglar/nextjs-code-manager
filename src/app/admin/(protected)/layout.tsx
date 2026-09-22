import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { logoutAction } from "../actions";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border-soft bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-lg text-foreground">
            Code Manager
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-muted-foreground hover:text-accent">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
      <footer className="border-t border-border-soft px-6 py-6">
        <div className="mx-auto max-w-4xl">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="tactile inline-flex items-center gap-2 rounded-lg border border-border-soft bg-surface px-4 py-2 text-sm font-medium text-foreground"
          >
            View site ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
