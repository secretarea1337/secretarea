import type { IncomingMessage, ServerResponse } from "http";

export const ALLOWED_ORIGINS = [
  "https://secretarea.vercel.app",
  "https://nexa1337.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

/**
 * Validates if an origin is permitted to make requests or receive postMessage events.
 */
export function isValidOrigin(origin: string | undefined | null): boolean {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const originStr = parsed.origin;
    if (ALLOWED_ORIGINS.includes(originStr)) return true;
    // Allow Google Cloud Run preview and dev containers
    if (parsed.hostname.endsWith(".run.app") && parsed.protocol === "https:") {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * Validates if a redirect URI is safe and belongs to authorized application domains.
 */
export function isValidRedirectUri(uri: string | undefined | null, hostHeader?: string): boolean {
  if (!uri) return false;
  try {
    const parsed = new URL(uri);
    // Disallow javascript:, data:, or non-http(s) protocols
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    // Must be either localhost for dev or an authorized domain
    if (parsed.origin === "https://secretarea.vercel.app" || parsed.origin === "https://nexa1337.com") {
      return true;
    }
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return true;
    }
    if (parsed.hostname.endsWith(".run.app") && parsed.protocol === "https:") {
      return true;
    }
    if (hostHeader && (parsed.host === hostHeader || parsed.host === hostHeader.split(",")[0].trim())) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

/**
 * Safely HTML-escapes strings to prevent Cross-Site Scripting (XSS).
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Applies security headers to serverless responses.
 */
export function applySecurityHeaders(res: ServerResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
}

/**
 * Sets strict CORS headers only for whitelisted origins.
 */
export function handleCors(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = req.headers.origin;
  if (origin && isValidOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true; // Request handled
  }

  return false;
}
