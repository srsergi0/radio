import api from "./api";
import { initLiquidsoap } from "./liquidsoap";
import { initLibrary } from "./library";

const PORT = parseInt(process.env.PORT || "3000");

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    return api.fetch(req);
  },
});

console.log(`[server] Radio Bloom API running on port ${PORT}`);
console.log(`[server] Endpoints:`);
console.log(`  GET  /api/health`);
console.log(`  GET  /api/system/status`);
console.log(`  GET  /api/system/config`);
console.log(`  PUT  /api/system/config`);
console.log(`  GET  /api/library`);
console.log(`  GET  /api/library/songs`);
console.log(`  GET  /api/library/interludios`);
console.log(`  GET  /api/library/stats`);
console.log(`  GET  /api/library/:file`);
console.log(`  DEL  /api/library/:file`);
console.log(`  POST /api/library/scan`);
console.log(`  GET  /api/timeline`);
console.log(`  GET  /api/timeline/current`);
console.log(`  GET  /api/timeline/:trackId`);
console.log(`  POST /api/timeline`);
console.log(`  POST /api/timeline/tracks`);
console.log(`  POST /api/timeline/tracks/insert`);
console.log(`  PUT  /api/timeline/tracks/:trackId`);
console.log(`  DEL  /api/timeline/tracks/:trackId`);
console.log(`  POST /api/timeline/tracks/reorder`);
console.log(`  POST /api/timeline/tracks/clear`);
console.log(`  POST /api/timeline/play`);
console.log(`  POST /api/downloads`);
console.log(`  GET  /api/downloads`);
console.log(`  GET  /api/downloads/:id`);
console.log(`  DEL  /api/downloads/:id`);
console.log(`  DEL  /api/downloads`);
console.log(`  GET  /api/stream`);
console.log(`  POST /api/stream/play`);
console.log(`  POST /api/stream/pause`);
console.log(`  POST /api/stream/skip`);
console.log(`  POST /api/stream/reload`);

initLibrary();
initLiquidsoap();

console.log(`[server] Radio Bloom API ready`);
