import type { IncomingMessage, ServerResponse } from "http";
import { checkRateLimit, getClientIp } from "../_rateLimit";
import { handleCors, isValidRedirectUri, applySecurityHeaders } from "../_security";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applySecurityHeaders(res);

  // Strict CORS
  if (handleCors(req, res)) {
    return;
  }

  // Rate Limiting: 30 requests per 15 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`auth_url:${clientIp}`, 30, 15 * 60 * 1000);
  res.setHeader("X-RateLimit-Limit", "30");
  res.setHeader("X-RateLimit-Remaining", String(rateLimit.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetTime / 1000)));

  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Too many authentication attempts. Please try again later." }));
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "OAuth service is not configured" }));
    return;
  }

  const host = (req.headers["x-forwarded-host"] as string || req.headers.host || "localhost:3000").split(",")[0].trim();
  const proto = (req.headers["x-forwarded-proto"] as string || "https").split(",")[0].trim();
  
  const urlObj = new URL(req.url || "", `${proto}://${host}`);
  let redirectUri = urlObj.searchParams.get("redirect_uri")?.trim();

  // Validate or set default redirectUri to prevent open redirects and SSRF
  if (!redirectUri || !isValidRedirectUri(redirectUri, host)) {
    redirectUri = `${proto}://${host}/auth/discord/callback`;
  }

  // Create state token with timestamp and redirectUri
  const state = Buffer.from(JSON.stringify({ redirectUri, ts: Date.now() })).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
    state: state,
  });

  const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ url: authUrl, redirectUri }));
}
