import type { IncomingMessage, ServerResponse } from "http";
import { checkRateLimit, getClientIp } from "../../_rateLimit";
import { handleCors, applySecurityHeaders } from "../../_security";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applySecurityHeaders(res);

  if (handleCors(req, res)) {
    return;
  }

  // Rate Limiting: 60 admin actions per 10 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`admin_reports_del:${clientIp}`, 60, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Rate limit reached for administrative actions." }));
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  // Protect against large payloads (max 64KB)
  let bodyStr = "";
  const MAX_PAYLOAD = 64 * 1024;
  let exceeded = false;

  for await (const chunk of req) {
    bodyStr += chunk;
    if (bodyStr.length > MAX_PAYLOAD) {
      exceeded = true;
      break;
    }
  }

  if (exceeded) {
    res.statusCode = 413;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Payload too large" }));
    return;
  }

  try {
    const parsed = JSON.parse(bodyStr || "{}");
    const { reportIds } = parsed;

    // Strict input validation
    if (!reportIds || (!Array.isArray(reportIds) && typeof reportIds !== "string")) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid reportIds parameter" }));
      return;
    }

    const rawList = Array.isArray(reportIds) ? reportIds : [reportIds];
    // Sanitize and limit count to max 100
    const cleanIds = rawList
      .filter((id) => typeof id === "string" && id.trim().length > 0 && id.length < 128)
      .slice(0, 100);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: true, count: cleanIds.length, deleted: cleanIds }));
  } catch (e: any) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Bad Request" }));
  }
}
