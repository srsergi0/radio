import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import type { SystemConfig } from "./types";

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const CONFIG_PATH = `${DATA_DIR}/config.json`;

const DEFAULT_CONFIG: SystemConfig = {
  streamBitrate: 320,
  streamSampleRate: 44100,
  crossfadeDuration: 3,
  playlistReloadSeconds: 30,
};

function ensureDir(): void {
  const dir = dirname(CONFIG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadConfig(): SystemConfig {
  ensureDir();
  if (!existsSync(CONFIG_PATH)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }
  try {
    const data = readFileSync(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: SystemConfig): void {
  ensureDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function updateConfig(updates: Partial<SystemConfig>): SystemConfig {
  const config = loadConfig();
  Object.assign(config, updates);
  saveConfig(config);
  return config;
}
