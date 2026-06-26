import { readdirSync, statSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { join, extname, basename } from "path";
import type { Track, LibraryStats } from "./types";

const MUSIC_DIR = process.env.MUSIC_DIR || "/app/music";
const SONGS_DIR = join(MUSIC_DIR, "songs");
const INTERLUDIOS_DIR = join(MUSIC_DIR, "interludios");

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|flac|m4a)$/i;

function ensureDirs(): void {
  if (!existsSync(SONGS_DIR)) mkdirSync(SONGS_DIR, { recursive: true });
  if (!existsSync(INTERLUDIOS_DIR)) mkdirSync(INTERLUDIOS_DIR, { recursive: true });
}

function scanDir(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => AUDIO_EXTENSIONS.test(f))
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}

function getAudioDuration(filePath: string): number {
  try {
    const stat = statSync(filePath);
    return Math.floor(stat.size / (192 * 1000 / 8));
  } catch {
    return 0;
  }
}

function generateId(): string {
  return `lib_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function initLibrary(): void {
  ensureDirs();
}

export function listSongs(): Track[] {
  ensureDirs();
  return scanDir(SONGS_DIR).map((filePath) => {
    const filename = basename(filePath);
    const name = filename.replace(/\.[^.]+$/, "");
    const stat = statSync(filePath);
    return {
      id: generateId(),
      type: "song" as const,
      file: `songs/${filename}`,
      title: name,
      duration: getAudioDuration(filePath),
      addedAt: stat.mtime.toISOString(),
    };
  });
}

export function listInterludios(): Track[] {
  ensureDirs();
  return scanDir(INTERLUDIOS_DIR).map((filePath) => {
    const filename = basename(filePath);
    const name = filename.replace(/\.[^.]+$/, "");
    const stat = statSync(filePath);
    return {
      id: generateId(),
      type: "interludio" as const,
      file: `interludios/${filename}`,
      title: name,
      duration: getAudioDuration(filePath),
      addedAt: stat.mtime.toISOString(),
    };
  });
}

export function getAllTracks(): Track[] {
  return [...listSongs(), ...listInterludios()];
}

export function getTrackByFile(file: string): Track | null {
  return getAllTracks().find((t) => t.file === file) || null;
}

export function deleteTrack(file: string): boolean {
  const fullPath = join(MUSIC_DIR, file);
  if (!existsSync(fullPath)) return false;
  try {
    unlinkSync(fullPath);
    return true;
  } catch {
    return false;
  }
}

export function getLibraryStats(): LibraryStats {
  const songs = listSongs();
  const interludios = listInterludios();
  let totalSize = 0;
  let totalDuration = 0;

  for (const track of [...songs, ...interludios]) {
    const fullPath = join(MUSIC_DIR, track.file);
    try {
      totalSize += statSync(fullPath).size;
    } catch {}
    totalDuration += track.duration;
  }

  return {
    totalSongs: songs.length,
    totalInterludios: interludios.length,
    totalSizeBytes: totalSize,
    totalDurationSeconds: totalDuration,
  };
}

export function getMusicDir(): string {
  return MUSIC_DIR;
}

export function getLocalPath(key: string): string {
  return join(MUSIC_DIR, key);
}

export function fileExists(key: string): boolean {
  try {
    statSync(join(MUSIC_DIR, key));
    return true;
  } catch {
    return false;
  }
}
