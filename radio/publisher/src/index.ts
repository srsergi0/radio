import api from "./api";
import { initLiquidsoap, queuePush, queueLength } from "./liquidsoap";
import { initLibrary, listSongs } from "./library";
import { initDB } from "./db";

const PORT = parseInt(process.env.PORT || "3000");
const LIQUIDSOAP_HOST = process.env.LIQUIDSOAP_HOST || "liquidsoap";
const LIQUIDSOAP_HARBOUR_PORT = process.env.LIQUIDSOAP_HARBOUR_PORT || "8000";
const STREAM_URL = `http://${LIQUIDSOAP_HOST}:${LIQUIDSOAP_HARBOUR_PORT}/radiobloom.mp3`;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Proxy streaming endpoint
    if (url.pathname === "/radiobloom.mp3") {
      try {
        const upstream = await fetch(STREAM_URL);

        if (!upstream.ok || !upstream.body) {
          return new Response("Stream unavailable", { status: 502 });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err: any) {
        return new Response("Stream connection failed", { status: 502 });
      }
    }

    // API routes
    return api.fetch(req);
  },
});

console.log(`[server] Radio Bloom API + Stream on port ${PORT}`);
console.log(`[server] Stream: http://localhost:${PORT}/radiobloom.mp3`);
console.log(`[server] API:    http://localhost:${PORT}/api/`);
console.log(`[server] Endpoints:`);
console.log(`  GET  /radiobloom.mp3          ← Stream de audio`);
console.log(`  GET  /api/health`);
console.log(`  GET  /api/system/status`);
console.log(`  GET  /api/system/config`);
console.log(`  PUT  /api/system/config`);
console.log(`  GET  /api/library`);
console.log(`  GET  /api/library/songs`);
console.log(`  GET  /api/library/interludios`);
console.log(`  GET  /api/library/stats`);
console.log(`  GET  /api/library/track?file=...`);
console.log(`  DEL  /api/library/track?file=...`);
console.log(`  POST /api/library/scan`);
console.log(`  GET  /api/stream`);
console.log(`  POST /api/stream/play`);
console.log(`  POST /api/stream/pause`);
console.log(`  GET  /api/stream/skip`);
console.log(`  POST /api/stream/skip`);
console.log(`  POST /api/stream/reload`);
console.log(`  POST /api/stream/queue     (body: {"url":"..."})`);
console.log(`  GET  /api/stream/queue`);
console.log(`  DEL  /api/stream/queue`);
console.log(`  POST /api/stream/play/url  (body: {"url":"..."})`);
console.log(`  POST /api/library/:id/play`);

const QUEUE_REFILL_TARGET = 10;
const QUEUE_REFILL_MIN = 3;

async function refillQueue() {
  try {
    const len = await queueLength();
    if (len >= QUEUE_REFILL_MIN) return;
    const songs = listSongs();
    const shuffled = songs.sort(() => Math.random() - 0.5);
    const toPush = shuffled.slice(0, QUEUE_REFILL_TARGET);
    for (const song of toPush) {
      const filepath = `/music/${song.file}`;
      await queuePush(filepath).catch(() => {});
    }
    console.log(`[queue] Refilled: ${toPush.length} tracks from DB (queue had ${len})`);
  } catch {}
}

initDB();
initLibrary();
initLiquidsoap();

setTimeout(refillQueue, 3000);
setInterval(refillQueue, 30000);

console.log(`[server] Radio Bloom ready`);
