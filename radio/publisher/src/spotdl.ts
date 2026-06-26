import { spawn, type ChildProcess } from "child_process";
import { readdirSync, statSync } from "fs";
import { join, basename, extname } from "path";
import type { Track, DownloadJob } from "./types";
import { createDownload, updateDownload, getDownload, getAllDownloads as dbGetAll, clearDownloads as dbClear } from "./db";

const MUSIC_DIR = process.env.MUSIC_DIR || "/app/music";
const SONGS_DIR = join(MUSIC_DIR, "songs");
const SPOTDL_HOST = process.env.SPOTDL_HOST;

const activeProcesses = new Map<string, ChildProcess>();

export async function downloadFromSpotify(url: string): Promise<DownloadJob> {
  const job = createDownload(url);
  console.log(`[spotdl] Starting download: ${url}`);

  return new Promise((resolve) => {
    const args = ["download", url, "--output", SONGS_DIR];
    const cmd = SPOTDL_HOST ? "python3" : "spotdl";
    const cmdArgs = SPOTDL_HOST ? ["-m", "spotdl", ...args] : args;

    const proc = spawn(cmd, cmdArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    activeProcesses.set(job.id, proc);

    let stderr = "";

    proc.stdout?.on("data", (data: Buffer) => {
      console.log(`[spotdl] ${data.toString().trim()}`);
    });

    proc.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      activeProcesses.delete(job.id);

      if (code === 0) {
        const files = readdirSync(SONGS_DIR)
          .filter((f) => /\.(mp3|wav|ogg|flac|m4a)$/i.test(f))
          .sort((a, b) => {
            try {
              return statSync(join(SONGS_DIR, b)).mtimeMs - statSync(join(SONGS_DIR, a)).mtimeMs;
            } catch {
              return 0;
            }
          });

        if (files.length > 0) {
          const latestFile = files[0];
          const filePath = join(SONGS_DIR, latestFile);
          const name = basename(latestFile, extname(latestFile));

          const track: Track = {
            id: `lib_${Date.now()}`,
            type: "song",
            file: `songs/${latestFile}`,
            title: name,
            duration: Math.floor(statSync(filePath).size / (192 * 1000 / 8)),
            spotifyUrl: url,
            addedAt: new Date().toISOString(),
          };

          updateDownload(job.id, {
            status: "done",
            result: track,
            completedAt: new Date().toISOString(),
          });

          job.status = "done";
          job.result = track;
          job.completedAt = new Date().toISOString();
          console.log(`[spotdl] Download complete: ${track.title}`);
        } else {
          updateDownload(job.id, { status: "error", error: "No file found after download", completedAt: new Date().toISOString() });
          job.status = "error";
          job.error = "No file found after download";
        }
      } else {
        updateDownload(job.id, { status: "error", error: stderr || `Exit code ${code}`, completedAt: new Date().toISOString() });
        job.status = "error";
        job.error = stderr || `Exit code ${code}`;
        job.completedAt = new Date().toISOString();
        console.error(`[spotdl] Download failed: ${job.error}`);
      }

      resolve(loadJob(job.id));
    });

    proc.on("error", (err) => {
      activeProcesses.delete(job.id);
      updateDownload(job.id, { status: "error", error: err.message, completedAt: new Date().toISOString() });
      job.status = "error";
      job.error = err.message;
      job.completedAt = new Date().toISOString();
      console.error(`[spotdl] Process error: ${err.message}`);
      resolve(loadJob(job.id));
    });
  });
}

function loadJob(id: string): DownloadJob {
  return getDownload(id) || { id, url: "", status: "error", error: "Not found", startedAt: new Date().toISOString() };
}

export function getDownloadJob(id: string): DownloadJob | null {
  return getDownload(id);
}

export function getAllDownloads(): DownloadJob[] {
  return dbGetAll();
}

export function cancelDownload(id: string): boolean {
  const proc = activeProcesses.get(id);
  if (proc) {
    proc.kill("SIGTERM");
    activeProcesses.delete(id);
    updateDownload(id, { status: "error", error: "Cancelled by user", completedAt: new Date().toISOString() });
    return true;
  }
  return false;
}

export function clearDownloads(): void {
  for (const [id] of activeProcesses) {
    cancelDownload(id);
  }
  dbClear();
}
