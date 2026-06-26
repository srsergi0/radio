import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadTimeline, saveTimeline, addTrack, insertTrack, updateTrack, removeTrack, reorderTracks, setCurrentIndex, clearTimeline, getCurrentTrack, getTrackById } from "./playlist";
import { initLibrary, listSongs, listInterludios, deleteTrack, getLibraryStats, scanLibrary, getTrackByFile, getTrackByUrl } from "./library";
import { downloadFromSpotify, getDownloadJob, getAllDownloads, cancelDownload, clearDownloads } from "./spotdl";
import { skipTrack, pausePlayback, startPlayback, getStreamStatus, reloadPlaylist, isLiquidsoapConnected, queuePush, queueList, queueClear, playFileNow, queueLength, sendCommand } from "./liquidsoap";
import { loadConfig, updateConfig } from "./config";
import type { Track } from "./types";

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
// TIMELINE / SCHEDULE
// ============================================================

app.get("/api/timeline", (c) => {
  const timeline = loadTimeline();
  return c.json({ ok: true, data: timeline });
});

app.get("/api/timeline/current", (c) => {
  const track = getCurrentTrack();
  return c.json({ ok: true, data: track });
});

app.get("/api/timeline/:trackId", (c) => {
  const id = c.req.param("trackId");
  const track = getTrackById(id);
  if (!track) return c.json({ ok: false, error: "Track not found" }, 404);
  return c.json({ ok: true, data: track });
});

app.post("/api/timeline", async (c) => {
  const body = await c.req.json();
  const timeline = loadTimeline();
  if (body.tracks) timeline.tracks = body.tracks;
  if (typeof body.currentIndex === "number") timeline.currentIndex = body.currentIndex;
  if (typeof body.isPlaying === "boolean") timeline.isPlaying = body.isPlaying;
  saveTimeline(timeline);
  return c.json({ ok: true, data: timeline });
});

app.post("/api/timeline/tracks", async (c) => {
  const body = await c.req.json();
  const track: Track = body;
  if (!track.file || !track.title) {
    return c.json({ ok: false, error: "file and title are required" }, 400);
  }
  if (!track.id) track.id = `tl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!track.addedAt) track.addedAt = new Date().toISOString();
  if (!track.type) track.type = "song";
  if (!track.duration) track.duration = 0;
  const timeline = addTrack(track);
  return c.json({ ok: true, data: timeline });
});

app.post("/api/timeline/tracks/insert", async (c) => {
  const body = await c.req.json();
  const { index, track } = body;
  if (typeof index !== "number" || !track) {
    return c.json({ ok: false, error: "index and track are required" }, 400);
  }
  if (!track.id) track.id = `tl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (!track.addedAt) track.addedAt = new Date().toISOString();
  if (!track.type) track.type = "song";
  if (!track.duration) track.duration = 0;
  const timeline = insertTrack(index, track);
  return c.json({ ok: true, data: timeline });
});

app.put("/api/timeline/tracks/:trackId", async (c) => {
  const id = c.req.param("trackId");
  const updates = await c.req.json();
  const track = updateTrack(id, updates);
  if (!track) return c.json({ ok: false, error: "Track not found" }, 404);
  return c.json({ ok: true, data: track });
});

app.delete("/api/timeline/tracks/:trackId", (c) => {
  const id = c.req.param("trackId");
  const timeline = removeTrack(id);
  return c.json({ ok: true, data: timeline });
});

app.post("/api/timeline/tracks/reorder", async (c) => {
  const body = await c.req.json();
  const { fromIndex, toIndex } = body;
  if (typeof fromIndex !== "number" || typeof toIndex !== "number") {
    return c.json({ ok: false, error: "fromIndex and toIndex are required" }, 400);
  }
  const timeline = reorderTracks(fromIndex, toIndex);
  return c.json({ ok: true, data: timeline });
});

app.post("/api/timeline/tracks/clear", (c) => {
  const timeline = clearTimeline();
  return c.json({ ok: true, data: timeline });
});

app.post("/api/timeline/play", async (c) => {
  const body = await c.req.json();
  const { index } = body;
  if (typeof index !== "number") {
    return c.json({ ok: false, error: "index is required" }, 400);
  }
  const timeline = setCurrentIndex(index);
  return c.json({ ok: true, data: timeline });
});

// ============================================================
// DOWNLOADS (spotDL)
// ============================================================

app.post("/api/downloads", async (c) => {
  const body = await c.req.json();
  const { url } = body;
  if (!url) return c.json({ ok: false, error: "url is required" }, 400);

  const job = await downloadFromSpotify(url);
  return c.json({ ok: true, data: job });
});

app.get("/api/downloads", (c) => {
  return c.json({ ok: true, data: getAllDownloads() });
});

app.get("/api/downloads/:id", (c) => {
  const id = c.req.param("id");
  const job = getDownloadJob(id);
  if (!job) return c.json({ ok: false, error: "Download not found" }, 404);
  return c.json({ ok: true, data: job });
});

app.delete("/api/downloads/:id", (c) => {
  const id = c.req.param("id");
  const cancelled = cancelDownload(id);
  if (!cancelled) return c.json({ ok: false, error: "Download not found or already finished" }, 404);
  return c.json({ ok: true, data: { cancelled: id } });
});

app.delete("/api/downloads", (c) => {
  clearDownloads();
  return c.json({ ok: true, data: { cleared: true } });
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
    const { file } = body;
    if (!file) return c.json({ ok: false, error: "file is required" }, 400);
    const rid = await queuePush(file);
    return c.json({ ok: true, data: { rid, file } });
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

app.post("/api/stream/play/file", async (c) => {
  try {
    const body = await c.req.json();
    const { file } = body;
    if (!file) return c.json({ ok: false, error: "file is required" }, 400);
    const ok = await playFileNow(file);
    if (!ok) return c.json({ ok: false, error: "Failed to queue track" }, 500);
    const st = await getStreamStatus();
    return c.json({ ok: true, data: { action: "playfile", file, nowPlaying: st } });
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
      const ok = await playFileNow(`/music/${existing.file}`);
      if (!ok) return c.json({ ok: false, error: "Failed to play track" }, 500);
      const st = await getStreamStatus();
      return c.json({ ok: true, data: { source: "library", track: existing, nowPlaying: st } });
    }

    const { downloadFromSpotify } = await import("./spotdl");
    const job = await downloadFromSpotify(url, async (track) => {
      const filepath = `/music/${track.file}`;
      await sendCommand(`queue.push ${filepath}`);
      await sendCommand("queue.flush_and_skip");
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
