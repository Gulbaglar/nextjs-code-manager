"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionCookieValue, requireAdminSession, setupAdmin, verifyLogin, SESSION_COOKIE } from "@/lib/auth";
import { isSetupComplete } from "@/lib/admin-store";
import { getSiteContent, saveSiteContent } from "@/lib/store";
import { CODE_SLOTS, CODE_MAX_HISTORY, type CodeSlotKey, type CodeItem } from "@/lib/content-data";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

// ---------- Auth ----------

export async function setupAction(formData: FormData) {
  if (await isSetupComplete()) redirect("/admin/login");

  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (username.length < 3) redirect(`/admin/setup?error=${encodeURIComponent("Username must be at least 3 characters.")}`);
  if (password.length < 8) redirect(`/admin/setup?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  if (password !== confirm) redirect(`/admin/setup?error=${encodeURIComponent("Passwords do not match.")}`);

  await setupAdmin(username, password);
  (await cookies()).set(SESSION_COOKIE, await createSessionCookieValue(), COOKIE_OPTS);
  redirect("/admin");
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const result = await verifyLogin(username, password);
  if (!result.ok) redirect(`/admin/login?error=${encodeURIComponent(result.error || "Login failed.")}`);

  (await cookies()).set(SESSION_COOKIE, await createSessionCookieValue(), COOKIE_OPTS);
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- Code Manager ----------

function findSlot(value: string): CodeSlotKey {
  const found = CODE_SLOTS.find((s) => s.key === value);
  return found ? found.key : CODE_SLOTS[0].key;
}

export async function saveCodeDraftAction(formData: FormData) {
  await requireAdminSession();
  const content = await getSiteContent();
  const id = String(formData.get("id") || "");
  const label = String(formData.get("label") || "").trim() || "Untitled";
  const slot = findSlot(String(formData.get("slot") || ""));
  const draft = {
    html: String(formData.get("html") || ""),
    css: String(formData.get("css") || ""),
    js: String(formData.get("js") || ""),
  };
  const enabled = formData.get("enabled") === "on";
  const now = new Date().toISOString();

  const idx = content.code.items.findIndex((i) => i.id === id);
  let item: CodeItem;
  if (idx >= 0) {
    item = { ...content.code.items[idx], label, slot, draft, enabled, updatedAt: now };
    content.code.items[idx] = item;
  } else {
    item = { id: crypto.randomUUID(), slot, label, enabled, draft, published: null, updatedAt: now, publishedAt: null, history: [] };
    content.code.items.push(item);
  }

  // The "Save & Publish" button submits the same form with intent=publish, so unsaved edits are
  // written to the draft first and that exact draft is what goes live — not whatever was last saved.
  if (formData.get("intent") === "publish") {
    const history = item.published
      ? [{ ...item.published, savedAt: item.publishedAt ?? item.updatedAt }, ...item.history].slice(0, CODE_MAX_HISTORY)
      : item.history;
    item.published = { ...item.draft };
    item.publishedAt = now;
    item.history = history;
  }

  await saveSiteContent(content);
  redirect(formData.get("intent") === "publish" ? "/admin/code-manager?ok=published" : "/admin/code-manager?ok=draft");
}

export async function deleteCodeItemAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const content = await getSiteContent();
  content.code.items = content.code.items.filter((i) => i.id !== id);
  await saveSiteContent(content);
  redirect("/admin/code-manager");
}

// Rolls a slot back to an older PUBLISHED version: both the draft and the live site are set to it
// (the version that was live just before this is pushed onto the history stack).
export async function restoreCodeVersionAction(formData: FormData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const index = Number(formData.get("index") || "-1");
  const content = await getSiteContent();
  const item = content.code.items.find((i) => i.id === id);
  const version = item?.history[index];
  if (item && version) {
    const now = new Date().toISOString();
    const snapshot = { html: version.html, css: version.css, js: version.js };
    const history = item.published
      ? [{ ...item.published, savedAt: item.publishedAt ?? item.updatedAt }, ...item.history].slice(0, CODE_MAX_HISTORY)
      : item.history;
    item.draft = { ...snapshot };
    item.published = { ...snapshot };
    item.updatedAt = now;
    item.publishedAt = now;
    item.history = history;
    await saveSiteContent(content);
  }
  redirect("/admin/code-manager?ok=published");
}

export async function setCodeGlobalEnabledAction(formData: FormData) {
  await requireAdminSession();
  const content = await getSiteContent();
  content.code.enabled = formData.get("enabled") === "on";
  await saveSiteContent(content);
  redirect("/admin/code-manager?ok=1");
}
