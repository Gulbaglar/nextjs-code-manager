import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { defaultSiteContent, type SiteContent } from "./content-data";

// A plain JSON file is enough for a single-admin site and has zero setup cost. Swap this file
// for a real database call if you need one — nothing else in the module depends on the storage
// mechanism, only on the SiteContent shape.
const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

async function writeJsonAtomic(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Unique tmp name per write: concurrent requests must never share (and clobber) one tmp file.
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tmp, file);
}

export async function getSiteContent(): Promise<SiteContent> {
  const defaults = structuredClone(defaultSiteContent);
  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return {
      ...defaults,
      ...parsed,
      code: { ...defaults.code, ...parsed.code, items: parsed.code?.items ?? defaults.code.items },
    };
  } catch (error) {
    // First run: return defaults WITHOUT writing (concurrent requests must never race on creating
    // the file). It's created on the first real save instead. Never overwrite a corrupt file either.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return defaults;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  await writeJsonAtomic(CONTENT_FILE, content);
}
