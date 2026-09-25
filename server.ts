import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  app.set("trust proxy", true);
  const PORT = 3000;

  // CORS headers to support custom domains including secretarea.vercel.app
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://secretarea.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173"
    ];
    if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".run.app") || origin.endsWith(".vercel.app"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // speed test upload endpoint
  app.post("/upload", (req, res) => {
    req.on("data", () => {});
    req.on("end", () => res.send("ok"));
  });

  // Discord OAuth URL endpoint
  app.get("/api/auth/discord/url", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      return res.status(400).json({ error: "DISCORD_CLIENT_ID not configured in environment variables" });
    }

    let redirectUri = (req.query.redirect_uri as string)?.trim();
    if (!redirectUri) {
      if (process.env.APP_URL) {
        redirectUri = `${process.env.APP_URL}/auth/discord/callback`;
      } else {
        const forwardedHost = (req.get("x-forwarded-host") || req.get("host") || "localhost:3000").split(",")[0].trim();
        const rawProto = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
        const protocol = forwardedHost.includes("localhost") ? "http" : rawProto;
        redirectUri = `${protocol}://${forwardedHost}/auth/discord/callback`;
      }
    }

    const state = Buffer.from(JSON.stringify({ redirectUri, ts: Date.now() })).toString("base64url");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify email",
      state: state,
    });

    const url = `https://discord.com/oauth2/authorize?${params.toString()}`;
    res.json({ url, redirectUri });
  });

  // Discord OAuth Callback endpoint (Handles popup postMessage and closes)
  app.get(["/auth/discord/callback", "/auth/discord/callback/"], async (req, res) => {
    const { code, error, error_description, state } = req.query as Record<string, string>;

    if (error) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
            <h3>Discord Login Cancelled</h3>
            <p>${error_description || error}</p>
            <script>setTimeout(() => window.close(), 2500);</script>
          </body>
        </html>
      `);
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;">
            <h3>Discord Authentication Failed</h3>
            <p>Missing authorization code or Discord credentials in server environment.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
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
          // fallback
        }
      }

      if (!redirectUri) {
        const forwardedHost = (req.get("x-forwarded-host") || req.get("host") || "localhost:3000").split(",")[0].trim();
        const rawProto = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
        const protocol = forwardedHost.includes("localhost") ? "http" : rawProto;
        redirectUri = `${protocol}://${forwardedHost}/auth/discord/callback`;
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
        throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange code for tokens");
      }

      // Fetch user profile from Discord
      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const discordUser = await userRes.json();

      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Discord Auth</title></head>
          <body style="background:#0F172A;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
            <div>
              <h3>Connecting with Discord...</h3>
              <p>Authentication successful! This window will close automatically.</p>
            </div>
            <script>
              try {
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'DISCORD_AUTH_SUCCESS',
                    user: ${JSON.stringify(discordUser)}
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '${redirectUri.includes("secretarea.vercel.app") ? "https://secretarea.vercel.app" : "/"}';
                }
              } catch (e) {
                window.location.href = '${redirectUri.includes("secretarea.vercel.app") ? "https://secretarea.vercel.app" : "/"}';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;">
            <h3>Discord Login Error</h3>
            <p>${err.message}</p>
            <script>setTimeout(() => window.close(), 5000);</script>
          </body>
        </html>
      `);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
