import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const host = req.headers.host || "localhost:3000";
    const reqUrl = new URL(req.url || "/api/anonpay-widget", `http://${host}`);
    const tickerFrom = reqUrl.searchParams.get("ticker_from")?.trim().toLowerCase() || "";

    const baseTrocadorUrl = new URL("https://trocador.app/anonpay/");
    baseTrocadorUrl.searchParams.set("ticker_to", "xmr");
    baseTrocadorUrl.searchParams.set("network_to", "Mainnet");
    baseTrocadorUrl.searchParams.set("address", "48UqVGkdrErEXVUKWZ9dCkRFxG4qFyzorS2h77K96nG8fdHShgv95k4cPPYWGMoM267PdajjEoLUwG1kyvgSd8vX8VK8RkS");
    baseTrocadorUrl.searchParams.set("donation", "True");
    baseTrocadorUrl.searchParams.set("simple_mode", "False");
    baseTrocadorUrl.searchParams.set("description", "Support our mission and help us grow. Every contribution makes a difference.");
    baseTrocadorUrl.searchParams.set("email", "secretarea1337@gmail.com");
    baseTrocadorUrl.searchParams.set("buttonbgcolor", "e11d48");
    baseTrocadorUrl.searchParams.set("textcolor", "000000");
    baseTrocadorUrl.searchParams.set("bgcolor", "00000000");
    baseTrocadorUrl.searchParams.set("direct", "True");
    if (tickerFrom) {
      baseTrocadorUrl.searchParams.set("ticker_from", tickerFrom);
    }

    const trocadorRes = await fetch(baseTrocadorUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!trocadorRes.ok) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "text/plain");
      res.end("Failed to reach AnonPay service");
      return;
    }

    let html = await trocadorRes.text();

    // Ensure links and assets resolve properly to trocador.app and forms submit to new tab instead of breaking frame
    html = html.replace(/target="_top"/g, 'target="_blank"');
    if (html.includes("<head>")) {
      html = html.replace(
        "<head>",
        `<head><base href="https://trocador.app/" target="_blank">`
      );
    } else {
      html = `<base href="https://trocador.app/" target="_blank">` + html;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    res.end(html);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("AnonPay Gateway proxy error");
  }
}
