import { Hono } from "hono";
import { cors } from "hono/cors";
import { listSongs, listInterludios, deleteTrack, getLibraryStats, scanLibrary, getTrackByUrl } from "./library";
import { skipTrack, pausePlayback, startPlayback, getStreamStatus, reloadPlaylist, isLiquidsoapConnected, queuePush, queueList, queueClear, playFileNow, queueLength, sendCommand } from "./liquidsoap";
import { loadConfig, updateConfig } from "./config";

const app = new Hono();

app.use("*", cors());

// ============================================================
// SYSTEM
// ============================================================

app.get("/api/system/status", async (c) => {
  const liquidsoapConnected = isLiquidsoapConnected();
  const config = loadConfig();
  return c.json({
    ok: true,
    data: {
      liquidsoap: {
        connected: liquidsoapConnected,
        telnetPort: parseInt(process.env.LIQUIDSOAP_TELNET_PORT || "1234"),
        harbourPort: parseInt(process.env.LIQUIDSOAP_HARBOUR_PORT || "8000"),
        streamUrl: `http://localhost:${process.env.LIQUIDSOAP_HARBOUR_PORT || "8000"}/radiobloom.mp3`,
      },
      config,
    },
  });
});

app.get("/api/system/config", (c) => {
  return c.json({ ok: true, data: loadConfig() });
});

app.put("/api/system/config", async (c) => {
  const body = await c.req.json();
  const config = updateConfig(body);
  return c.json({ ok: true, data: config });
});

// ============================================================
// LIBRARY
// ============================================================

app.get("/api/library", (c) => {
  const songs = listSongs();
  const interludios = listInterludios();
  return c.json({ ok: true, data: { songs, interludios } });
});

app.get("/api/library/songs", (c) => {
  return c.json({ ok: true, data: listSongs() });
});

app.get("/api/library/interludios", (c) => {
  return c.json({ ok: true, data: listInterludios() });
});

app.get("/api/library/stats", (c) => {
  return c.json({ ok: true, data: getLibraryStats() });
});

app.get("/api/library/track", (c) => {
  const file = c.req.query("file");
  if (!file) return c.json({ ok: false, error: "file query param required" }, 400);
  const track = getTrackByFile(file);
  if (!track) return c.json({ ok: false, error: "Track not found" }, 404);
  return c.json({ ok: true, data: track });
});

app.delete("/api/library/track", (c) => {
  const file = c.req.query("file");
  if (!file) return c.json({ ok: false, error: "file query param required" }, 400);
  const deleted = deleteTrack(file);
  if (!deleted) return c.json({ ok: false, error: "File not found or could not delete" }, 404);
  return c.json({ ok: true, data: { deleted: file } });
});

app.post("/api/library/scan", (c) => {
  const stats = scanLibrary();
  return c.json({ ok: true, data: stats });
});

app.post("/api/library/:id/play", async (c) => {
  const id = c.req.param("id");
  const allTracks = [...listSongs(), ...listInterludios()];
  console.log("[library/play] id:", id, "total tracks:", allTracks.length);
  const track = allTracks.find((t) => t.id === id);
  if (!track) return c.json({ ok: false, error: "Track not found" }, 404);
  const filepath = `/music/${track.file}`;
  const ok = await playFileNow(filepath);
  if (!ok) return c.json({ ok: false, error: "Failed to play track" }, 500);
  return c.json({ ok: true, data: { action: "play", track } });
});

// ============================================================
// STREAM CONTROL (Liquidsoap)
// ============================================================

app.get("/api/stream", async (c) => {
  const status = await getStreamStatus();
  return c.json({ ok: true, data: status });
});

app.post("/api/stream/play", async (c) => {
  try {
    await startPlayback();
    return c.json({ ok: true, data: { action: "play" } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

app.post("/api/stream/pause", async (c) => {
  try {
    await pausePlayback();
    return c.json({ ok: true, data: { action: "pause" } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

async function handleSkip(c: any) {
  try {
    await skipTrack();
    await new Promise((r) => setTimeout(r, 500));
    const status = await getStreamStatus();
    return c.json({ ok: true, data: { action: "skip", nowPlaying: status } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
}

app.get("/api/stream/skip", handleSkip);
app.post("/api/stream/skip", handleSkip);

app.post("/api/stream/reload", async (c) => {
  try {
    await reloadPlaylist();
    return c.json({ ok: true, data: { action: "reload" } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

app.post("/api/stream/queue", async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body;
    if (!url) return c.json({ ok: false, error: "url is required" }, 400);

    const existing = getTrackByUrl(url);
    if (!existing) {
      const { downloadFromSpotify } = await import("./spotdl");
      const job = await downloadFromSpotify(url, async (track) => {
        const filepath = `/music/${track.file}`;
        await queuePush(filepath);
      });
      const list = await queueList();
      return c.json({ ok: true, data: { source: "download", job, queue: list } });
    }

    const filepath = `/music/${existing.file}`;
    const rid = await queuePush(filepath);
    const list = await queueList();
    return c.json({ ok: true, data: { source: "library", rid, track: existing, queue: list } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

app.get("/api/stream/queue", async (c) => {
  try {
    const items = await queueList();
    return c.json({ ok: true, data: items });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

app.delete("/api/stream/queue", async (c) => {
  try {
    await queueClear();
    return c.json({ ok: true, data: { cleared: true } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

app.post("/api/stream/play/url", async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body;
    if (!url) return c.json({ ok: false, error: "url is required" }, 400);

    const existing = getTrackByUrl(url);
    if (existing) {
      const filepath = `/music/${existing.file}`;
      await sendCommand("queue.flush_and_skip");
      await new Promise((r) => setTimeout(r, 500));
      const rid = await queuePush(filepath);
      if (!rid) return c.json({ ok: false, error: "Failed to queue" }, 500);
      const st = await getStreamStatus();
      const list = await queueList();
      return c.json({ ok: true, data: { source: "library", track: existing, nowPlaying: st, queue: list } });
    }

    const { downloadFromSpotify } = await import("./spotdl");
    const job = await downloadFromSpotify(url, async (track) => {
      const filepath = `/music/${track.file}`;
      await sendCommand("queue.flush_and_skip").catch(() => {});
      await new Promise((r) => setTimeout(r, 500));
      await queuePush(filepath).catch(() => {});
    });
    return c.json({ ok: true, data: { source: "download", job } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ============================================================
// HEALTH
// ============================================================

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    data: {
      status: "running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default app;
