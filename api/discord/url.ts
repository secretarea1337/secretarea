import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS
  const origin = req.headers.origin as string | undefined;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "DISCORD_CLIENT_ID not configured in Vercel environment variables" }));
    return;
  }

  const host = (req.headers["x-forwarded-host"] as string || req.headers.host || "localhost:3000").split(",")[0].trim();
  const proto = (req.headers["x-forwarded-proto"] as string || "https").split(",")[0].trim();
  
  const urlObj = new URL(req.url || "", `${proto}://${host}`);
  let redirectUri = urlObj.searchParams.get("redirect_uri")?.trim();

  if (!redirectUri) {
    redirectUri = `${proto}://${host}/auth/discord/callback`;
  }

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
