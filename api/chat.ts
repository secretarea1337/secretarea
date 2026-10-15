import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp } from "./_rateLimit";
import { handleCors, applySecurityHeaders } from "./_security";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  applySecurityHeaders(res);

  if (handleCors(req, res)) {
    return;
  }

  // Rate Limiting: 30 chat messages per 10 minutes per IP
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`chat:${clientIp}`, 30, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Too many chat messages. Please wait a few moments before trying again." }));
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  // Read body safely with max 32KB payload size protection
  let bodyStr = "";
  const MAX_PAYLOAD = 32 * 1024;
  let exceeded = false;

  for await (const chunk of req) {
    bodyStr += chunk;
    if (bodyStr.length > MAX_PAYLOAD) {
      exceeded = true;
      break;
    }
  }

  if (exceeded) {
    res.statusCode = 413;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Payload too large" }));
    return;
  }

  let userMessage = "";
  try {
    const parsed = JSON.parse(bodyStr || "{}");
    userMessage = typeof parsed.message === "string" ? parsed.message.trim() : "";
  } catch (e) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }

  // Input validation: 1 to 500 characters
  if (!userMessage || userMessage.length === 0) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Message cannot be empty." }));
    return;
  }

  if (userMessage.length > 500) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Message exceeds 500 characters limit." }));
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      text: "NEXA AI assistant is currently in offline mode. For support or requests, please visit the Request section."
    }));
    return;
  }

  try {
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
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ text: reply }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to generate AI response. Please try again later." }));
  }
}
