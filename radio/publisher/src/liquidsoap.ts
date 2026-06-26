import { createConnection, type Socket } from "net";

const LIQUIDSOAP_HOST = process.env.LIQUIDSOAP_HOST || "localhost";
const LIQUIDSOAP_TELNET_PORT = parseInt(process.env.LIQUIDSOAP_TELNET_PORT || "1234");

let socket: Socket | null = null;
let connected = false;
let responseBuffer = "";
let commandQueue: Array<{ resolve: (lines: string[]) => void; reject: (reason: any) => void }> = [];
let currentLines: string[] = [];

function connect() {
  if (socket) return;

  socket = createConnection(LIQUIDSOAP_TELNET_PORT, LIQUIDSOAP_HOST);

  socket.on("connect", () => {
    console.log("[liquidsoap] Telnet connected");
    connected = true;
  });

  socket.on("data", (data) => {
    responseBuffer += data.toString();

    while (responseBuffer.includes("\n")) {
      const nlIndex = responseBuffer.indexOf("\n");
      const line = responseBuffer.substring(0, nlIndex).trim();
      responseBuffer = responseBuffer.substring(nlIndex + 1);

      if (line === "END") {
        if (commandQueue.length > 0) {
          const entry = commandQueue.shift()!;
          entry.resolve(currentLines);
          currentLines = [];
        }
        continue;
      }

      if (line !== "") {
        currentLines.push(line);
      }
    }
  });

  socket.on("error", (err) => {
    if (connected) {
      console.error("[liquidsoap] Telnet error:", err.message);
    }
    connected = false;
    socket = null;
    commandQueue.forEach(({ reject }) => reject(new Error("Connection lost")));
    commandQueue = [];
    currentLines = [];
    setTimeout(connect, 3000);
  });

  socket.on("close", () => {
    if (connected) {
      console.log("[liquidsoap] Telnet disconnected");
    }
    connected = false;
    socket = null;
    commandQueue.forEach(({ reject }) => reject(new Error("Connection closed")));
    commandQueue = [];
    currentLines = [];
    setTimeout(connect, 3000);
  });
}

export function sendCommand(cmd: string, timeoutMs = 5000): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!socket || !connected) {
      reject(new Error("Not connected to Liquidsoap"));
      return;
    }

    const timeout = setTimeout(() => {
      const idx = commandQueue.findIndex((q) => q.resolve === entry.resolve);
      if (idx !== -1) commandQueue.splice(idx, 1);
      reject(new Error("Command timeout"));
    }, timeoutMs);

    const entry = {
      resolve: (lines: string[]) => {
        clearTimeout(timeout);
        resolve(lines);
      },
      reject: (reason: any) => {
        clearTimeout(timeout);
        reject(reason);
      },
    };

    commandQueue.push(entry);
    socket.write(cmd + "\n");
  });
}

export async function skipTrack(): Promise<void> {
  await sendCommand("skip");
}

export async function pausePlayback(): Promise<void> {
  await sendCommand("output.harbor.stop");
}

export async function startPlayback(): Promise<void> {
  await sendCommand("output.harbor.start");
}

export async function getCurrentRequestId(): Promise<string | null> {
  try {
    const lines = await sendCommand("request.on_air");
    const rid = lines[0]?.trim();
    return rid && rid !== "" ? rid : null;
  } catch {
    return null;
  }
}

export async function getRequestMetadata(rid: string): Promise<Record<string, string>> {
  try {
    const lines = await sendCommand(`request.metadata ${rid}`);
    const meta: Record<string, string> = {};
    for (const line of lines) {
      const eqIndex = line.indexOf("=");
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex).trim();
        const value = line.substring(eqIndex + 1).trim();
        meta[key] = value;
      }
    }
    return meta;
  } catch {
    return {};
  }
}

export async function getStreamStatus() {
  try {
    const rid = await getCurrentRequestId();

    if (!rid) {
      return {
        connected,
        playing: false,
        currentTrack: null,
        artist: null,
        title: null,
        uptime: "0",
      };
    }

    const [meta, uptimeLines] = await Promise.all([
      getRequestMetadata(rid).catch(() => ({})),
      sendCommand("uptime").catch(() => ["0"]),
    ]);

    return {
      connected,
      playing: true,
      currentTrack: rid,
      artist: meta.artist || null,
      title: meta.title || meta.filename || null,
      uptime: uptimeLines[0] || "0",
    };
  } catch {
    return {
      connected: false,
      playing: false,
      currentTrack: null,
      artist: null,
      title: null,
      uptime: "0",
    };
  }
}

export async function reloadPlaylist(): Promise<void> {
  await sendCommand("reload");
}

export function initLiquidsoap(): void {
  connect();
}

export function isLiquidsoapConnected(): boolean {
  return connected;
}
