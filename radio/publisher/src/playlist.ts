import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import type { Timeline, Track } from "./types";

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const TIMELINE_PATH = process.env.TIMELINE_PATH || `${DATA_DIR}/timeline.json`;

const DEFAULT_TIMELINE: Timeline = {
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  updatedAt: new Date().toISOString(),
};

function ensureDir(): void {
  const dir = dirname(TIMELINE_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadTimeline(): Timeline {
  ensureDir();
  if (!existsSync(TIMELINE_PATH)) {
    saveTimeline(DEFAULT_TIMELINE);
    return { ...DEFAULT_TIMELINE };
  }
  try {
    const data = readFileSync(TIMELINE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { ...DEFAULT_TIMELINE };
  }
}

export function saveTimeline(timeline: Timeline): void {
  ensureDir();
  timeline.updatedAt = new Date().toISOString();
  writeFileSync(TIMELINE_PATH, JSON.stringify(timeline, null, 2));
}

export function addTrack(track: Track): Timeline {
  const timeline = loadTimeline();
  timeline.tracks.push(track);
  saveTimeline(timeline);
  return timeline;
}

export function insertTrack(index: number, track: Track): Timeline {
  const timeline = loadTimeline();
  const safeIndex = Math.max(0, Math.min(index, timeline.tracks.length));
  timeline.tracks.splice(safeIndex, 0, track);
  saveTimeline(timeline);
  return timeline;
}

export function updateTrack(id: string, updates: Partial<Track>): Track | null {
  const timeline = loadTimeline();
  const track = timeline.tracks.find((t) => t.id === id);
  if (!track) return null;
  Object.assign(track, updates, { id: track.id, file: track.file });
  saveTimeline(timeline);
  return track;
}

export function removeTrack(id: string): Timeline {
  const timeline = loadTimeline();
  const index = timeline.tracks.findIndex((t) => t.id === id);
  if (index !== -1) {
    timeline.tracks.splice(index, 1);
    if (timeline.currentIndex >= timeline.tracks.length) {
      timeline.currentIndex = Math.max(0, timeline.tracks.length - 1);
    } else if (index < timeline.currentIndex) {
      timeline.currentIndex--;
    }
  }
  saveTimeline(timeline);
  return timeline;
}

export function reorderTracks(fromIndex: number, toIndex: number): Timeline {
  const timeline = loadTimeline();
  if (fromIndex < 0 || fromIndex >= timeline.tracks.length) return timeline;
  if (toIndex < 0 || toIndex >= timeline.tracks.length) return timeline;

  const [moved] = timeline.tracks.splice(fromIndex, 1);
  timeline.tracks.splice(toIndex, 0, moved);

  if (timeline.currentIndex === fromIndex) {
    timeline.currentIndex = toIndex;
  } else if (fromIndex < timeline.currentIndex && toIndex >= timeline.currentIndex) {
    timeline.currentIndex--;
  } else if (fromIndex > timeline.currentIndex && toIndex <= timeline.currentIndex) {
    timeline.currentIndex++;
  }

  saveTimeline(timeline);
  return timeline;
}

export function setCurrentIndex(index: number): Timeline {
  const timeline = loadTimeline();
  if (index >= 0 && index < timeline.tracks.length) {
    timeline.currentIndex = index;
  }
  saveTimeline(timeline);
  return timeline;
}

export function clearTimeline(): Timeline {
  const timeline: Timeline = {
    tracks: [],
    currentIndex: 0,
    isPlaying: false,
    updatedAt: new Date().toISOString(),
  };
  saveTimeline(timeline);
  return timeline;
}

export function getCurrentTrack(): Track | null {
  const timeline = loadTimeline();
  if (timeline.tracks.length === 0) return null;
  return timeline.tracks[timeline.currentIndex] || null;
}

export function getTrackById(id: string): Track | null {
  const timeline = loadTimeline();
  return timeline.tracks.find((t) => t.id === id) || null;
}

export function nextTrack(): Track | null {
  const timeline = loadTimeline();
  if (timeline.tracks.length === 0) return null;
  timeline.currentIndex = (timeline.currentIndex + 1) % timeline.tracks.length;
  saveTimeline(timeline);
  return timeline.tracks[timeline.currentIndex];
}
