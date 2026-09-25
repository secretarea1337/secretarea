import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const host = (req.headers["x-forwarded-host"] as string || req.headers.host || "localhost:3000").split(",")[0].trim();
  const proto = (req.headers["x-forwarded-proto"] as string || "https").split(",")[0].trim();
  const urlObj = new URL(req.url || "", `${proto}://${host}`);

  const code = urlObj.searchParams.get("code");
  const error = urlObj.searchParams.get("error");
  const error_description = urlObj.searchParams.get("error_description");
  const state = urlObj.searchParams.get("state");

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (error) {
    res.statusCode = 400;
    res.end(`
      <!DOCTYPE html>
      <html>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Discord Login Cancelled</h3>
          <p>${error_description || error}</p>
          <script>setTimeout(() => window.close(), 2500);</script>
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
      <html>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Discord Authentication Incomplete</h3>
          <p>Missing authorization code or DISCORD_CLIENT_SECRET on Vercel environment variables.</p>
          <script>setTimeout(() => window.close(), 4000);</script>
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
        if (decoded?.redirectUri) {
          redirectUri = decoded.redirectUri;
        }
      } catch (e) {
        // ignore
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

    const destinationOrigin = redirectUri.includes("secretarea.vercel.app") 
      ? "https://secretarea.vercel.app" 
      : `${proto}://${host}`;

    res.statusCode = 200;
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Discord Auth Success</title></head>
        <body style="background:#0F172A;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
          <div>
            <h3 style="color:#5865F2;">Connecting with Discord...</h3>
            <p>Authentication successful! Redirecting...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'DISCORD_AUTH_SUCCESS',
                  user: ${JSON.stringify(discordUser)}
                }, '*');
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = '${destinationOrigin}';
              }
            } catch (e) {
              window.location.href = '${destinationOrigin}';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.statusCode = 500;
    res.end(`
      <!DOCTYPE html>
      <html>
        <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
          <h3>Discord Login Error</h3>
          <p>${err.message}</p>
          <script>setTimeout(() => window.close(), 5000);</script>
        </body>
      </html>
    `);
  }
}
