import type { IncomingMessage, ServerResponse } from "http";
import { generateDynamicSitemapXml, resolveSiteOrigin } from "./_catalogSitemap";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const origin = resolveSiteOrigin(req);
    const xml = await generateDynamicSitemapXml(origin);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.setHeader("X-Robots-Tag", "all");
    res.end(req.method === "HEAD" ? undefined : xml);
  } catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Failed to generate sitemap");
  }
}
