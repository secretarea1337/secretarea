import type { IncomingMessage, ServerResponse } from "http";
import { checkRateLimit, getClientIp } from "./_rateLimit";

const TROCADOR_TARGET_URL =
  "https://trocador.app/anonpay/?ticker_to=xmr&network_to=Mainnet&address=48UqVGkdrErEXVUKWZ9dCkRFxG4qFyzorS2h77K96nG8fdHShgv95k4cPPYWGMoM267PdajjEoLUwG1kyvgSd8vX8VK8RkS&donation=True&simple_mode=True&name=SecretArea&description=Support+our+mission+and+help+us+grow.+Every+contribution+makes+a+difference.&email=secretarea1337@gmail.com&buttonbgcolor=e11d48&textcolor=000000&bgcolor=00000000&direct=True";

let cachedHtml: string | null = null;
let cachedTime = 0;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Rate Limiting: 120 requests per 10 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`crypto_frame:${clientIp}`, 120, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Rate limit exceeded" }));
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  // Allow iframe embedding by this app and client browsers
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' *;");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");

  const now = Date.now();
  if (cachedHtml && now - cachedTime < 60 * 1000) {
    res.statusCode = 200;
    res.end(cachedHtml);
    return;
  }

  try {
    const upstreamRes = await fetch(TROCADOR_TARGET_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!upstreamRes.ok) {
      throw new Error(`Upstream returned ${upstreamRes.status}`);
    }

    let html = await upstreamRes.text();

    // Inject <base> tag so relative CSS/JS/images load directly from trocador.app
    if (html.includes("<head>")) {
      html = html.replace(
        "<head>",
        `<head><base href="https://trocador.app/" target="_blank">`
      );
    } else {
      html = `<base href="https://trocador.app/" target="_blank">` + html;
    }

    // Ensure form submissions open in a new secure window preserving session cookies
    html = html.replace(/<form\b([^>]*)>/gi, (match, attrs) => {
      if (/target=/i.test(attrs)) {
        return `<form ${attrs.replace(/target=["'][^"']*["']/i, 'target="_blank"')}>`;
      }
      return `<form target="_blank" ${attrs}>`;
    });

    cachedHtml = html;
    cachedTime = now;

    res.statusCode = 200;
    res.end(html);
  } catch (err) {
    res.statusCode = 200;
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #090d16;
              color: #e2e8f0;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
              box-sizing: border-box;
            }
            .btn {
              display: inline-block;
              background: #e11d48;
              color: #ffffff;
              padding: 10px 18px;
              border-radius: 10px;
              text-decoration: none;
              font-weight: bold;
              font-size: 13px;
              margin-top: 14px;
              transition: background 0.2s;
            }
            .btn:hover { background: #be123c; }
            p { font-size: 12px; color: #94a3b8; margin: 0 0 4px 0; }
          </style>
        </head>
        <body>
          <h4 style="margin: 0 0 8px 0; font-size: 14px;">Instant Crypto Gateway</h4>
          <p>Click below to launch secure payment with Bitcoin, USDT, Solana, or any crypto.</p>
          <a class="btn" href="${TROCADOR_TARGET_URL}" target="_blank" rel="noopener noreferrer">
            Open Crypto Checkout
          </a>
        </body>
      </html>
    `);
  }
}
