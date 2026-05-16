import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { readFile } from "fs/promises";
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
const GIPHY_API_KEY = process.env.GIPHY_API_KEY || "dc6zaTOxFJmzC"; // optional; app falls back to curated GIFs

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


app.get("/api/patchlog", async (_req, res) => {
  try {
    const readme = await readFile(path.join(__dirname, "README.md"), "utf8");
    const lines = readme.split(/\r?\n/);
    const sections = [];
    let current = null;
    for (const line of lines) {
      const heading = line.match(/^##\s+(.+)/);
      if (heading) {
        if (current && current.items.length) sections.push(current);
        current = { title: heading[1].trim(), items: [] };
        continue;
      }
      if (!current) continue;
      const item = line.match(/^[-*]\s+(.+)/);
      if (item) current.items.push(item[1].trim());
    }
    if (current && current.items.length) sections.push(current);
    const patchSections = sections.filter(section => /patch|update|fix|included/i.test(section.title));
    res.json({ source: "README.md", patches: patchSections.slice(-9).reverse() });
  } catch (error) {
    res.status(500).json({ message: "Could not read README patch log." });
  }
});


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


app.get("/api/bot-profile", (_req, res) => {
  res.json({
    id: "97f34dc7b45cfed1c0b86bdd",
    name: "ineffa",
    title: "Main bot of Miliastra",
    character: DEFAULT_CHARACTER,
    avatar: "/assets/ineffa-profile.webp",
    status: "online",
    provider_label: "Erica API",
    capabilities: [
      "Text chat with session memory",
      "Web search through request-scoped tools",
      "Image generation",
      "Vision/reference image URLs",
      "Context GIF reactions",
      "Roleplay scenarios",
      "User-name aware replies"
    ],
    limits: {
      messages: 60,
      message_text: "4000 characters each",
      total_text: "20000 characters",
      image_urls: 4,
      image_size: "1024x1024"
    },
    lore: "ineffa is the main Miliastra companion: calm, observant, softly teasing, and ready for cozy roleplay, web searching, image prompts, and GIF reactions."
  });
});

const curatedGifs = [
  { keys: ["qiqi", "genshin", "zombie"], title: "Qiqi / Genshin style reaction", url: "https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif" },
  { keys: ["elaina", "witch", "magic", "majo", "tabitabi"], title: "Witch magic reaction", url: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" },
  { keys: ["happy", "cute", "smile", "yay", "love"], title: "Happy sparkle reaction", url: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif" },
  { keys: ["sad", "cry", "comfort", "tired", "stress"], title: "Comfort reaction", url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif" },
  { keys: ["hello", "hi", "hey", "wave"], title: "Greeting reaction", url: "https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif" },
  { keys: ["food", "cafe", "tea", "coffee", "cake"], title: "Cozy café reaction", url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" },
  { keys: ["search", "web", "news", "find"], title: "Searching reaction", url: "https://media.giphy.com/media/3orieUe6ejxSFxYCXe/giphy.gif" },
  { keys: ["art", "image", "draw", "paint"], title: "Art reaction", url: "https://media.giphy.com/media/3oEduT5R5xG4YdgO9G/giphy.gif" },
  { keys: ["default"], title: "Miliastra reaction", url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif" }
];

function curatedGifResults(query) {
  const hay = String(query || "").toLowerCase();
  const ranked = curatedGifs
    .map((gif) => ({ gif, score: gif.keys.reduce((n, key) => n + (hay.includes(key) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score);
  const chosen = ranked.filter((r) => r.score > 0).map((r) => r.gif);
  const fallback = curatedGifs.filter((g) => !chosen.includes(g));
  return [...chosen, ...fallback].slice(0, 8).map((gif, index) => ({ id: `curated_${index}`, title: gif.title, url: gif.url, preview: gif.url, source: "curated" }));
}

app.get("/api/gif", async (req, res) => {
  const q = String(req.query.q || "anime reaction").trim().slice(0, 120) || "anime reaction";
  try {
    // No Tenor: use GIPHY when an optional key works, otherwise return a curated GIF set immediately.
    if (GIPHY_API_KEY) {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(GIPHY_API_KEY)}&q=${encodeURIComponent(q + " anime reaction")}&limit=8&rating=pg-13`;
      const upstream = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await upstream.json().catch(() => null);
      const results = (data?.data || []).map((item) => ({
        id: item.id,
        title: item.title || q,
        url: item.images?.original?.url || item.images?.downsized_medium?.url || item.images?.fixed_height?.url,
        preview: item.images?.fixed_height_small?.url || item.images?.preview_gif?.url
      })).filter((item) => item.url);
      if (results.length) return res.json({ query: q, results, provider: "giphy" });
    }
    return res.json({ query: q, results: curatedGifResults(q), provider: "curated" });
  } catch (error) {
    return res.json({ query: q, results: curatedGifResults(q), provider: "curated" });
  }
});

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
