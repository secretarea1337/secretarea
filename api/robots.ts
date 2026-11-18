import type { IncomingMessage, ServerResponse } from "http";
import { buildRobotsTxt, resolveSiteOrigin } from "./_catalogSitemap";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Method Not Allowed");
    return;
  }

  const origin = resolveSiteOrigin(req);
  const robots = buildRobotsTxt(origin);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.end(req.method === "HEAD" ? undefined : robots);
}
