import { spawn, type ChildProcess } from "child_process";
import { readdirSync, statSync, existsSync } from "fs";
import { join, basename, extname } from "path";
import type { Track, DownloadJob } from "./types";

const MUSIC_DIR = process.env.MUSIC_DIR || "/app/music";
const SONGS_DIR = join(MUSIC_DIR, "songs");
const SPOTDL_HOST = process.env.SPOTDL_HOST;

const downloads = new Map<string, DownloadJob>();
const activeProcesses = new Map<string, ChildProcess>();

function generateId(): string {
  return `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getAudioDuration(filePath: string): number {
  try {
    const stat = statSync(filePath);
    return Math.floor(stat.size / (192 * 1000 / 8));
  } catch {
    return 0;
  }
}

export async function downloadFromSpotify(url: string): Promise<DownloadJob> {
  const jobId = generateId();
  const job: DownloadJob = {
    id: jobId,
    url,
    status: "downloading",
    startedAt: new Date().toISOString(),
  };
  downloads.set(jobId, job);

  console.log(`[spotdl] Starting download: ${url}`);

  return new Promise((resolve) => {
    const args = ["download", url, "--output", SONGS_DIR];
    const cmd = SPOTDL_HOST ? "python3" : "spotdl";
    const cmdArgs = SPOTDL_HOST ? ["-m", "spotdl", ...args] : args;

    const proc = spawn(cmd, cmdArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    activeProcesses.set(jobId, proc);

    let stderr = "";

    proc.stdout?.on("data", (data: Buffer) => {
      console.log(`[spotdl] ${data.toString().trim()}`);
    });

    proc.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      activeProcesses.delete(jobId);

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
            id: generateId(),
            type: "song",
            file: `songs/${latestFile}`,
            title: name,
            duration: getAudioDuration(filePath),
            spotifyUrl: url,
            addedAt: new Date().toISOString(),
          };

          job.status = "done";
          job.result = track;
          job.completedAt = new Date().toISOString();
          console.log(`[spotdl] Download complete: ${track.title}`);
        } else {
          job.status = "error";
          job.error = "No file found after download";
        }
      } else {
        job.status = "error";
        job.error = stderr || `Exit code ${code}`;
        job.completedAt = new Date().toISOString();
        console.error(`[spotdl] Download failed: ${job.error}`);
      }

      resolve(job);
    });

    proc.on("error", (err) => {
      activeProcesses.delete(jobId);
      job.status = "error";
      job.error = err.message;
      job.completedAt = new Date().toISOString();
      console.error(`[spotdl] Process error: ${err.message}`);
      resolve(job);
    });
  });
}

export function getDownloadJob(id: string): DownloadJob | undefined {
  return downloads.get(id);
}

export function getAllDownloads(): DownloadJob[] {
  return Array.from(downloads.values());
}

export function cancelDownload(id: string): boolean {
  const proc = activeProcesses.get(id);
  if (proc) {
    proc.kill("SIGTERM");
    activeProcesses.delete(id);
    const job = downloads.get(id);
    if (job) {
      job.status = "error";
      job.error = "Cancelled by user";
      job.completedAt = new Date().toISOString();
    }
    return true;
  }
  return false;
}

export function clearDownloads(): void {
  for (const [id] of activeProcesses) {
    cancelDownload(id);
  }
  downloads.clear();
}
