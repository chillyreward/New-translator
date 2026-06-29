/**
 * Translation cache — persisted to lib/phrase-cache.json.
 *
 * On startup: loads pre-seeded phrases from the HuggingFace dataset
 * (populated by: npx tsx scripts/seed-phrase-cache.ts)
 *
 * At runtime: new translations are added to the in-memory map only.
 * They survive for the lifetime of the Next.js server process.
 */

import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "lib", "phrase-cache.json");

// Load pre-seeded phrases from disk on first import
function loadSeedCache(): Map<string, string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf-8");
      const obj = JSON.parse(raw) as Record<string, string>;
      console.log(`[Cache] Loaded ${Object.keys(obj).length} pre-seeded phrases`);
      return new Map(Object.entries(obj));
    }
  } catch (e) {
    console.warn("[Cache] Could not load phrase-cache.json:", e);
  }
  return new Map();
}

const cache = loadSeedCache();

export function getCached(key: string): string | null {
  return cache.get(key.toLowerCase()) ?? null;
}

export function setCached(key: string, translation: string): void {
  cache.set(key.toLowerCase(), translation);
}

export function getCacheSize(): number {
  return cache.size;
}
