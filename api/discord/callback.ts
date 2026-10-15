import type { IncomingMessage, ServerResponse } from "http";
import { checkRateLimit, getClientIp } from "../_rateLimit";
import { escapeHtml, isValidRedirectUri, isValidOrigin, applySecurityHeaders } from "../_security";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applySecurityHeaders(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data: https:;"
  );

  // Rate Limiting: 30 requests per 15 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`auth_callback:${clientIp}`, 30, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="utf-8"><title>Rate Limited</title></head>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Too Many Attempts</h3>
          <p>Please wait a few minutes before trying again.</p>
        </body>
      </html>
    `);
    return;
  }

  const host = (req.headers["x-forwarded-host"] as string || req.headers.host || "localhost:3000").split(",")[0].trim();
  const proto = (req.headers["x-forwarded-proto"] as string || "https").split(",")[0].trim();
  const urlObj = new URL(req.url || "", `${proto}://${host}`);

  const code = urlObj.searchParams.get("code");
  const error = urlObj.searchParams.get("error");
  const error_description = urlObj.searchParams.get("error_description");
  const state = urlObj.searchParams.get("state");

  if (error) {
    const safeError = escapeHtml(error_description || error);
    res.statusCode = 400;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="utf-8"><title>Discord Authentication Cancelled</title></head>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Discord Login Cancelled</h3>
          <p>${safeError}</p>
          <script>setTimeout(function() { window.close(); }, 2500);</script>
        </body>
      </html>
    `);
    return;
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    res.statusCode = 400;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="utf-8"><title>Discord Authentication Incomplete</title></head>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Discord Authentication Incomplete</h3>
          <p>Missing authorization code or Discord credentials configuration.</p>
          <script>setTimeout(function() { window.close(); }, 3500);</script>
        </body>
      </html>
    `);
    return;
  }

  try {
    let redirectUri: string | null = null;
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
        if (decoded?.redirectUri && isValidRedirectUri(decoded.redirectUri, host)) {
          redirectUri = decoded.redirectUri;
        }
      } catch (e) {
        // ignore malformed state
      }
    }

    if (!redirectUri) {
      redirectUri = `${proto}://${host}/auth/discord/callback`;
    }

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange Discord authorization code");
    }

    // Fetch user profile from Discord
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userRes.json();

    // Determine target origin for postMessage (must NOT be wildcard '*')
    let destinationOrigin = "https://secretarea.vercel.app";
    try {
      const parsedUri = new URL(redirectUri);
      if (isValidOrigin(parsedUri.origin)) {
        destinationOrigin = parsedUri.origin;
      }
    } catch (e) {
      destinationOrigin = "https://secretarea.vercel.app";
    }

    // Sanitize user object to only what's needed by the frontend (no tokens, credentials, or sensitive headers)
    const sanitizedUser = {
      id: String(discordUser.id || ""),
      username: String(discordUser.username || ""),
      discriminator: String(discordUser.discriminator || "0"),
      global_name: String(discordUser.global_name || discordUser.username || ""),
      avatar: String(discordUser.avatar || ""),
      email: typeof discordUser.email === "string" ? discordUser.email : "",
      verified: Boolean(discordUser.verified),
    };

    res.statusCode = 200;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Discord Auth Success</title>
        </head>
        <body style="background:#0F172A;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
          <div>
            <h3 style="color:#5865F2;">Connecting with Discord...</h3>
            <p>Authentication successful! Redirecting...</p>
          </div>
          <script>
            (function() {
              var targetOrigin = ${JSON.stringify(destinationOrigin)};
              var userData = ${JSON.stringify(sanitizedUser)};
              try {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'DISCORD_AUTH_SUCCESS',
                    user: userData
                  }, targetOrigin);
                  setTimeout(function() { window.close(); }, 600);
                } else {
                  window.location.href = targetOrigin;
                }
              } catch (e) {
                window.location.href = targetOrigin;
              }
            })();
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    const safeError = escapeHtml(err.message || "An authentication error occurred.");
    res.statusCode = 500;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><meta charset="utf-8"><title>Discord Login Error</title></head>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Discord Login Error</h3>
          <p>${safeError}</p>
          <script>setTimeout(function() { window.close(); }, 4000);</script>
        </body>
      </html>
    `);
  }
}
