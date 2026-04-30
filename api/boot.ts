import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ── File Upload ───────────────────────────────────────────────

app.post("/api/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate: only images
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "Only image files are allowed" }, 400);
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `${timestamp}-${random}.${ext}`;

    // Determine upload directory (outside dist/ to survive redeploys)
    const uploadDir = env.isProduction
      ? join(process.cwd(), "..", "blog-uploads")
      : join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return c.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload] error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// ── Music ────────────────────────────────────────────────────

app.get("/api/music", async (c) => {
  try {
    const musicDir = env.isProduction
      ? join(process.cwd(), "..", "blog-music")
      : join(process.cwd(), "public", "music");
    const { readdir } = await import("fs/promises");
    const { existsSync } = await import("fs");

    if (!existsSync(musicDir)) {
      await (await import("fs/promises")).mkdir(musicDir, { recursive: true });
      return c.json({ tracks: [] });
    }

    const files = await readdir(musicDir);
    const audioExts = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"];
    const tracks = files
      .filter((f) => audioExts.some((ext) => f.toLowerCase().endsWith(ext)))
      .map((f) => ({
        name: f,
        url: `/music/${f}`,
        artist: "",
      }));

    return c.json({ tracks });
  } catch (err) {
    console.error("[music] error:", err);
    return c.json({ tracks: [] });
  }
});

app.post("/api/music/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return c.json({ error: "No file provided" }, 400);
    }

    if (!file.type.startsWith("audio/")) {
      return c.json({ error: "Only audio files are allowed" }, 400);
    }

    const musicDir = env.isProduction
      ? join(process.cwd(), "..", "blog-music")
      : join(process.cwd(), "public", "music");
    const { mkdir, writeFile } = await import("fs/promises");
    await mkdir(musicDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(musicDir, file.name);
    await writeFile(filePath, buffer);

    return c.json({ success: true, name: file.name, url: `/music/${file.name}` });
  } catch (err) {
    console.error("[music/upload] error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

app.delete("/api/music/:name", async (c) => {
  try {
    const name = c.req.param("name");
    const musicDir = env.isProduction
      ? join(process.cwd(), "..", "blog-music")
      : join(process.cwd(), "public", "music");
    const { unlink } = await import("fs/promises");
    await unlink(join(musicDir, name));
    return c.json({ success: true });
  } catch (err) {
    console.error("[music/delete] error:", err);
    return c.json({ error: "Delete failed" }, 500);
  }
});

// ── Serve uploaded files & music ────────────────────────────

async function serveFile(c: any, fileName: string, baseDir: string, mimeMap: Record<string, string>) {
  const filePath = join(baseDir, fileName);
  // Prevent path traversal
  if (fileName.includes("..") || fileName.includes("/")) {
    return c.json({ error: "Invalid path" }, 400);
  }
  try {
    const { readFile, stat } = await import("fs/promises");
    const s = await stat(filePath);
    if (!s.isFile()) return c.json({ error: "Not Found" }, 404);
    const content = await readFile(filePath);
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return c.body(content, 200, {
      "Content-Type": mimeMap[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    });
  } catch {
    return c.json({ error: "Not Found" }, 404);
  }
}

app.get("/uploads/:file", async (c) => {
  const uploadDir = env.isProduction
    ? join(process.cwd(), "..", "blog-uploads")
    : join(process.cwd(), "public", "uploads");
  return serveFile(c, c.req.param("file"), uploadDir, {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  });
});

app.get("/music/:file", async (c) => {
  const musicDir = env.isProduction
    ? join(process.cwd(), "..", "blog-music")
    : join(process.cwd(), "public", "music");
  return serveFile(c, c.req.param("file"), musicDir, {
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    flac: "audio/flac", m4a: "audio/mp4", aac: "audio/aac",
  });
});

// ── Translate ────────────────────────────────────────────────

app.post("/api/translate", async (c) => {
  try {
    const { text, source, target } = await c.req.json();
    if (!text) return c.json({ error: "No text provided" }, 400);

    const sl = source || "zh-CN";
    const tl = target || "en";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text.slice(0, 5000))}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Translate API returned ${res.status}`);

    const data = await res.json();
    const translated = data[0]?.map((item: unknown[]) => item[0]).join("") || text;

    return c.json({ translated });
  } catch (err) {
    console.error("[translate] error:", err);
    return c.json({ error: "Translation failed" }, 500);
  }
});

// ── tRPC ──────────────────────────────────────────────────────

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
