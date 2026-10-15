import type { IncomingMessage, ServerResponse } from "http";
import { checkRateLimit, getClientIp } from "./_rateLimit";
import { handleCors, applySecurityHeaders } from "./_security";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applySecurityHeaders(res);

  if (handleCors(req, res)) {
    return;
  }

  // Rate Limiting: 400 requests per 10 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`client_info:${clientIp}`, 400, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Rate limit exceeded" }));
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  // Clean, sanitized IP representation
  const sanitizedIp = clientIp.replace(/[^a-fA-F0-9.:]/g, "").slice(0, 45);
  res.end(JSON.stringify({ ip: sanitizedIp }));
}
