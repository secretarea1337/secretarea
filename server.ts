import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  // 1. Security HTTP Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Managed granularly to avoid blocking external widgets (Ko-Fi, Discord, Firebase, Google Fonts)
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      frameguard: { action: "sameorigin" },
      hidePoweredBy: true,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      noSniff: true,
      xssFilter: true,
    })
  );

  // 2. Anti-Exploit / Malicious Scanner Blocker
  // Blocks automated bot probes (e.g. .env, .git, wp-login, phpmyadmin, cgi-bin) immediately
  app.use((req, res, next) => {
    const maliciousPatterns = [
      /\/\.env/i,
      /\/\.git/i,
      /\/\.aws/i,
      /\/wp-login/i,
      /\/xmlrpc/i,
      /\/phpmyadmin/i,
      /\/cgi-bin/i,
      /\/shell/i,
      /\/actuator/i,
      /\/autodiscover/i,
    ];

    if (maliciousPatterns.some((pattern) => pattern.test(req.path))) {
      return res.status(403).send("Forbidden - Threat intelligence blocked");
    }
    next();
  });

  // 3. Anti-DDoS Rate Limiters
  // Global Limiter: 400 requests per 10 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests from this IP. Anti-DDoS protection active. Please wait a few minutes.",
    },
  });
  app.use(globalLimiter);

  // Sensitive Auth Limiter: Max 30 requests per 15 minutes to prevent OAuth abuse or brute-forcing
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Authentication rate limit reached. Please try again later." },
  });

  // Upload Limiter (Speed Test protection against bandwidth exhaustion)
  const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Upload rate limit reached. Please wait a moment." },
  });

  // Admin Actions Limiter
  const adminLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate limit reached for administrative actions." },
  });

  // 4. Strict CORS headers with origin validation
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://secretarea.vercel.app",
      "https://nexa1337.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ];

    const isAllowed =
      origin &&
      (allowedOrigins.includes(origin) ||
        origin.endsWith(".run.app") ||
        origin.endsWith(".vercel.app"));

    if (isAllowed) {
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

  // 5. JSON Body size limit to prevent memory-exhaustion JSON bomb attacks
  app.use(express.json({ limit: "250kb" }));

  // Admin Reports Delete Endpoint with Admin Limiter
  app.post("/api/admin/reports/delete", adminLimiter, (req, res) => {
    try {
      const { reportIds } = req.body || {};
      const ids = Array.isArray(reportIds) ? reportIds : reportIds ? [reportIds] : [];
      res.json({ success: true, count: ids.length, deleted: ids });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Speed test upload endpoint with upload limiter and 15MB maximum safety threshold
  app.post("/upload", uploadLimiter, (req, res) => {
    let receivedBytes = 0;
    const MAX_ALLOWED_BYTES = 15 * 1024 * 1024; // 15MB cap

    req.on("data", (chunk) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_ALLOWED_BYTES) {
        req.destroy(); // Abort slowloris / giant flood connection immediately
      }
    });

    req.on("end", () => {
      if (receivedBytes <= MAX_ALLOWED_BYTES) {
        res.send("ok");
      }
    });

    req.on("error", () => {
      res.status(400).send("Upload terminated");
    });
  });

  // Discord OAuth URL endpoint with Auth rate limiter
  app.get("/api/auth/discord/url", authLimiter, (req, res) => {
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

  // Discord OAuth Callback endpoint (Handles popup postMessage and closes) with Auth rate limiter
  app.get(["/auth/discord/callback", "/auth/discord/callback/"], authLimiter, async (req, res) => {
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
