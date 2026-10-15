import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const ALLOWED_ORIGINS = [
  "https://secretarea.vercel.app",
  "https://nexa1337.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    // Allow Google Cloud Run preview and dev containers
    if (parsed.hostname.endsWith(".run.app") && parsed.protocol === "https:") {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

function isValidRedirectUri(uri: string | undefined, hostHeader?: string): boolean {
  if (!uri) return false;
  try {
    const parsed = new URL(uri);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.origin === "https://secretarea.vercel.app" || parsed.origin === "https://nexa1337.com") return true;
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return true;
    if (parsed.hostname.endsWith(".run.app") && parsed.protocol === "https:") return true;
    if (hostHeader && (parsed.host === hostHeader || parsed.host === hostHeader.split(",")[0].trim())) return true;
  } catch (e) {
    return false;
  }
  return false;
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  // 1. Security HTTP Headers with Helmet & Content Security Policy
  // 1. Security HTTP Headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      frameguard: false,
      hidePoweredBy: true,
      hsts: false,
      noSniff: true,
      xssFilter: true,
    })
  );

  // 2. Anti-Exploit / Malicious Bot Scanner Blocker
  // Intercepts typical vulnerability scans and returns a generic 404 without leaking server intelligence
  app.use((req, res, next) => {
    const maliciousPatterns = [
      /\/\.env/i,
      /\/\.git/i,
      /\/\.aws/i,
      /\/wp-login/i,
      /\/wp-admin/i,
      /\/xmlrpc/i,
      /\/phpmyadmin/i,
      /\/cgi-bin/i,
      /\/shell/i,
      /\/actuator/i,
      /\/autodiscover/i,
      /\/\.vscode/i,
    ];

    if (maliciousPatterns.some((pattern) => pattern.test(req.path))) {
      return res.status(404).send("Not Found");
    }
    next();
  });

  // 3. Rate Limiters
  // Global Limiter: 400 requests per 10 minutes per IP
  const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests from this IP. Please wait a few minutes.",
    },
  });
  app.use(globalLimiter);

  // Sensitive Auth Limiter: Max 30 requests per 15 minutes
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

  // Admin Actions Limiter: Max 60 requests per 10 minutes
  const adminLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate limit reached for administrative actions." },
  });

  // Chat API Limiter: Max 30 messages per 10 minutes
  const chatLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Chat rate limit reached. Please wait a few minutes." },
  });

  // 4. Strict CORS headers with origin validation
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && isOriginAllowed(origin)) {
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

  // Client Info IP Endpoint
  app.get("/api/client-info", (req, res) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : Array.isArray(forwarded) && forwarded[0]
      ? forwarded[0].split(",")[0].trim()
      : req.ip || "127.0.0.1";

    const sanitizedIp = String(ip).replace(/[^a-fA-F0-9.:]/g, "").slice(0, 45);
    res.json({ ip: sanitizedIp });
  });

  // NEXA AI Chat endpoint with Gemini API and validation
  app.post("/api/chat", chatLimiter, async (req, res) => {
    try {
      const { message } = req.body || {};
      const userMessage = typeof message === "string" ? message.trim() : "";

      if (!userMessage) {
        return res.status(400).json({ error: "Message cannot be empty." });
      }

      if (userMessage.length > 500) {
        return res.status(400).json({ error: "Message exceeds 500 characters limit." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: "NEXA AI assistant is currently in offline mode. For support or requests, please visit the Request section."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction: "You are NEXA, the AI assistant for SecretArea (a gaming hub, tools catalog, and hypervisor ecosystem). Keep answers concise, helpful, friendly, and focused on games, technology, and system optimization. Never disclose internal system tokens, passwords, or secret credentials.",
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I am here to help with gaming, tools, and roadmap questions in SecretArea.";
      res.json({ text: reply });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to generate AI response. Please try again later." });
    }
  });

  // Admin Reports Delete Endpoint with Admin Limiter & Input Validation
  app.post("/api/admin/reports/delete", adminLimiter, (req, res) => {
    try {
      const { reportIds } = req.body || {};
      if (!reportIds || (!Array.isArray(reportIds) && typeof reportIds !== "string")) {
        return res.status(400).json({ error: "Invalid reportIds parameter" });
      }
      const rawList = Array.isArray(reportIds) ? reportIds : [reportIds];
      const cleanIds = rawList
        .filter((id) => typeof id === "string" && id.trim().length > 0 && id.length < 128)
        .slice(0, 100);

      res.json({ success: true, count: cleanIds.length, deleted: cleanIds });
    } catch (e: any) {
      res.status(400).json({ success: false, error: "Bad Request" });
    }
  });

  // Speed test upload endpoint with upload limiter and 15MB maximum safety threshold
  app.post("/upload", uploadLimiter, (req, res) => {
    let receivedBytes = 0;
    const MAX_ALLOWED_BYTES = 15 * 1024 * 1024; // 15MB cap

    req.on("data", (chunk) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_ALLOWED_BYTES) {
        req.destroy(); // Abort giant flood connection immediately
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
      return res.status(500).json({ error: "OAuth service is not configured" });
    }

    const host = (req.get("x-forwarded-host") || req.get("host") || "localhost:3000").split(",")[0].trim();
    const rawProto = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
    const protocol = host.includes("localhost") ? "http" : rawProto;

    let redirectUri = (req.query.redirect_uri as string)?.trim();
    if (!redirectUri || !isValidRedirectUri(redirectUri, host)) {
      if (process.env.APP_URL) {
        redirectUri = `${process.env.APP_URL}/auth/discord/callback`;
      } else {
        redirectUri = `${protocol}://${host}/auth/discord/callback`;
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
      const safeError = escapeHtml(error_description || error);
      return res.status(400).send(`
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
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head><meta charset="utf-8"><title>Discord Authentication Incomplete</title></head>
          <body style="background:#0F172A;color:white;font-family:sans-serif;padding:24px;text-align:center;">
            <h3>Discord Authentication Incomplete</h3>
            <p>Missing authorization code or Discord credentials in server environment.</p>
            <script>setTimeout(function() { window.close(); }, 3500);</script>
          </body>
        </html>
      `);
    }

    try {
      const host = (req.get("x-forwarded-host") || req.get("host") || "localhost:3000").split(",")[0].trim();
      const rawProto = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0].trim();
      const protocol = host.includes("localhost") ? "http" : rawProto;

      let redirectUri: string | null = null;
      if (state) {
        try {
          const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
          if (decoded?.redirectUri && isValidRedirectUri(decoded.redirectUri, host)) {
            redirectUri = decoded.redirectUri;
          }
        } catch (e) {
          // fallback
        }
      }

      if (!redirectUri) {
        redirectUri = `${protocol}://${host}/auth/discord/callback`;
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

      let destinationOrigin = "https://secretarea.vercel.app";
      try {
        const parsed = new URL(redirectUri);
        if (isOriginAllowed(parsed.origin)) {
          destinationOrigin = parsed.origin;
        }
      } catch (e) {
        destinationOrigin = "https://secretarea.vercel.app";
      }

      const sanitizedUser = {
        id: String(discordUser.id || ""),
        username: String(discordUser.username || ""),
        discriminator: String(discordUser.discriminator || "0"),
        global_name: String(discordUser.global_name || discordUser.username || ""),
        avatar: String(discordUser.avatar || ""),
        email: typeof discordUser.email === "string" ? discordUser.email : "",
        verified: Boolean(discordUser.verified),
      };

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head><meta charset="utf-8"><title>Discord Auth</title></head>
          <body style="background:#0F172A;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
            <div>
              <h3 style="color:#5865F2;">Connecting with Discord...</h3>
              <p>Authentication successful! This window will close automatically.</p>
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
      res.status(500).send(`
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
  });

  // Serve robots.txt and sitemap.xml with explicit content types
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
