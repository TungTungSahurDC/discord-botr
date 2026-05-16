import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Miliastra & The Land Down Undah
// Backend proxy for Erica / Verba-compatible API. Keeps API key private.

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ERICA_API_KEY = process.env.ERICA_API_KEY || process.env.VERBA_API_KEY;
const DEFAULT_CHARACTER = process.env.DEFAULT_CHARACTER || process.env.VERBA_CHARACTER || "https://verba.ink/v/ineffa_o1r";
const API_BASE = process.env.ERICA_API_BASE || "https://api.verba.ink";
const RESPONSE_URL = `${API_BASE}/v1/response`;
const IMAGE_URL = `${API_BASE}/v1/image`;

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:", "blob:"],
      "connect-src": ["'self'"],
      "media-src": ["'self'", "data:", "https:"],
      "frame-src": ["'self'", "https://discord.com", "https://open.spotify.com", "https://www.youtube.com"],
      "child-src": ["'self'", "https://discord.com", "https://open.spotify.com", "https://www.youtube.com"]
    }
  }
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1.5mb" }));
app.use(express.static(path.join(__dirname, "public")));

function requireKey(res) {
  if (!ERICA_API_KEY) {
    res.status(500).json({ message: "Missing ERICA_API_KEY. Add it to .env before starting the server." });
    return false;
  }
  return true;
}

function cleanSessionId(value) {
  return typeof value === "string" ? value.replace(/[^A-Za-z0-9:_-]/g, "").slice(0, 128) : undefined;
}

function cleanCharacter(value) {
  const character = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_CHARACTER;
  return character.slice(0, 240);
}

function cleanMessageContent(content) {
  if (typeof content === "string") return content.slice(0, 4000);
  if (Array.isArray(content)) {
    return content.slice(0, 8).map((part) => {
      if (part?.type === "text") return { type: "text", text: String(part.text || "").slice(0, 4000) };
      if (part?.type === "image_url" && part.image_url?.url) {
        return { type: "image_url", image_url: { url: String(part.image_url.url).slice(0, 2048) } };
      }
      return null;
    }).filter(Boolean);
  }
  return "";
}

function cleanMessages(messages = []) {
  return messages
    .filter((msg) => msg && ["user", "assistant"].includes(msg.role))
    .slice(-60)
    .map((msg) => ({ role: msg.role, content: cleanMessageContent(msg.content) }))
    .filter((msg) => msg.content && !(Array.isArray(msg.content) && !msg.content.length));
}

function cleanImageUrls(urls = []) {
  if (!Array.isArray(urls)) return [];
  return urls.filter((url) => typeof url === "string" && /^https?:\/\//i.test(url)).slice(0, 4).map((url) => url.slice(0, 2048));
}

function cleanTools(tools = []) {
  if (!Array.isArray(tools)) return [];
  return tools.slice(0, 8).filter((tool) => tool?.type === "function" && tool.function?.name && tool.function?.x_verba_http);
}

function buildChatPayload(req, stream = false) {
  const payload = {
    character: cleanCharacter(req.body.character),
    messages: cleanMessages(req.body.messages),
    stream,
    temperature: clampNumber(req.body.temperature, 0, 2, 0.8),
    top_p: clampNumber(req.body.top_p, 0, 1, 1),
    max_tokens: Math.min(Math.max(Number(req.body.max_tokens) || 900, 64), 2000)
  };

  const sessionId = cleanSessionId(req.body.session_id);
  if (sessionId) payload.session_id = sessionId;

  const imageUrls = cleanImageUrls(req.body.image_urls);
  if (imageUrls.length) payload.image_urls = imageUrls;

  const tools = cleanTools(req.body.tools);
  if (tools.length) {
    payload.tools = tools;
    payload.tool_choice = req.body.tool_choice === "none" ? "none" : "auto";
    if (req.body.debug_tools) payload.debug = { tools: true };
  }

  return payload;
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "Miliastra & The Land Down Undah", main_bot: "ineffa", brand: "Erica", default_character: DEFAULT_CHARACTER });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const payload = buildChatPayload(req, false);
    if (!payload.messages.length || payload.messages[payload.messages.length - 1].role !== "user") {
      return res.status(400).json({ message: "Send at least one user message." });
    }

    const upstream = await fetch(RESPONSE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${ERICA_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) return res.status(upstream.status).json({ message: data?.message || "Erica text request failed.", error: data?.error || null });

    res.json({
      reply: data?.choices?.[0]?.message?.content || "I couldn't generate a reply.",
      session_id: data?.session_id || payload.session_id || null,
      debug: data?.debug || null,
      usage: data?.usage || null,
      raw: process.env.NODE_ENV === "development" ? data : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while contacting Erica." });
  }
});

app.post("/api/chat/stream", async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const payload = buildChatPayload(req, true);
    if (!payload.messages.length || payload.messages[payload.messages.length - 1].role !== "user") {
      return res.status(400).json({ message: "Send at least one user message." });
    }

    const upstream = await fetch(RESPONSE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${ERICA_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok || !upstream.body) {
      const data = await upstream.json().catch(() => null);
      return res.status(upstream.status).json({ message: data?.message || "Streaming is unavailable for this plan or request.", error: data?.error || null });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    });

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ message: "Server error while streaming Erica." });
    else res.end();
  }
});

app.post("/api/image", async (req, res) => {
  try {
    if (!requireKey(res)) return;
    const prompt = typeof req.body.prompt === "string" ? req.body.prompt.trim().slice(0, 1500) : "";
    if (!prompt) return res.status(400).json({ message: "Image prompt is required." });

    const payload = {
      character: cleanCharacter(req.body.character),
      prompt,
      size: "1024x1024",
      response_format: "url"
    };
    const sessionId = cleanSessionId(req.body.session_id);
    if (sessionId) payload.session_id = sessionId;
    const imageUrls = cleanImageUrls(req.body.image_urls);
    if (imageUrls.length) payload.image_urls = imageUrls;

    const upstream = await fetch(IMAGE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${ERICA_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) return res.status(upstream.status).json({ message: data?.message || "Erica image request failed.", error: data?.error || null });

    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) return res.status(502).json({ message: "Erica did not return an image URL." });

    res.json({ image_url: imageUrl, revised_prompt: data?.revised_prompt || prompt, session_id: data?.session_id || sessionId || null, raw: process.env.NODE_ENV === "development" ? data : undefined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while generating image." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Miliastra running at http://localhost:${PORT}`));
