import fs from "fs";
import path from "path";

const API_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbzS2jQfIave1KcB0_JdlE7Akv0y5i2HzR2N_Cy3vrCTs5q7r-Uv8duxrlv7lZiAKA3eiw/exec";
const DEFAULT_SITE_URL = "https://secretarea.site";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for rapid crawler response & auto-detection of new games

export interface SitemapItem {
  path: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
  image?: string;
  title?: string;
}

let cachedCatalogData: Record<string, any> | null = null;
let cachedCatalogTimestamp = 0;
let cachedBlogSitemapItems: SitemapItem[] = [];
let cachedBlogTimestamp = 0;

function readFirebaseProjectConfig(): { projectId: string; databaseId: string } {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return {
        projectId: String(parsed?.projectId || "secretarea-1337"),
        databaseId: String(parsed?.firestoreDatabaseId || "(default)"),
      };
    }
  } catch {
    // Fallback to default project config
  }
  return { projectId: "secretarea-1337", databaseId: "(default)" };
}

async function fetchPublishedBlogSitemapEntries(): Promise<SitemapItem[]> {
  const now = Date.now();
  if (cachedBlogSitemapItems.length > 0 && now - cachedBlogTimestamp < CACHE_TTL_MS) {
    return cachedBlogSitemapItems;
  }

  const { projectId, databaseId } = readFirebaseProjectConfig();
  const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/${encodeURIComponent(databaseId)}/documents:runQuery`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "blog_posts" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "published" },
            },
          },
          limit: 500,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return cachedBlogSitemapItems;

    const rows = (await res.json()) as Array<{ document?: { name?: string; fields?: Record<string, any> } }>;
    if (!Array.isArray(rows)) return cachedBlogSitemapItems;

    const items: SitemapItem[] = [];
    for (const row of rows) {
      const fields = row?.document?.fields;
      if (!fields) continue;
      const slug = fields.slug?.stringValue?.trim();
      const title = fields.title?.stringValue?.trim() || fields.seoTitle?.stringValue?.trim();
      if (!slug) continue;

      const updatedAt =
        fields.updatedAt?.stringValue ||
        fields.publishedAt?.stringValue ||
        fields.createdAt?.stringValue;
      const featuredImage = fields.featuredImage?.stringValue?.trim();
      const isValidImage =
        Boolean(featuredImage) &&
        /^https?:\/\//i.test(featuredImage || "") &&
        !String(featuredImage).includes("placehold.co");

      items.push({
        path: `/blog/${encodeURIComponent(slug)}`,
        lastmod: formatIsoDate(updatedAt),
        changefreq: "weekly",
        priority: "0.85",
        image: isValidImage ? featuredImage : undefined,
        title,
      });
    }

    cachedBlogSitemapItems = items;
    cachedBlogTimestamp = now;
    return items;
  } catch {
    clearTimeout(timeout);
    return cachedBlogSitemapItems;
  }
}

export function getCategoryPathPrefix(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat === "ps5" || cat === "playstation") return "ps5";
  if (cat === "hypervisor") return "hypervisor";
  if (cat === "steamtools") return "steamtools";
  if (cat === "architect" || cat === "tools") return "tools";
  if (cat === "extra" || cat === "savegame") return "savegame";
  return "game";
}

export function slugifyGameTitle(name?: string, fallbackId?: string): string {
  const raw = (name || "").trim();
  if (!raw) {
    return encodeURIComponent((fallbackId || "item").trim());
  }
  const normalized = raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || encodeURIComponent((fallbackId || "item").trim());
}

function escapeXml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatIsoDate(rawDate?: unknown): string {
  const today = new Date().toISOString().split("T")[0];
  if (!rawDate) return today;
  const parsed = new Date(String(rawDate));
  if (Number.isNaN(parsed.getTime())) return today;
  const year = parsed.getUTCFullYear();
  if (year < 2020 || year > 2099) return today;
  return parsed.toISOString().split("T")[0];
}

export function resolveSiteOrigin(req?: { headers?: Record<string, any>; protocol?: string }): string {
  if (process.env.APP_URL && /^https?:\/\//i.test(process.env.APP_URL)) {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  if (req?.headers) {
    const rawHost = String(req.headers["x-forwarded-host"] || req.headers.host || "")
      .split(",")[0]
      .trim();
    if (rawHost && !rawHost.startsWith("127.0.0.1") && !rawHost.startsWith("localhost")) {
      const rawProto = String(req.headers["x-forwarded-proto"] || req.protocol || "https")
        .split(",")[0]
        .trim();
      const proto = rawProto === "http" || rawProto === "https" ? rawProto : "https";
      // Prefer canonical custom domain if running on secretarea.site
      if (rawHost.includes("secretarea.site")) {
        return DEFAULT_SITE_URL;
      }
      return `${proto}://${rawHost}`;
    }
  }
  return DEFAULT_SITE_URL;
}

function readBackupCatalog(): Record<string, any> {
  try {
    const backupPath = path.join(process.cwd(), "data", "backup_resources.json");
    if (fs.existsSync(backupPath)) {
      const content = fs.readFileSync(backupPath, "utf8");
      return JSON.parse(content);
    }
  } catch {
    // Fallback gracefully
  }
  return {};
}

async function fetchLiveCatalog(): Promise<Record<string, any> | null> {
  const now = Date.now();
  if (cachedCatalogData && now - cachedCatalogTimestamp < CACHE_TTL_MS) {
    return cachedCatalogData;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(`${API_ENDPOINT}?_t=${now}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return cachedCatalogData;
    const json = (await res.json()) as Record<string, any>;
    if (json && typeof json === "object") {
      cachedCatalogData = json;
      cachedCatalogTimestamp = now;
      return json;
    }
  } catch {
    clearTimeout(timeout);
  }
  return cachedCatalogData;
}

function getRowVal(row: Record<string, any>, searchKey: string): string {
  const nk = searchKey.toLowerCase().replace(/[^a-z0-9]/g, "");
  const foundKey = Object.keys(row).find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === nk);
  return foundKey && row[foundKey] != null ? String(row[foundKey]).trim() : "";
}

function extractUrlsFromCatalog(data: Record<string, any>): SitemapItem[] {
  const today = new Date().toISOString().split("T")[0];
  const urlMap = new Map<string, SitemapItem>();

  // 1. Core Homepage & Category Hubs
  urlMap.set("/", {
    path: "/",
    lastmod: today,
    changefreq: "daily",
    priority: "1.0",
  });

  const categoryHubs = ["/blog", "/game", "/ps5", "/hypervisor", "/steamtools", "/tools", "/savegame"];
  for (const hub of categoryHubs) {
    urlMap.set(hub, {
      path: hub,
      lastmod: today,
      changefreq: "daily",
      priority: "0.9",
    });
  }

  // 2. Dynamic Games & Resources from Live Feed + Backup
  Object.keys(data || {}).forEach((tabKey) => {
    const normalizedKey = tabKey.toLowerCase();
    let targetKey = "";
    let idPrefix = "";

    if (normalizedKey.includes("hypervisor")) {
      targetKey = "hypervisor";
      idPrefix = "H";
    } else if (
      normalizedKey.includes("upcoming") ||
      normalizedKey.includes("steamaccounts") ||
      normalizedKey.includes("mastergift") ||
      normalizedKey.includes("profil") ||
      normalizedKey.includes("topgames") ||
      normalizedKey.includes("popularrepack") ||
      normalizedKey.includes("bestgameseries") ||
      normalizedKey.includes("onlinegame") ||
      normalizedKey.includes("twoplayer") ||
      normalizedKey.includes("dodi") ||
      normalizedKey.includes("skidrow") ||
      normalizedKey.includes("reloaded") ||
      normalizedKey.includes("steamrip")
    ) {
      return;
    } else if (normalizedKey.includes("ps5") || normalizedKey.includes("playstation")) {
      targetKey = "ps5";
      idPrefix = "P";
    } else if (normalizedKey.includes("game") && !normalizedKey.includes("savegame")) {
      targetKey = "game";
      idPrefix = "G";
    } else if (normalizedKey.includes("steamtools")) {
      targetKey = "steamtools";
      idPrefix = "S";
    } else if (normalizedKey.includes("architect")) {
      targetKey = "architect";
      idPrefix = "A";
    } else if (normalizedKey.includes("extra") || normalizedKey.includes("savegame")) {
      targetKey = "extra";
      idPrefix = "E";
    }

    if (!targetKey || !Array.isArray(data[tabKey])) return;

    const rows = [...data[tabKey]].reverse(); // Latest added games first
    rows.forEach((row: any, idx: number) => {
      if (!row || typeof row !== "object") return;
      const name = getRowVal(row, "name") || getRowVal(row, "title") || getRowVal(row, "toolname");
      if (!name || name.toLowerCase() === "secure fragment" || name.toLowerCase() === "untitled") {
        return;
      }

      const rawId = getRowVal(row, "id");
      const finalId = rawId
        ? /^\d+$/.test(rawId)
          ? `${idPrefix}${rawId}`
          : rawId
        : `${idPrefix}${idx + 1}`;

      const prefix = getCategoryPathPrefix(targetKey);
      const slug = slugifyGameTitle(name, finalId);
      const itemPath = `/${prefix}/${encodeURIComponent(slug)}`;

      const rawDate =
        getRowVal(row, "date") ||
        getRowVal(row, "timestamp") ||
        getRowVal(row, "dateAdded") ||
        getRowVal(row, "updated") ||
        getRowVal(row, "created");

      const coverImage = getRowVal(row, "coverImage");
      const isValidImage = /^https?:\/\//i.test(coverImage) && !coverImage.includes("placehold.co");
      const isPinned = ["true", "yes", "on"].includes(getRowVal(row, "pinned").toLowerCase());

      if (!urlMap.has(itemPath)) {
        urlMap.set(itemPath, {
          path: itemPath,
          lastmod: formatIsoDate(rawDate),
          changefreq: isPinned || idx < 25 ? "daily" : "weekly",
          priority: isPinned || idx < 20 ? "0.9" : "0.85",
          image: isValidImage ? coverImage : undefined,
          title: name,
        });
      }
    });
  });

  return Array.from(urlMap.values());
}

export async function generateDynamicSitemapXml(baseUrl: string): Promise<string> {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const [liveData, backupData, blogPosts] = await Promise.all([
    fetchLiveCatalog(),
    Promise.resolve(readBackupCatalog()),
    fetchPublishedBlogSitemapEntries(),
  ]);

  // Live sheet data comes first so newly added games are indexed immediately with freshest dates,
  // while backup catalog fills any missing historical titles.
  const mergedEntries = new Map<string, SitemapItem>();

  if (liveData) {
    for (const item of extractUrlsFromCatalog(liveData)) {
      mergedEntries.set(item.path, item);
    }
  }
  for (const item of extractUrlsFromCatalog(backupData)) {
    if (!mergedEntries.has(item.path)) {
      mergedEntries.set(item.path, item);
    }
  }
  for (const postItem of blogPosts) {
    if (!mergedEntries.has(postItem.path)) {
      mergedEntries.set(postItem.path, postItem);
    }
  }

  const urlBlocks = Array.from(mergedEntries.values())
    .slice(0, 49900)
    .map((entry) => {
      const loc = `${cleanBaseUrl}${entry.path}`;
      const imageXml = entry.image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(entry.image)}</image:loc>${
            entry.title ? `\n      <image:title>${escapeXml(entry.title)}</image:title>` : ""
          }\n    </image:image>`
        : "";
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${entry.lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>${imageXml}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlBlocks}\n</urlset>\n`;
}

export function buildRobotsTxt(baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  return [
    "# SecretArea Robots Configuration",
    "User-agent: *",
    "Allow: /",
    "Allow: /blog",
    "Allow: /blog/",
    "Allow: /game/",
    "Allow: /ps5/",
    "Allow: /hypervisor/",
    "Allow: /steamtools/",
    "Allow: /tools/",
    "Allow: /savegame/",
    "Disallow: /api/",
    "Disallow: /admin",
    "Disallow: /profile",
    "Disallow: /settings",
    "Disallow: /disclaimer",
    "Disallow: /terminal",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "Allow: /blog",
    "Allow: /blog/",
    "Allow: /game/",
    "Allow: /ps5/",
    "Allow: /hypervisor/",
    "Allow: /steamtools/",
    "Allow: /tools/",
    "Allow: /savegame/",
    "Disallow: /api/",
    "Disallow: /admin",
    "Disallow: /profile",
    "Disallow: /settings",
    "Disallow: /disclaimer",
    "Disallow: /terminal",
    "",
    "User-agent: Googlebot-Image",
    "Allow: /images/",
    "Allow: /assets/",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /admin",
    "Disallow: /profile",
    "Disallow: /settings",
    "Disallow: /terminal",
    "",
    `Sitemap: ${cleanBaseUrl}/sitemap.xml`,
    "",
  ].join("\n");
}
