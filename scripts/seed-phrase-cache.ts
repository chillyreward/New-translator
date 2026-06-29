/**
 * Seed phrase cache from HuggingFace dataset:
 * gateremark/kikuyu_conversations_synthetic_unreviewed
 *
 * Run:
 *   npx tsx scripts/seed-phrase-cache.ts
 *
 * Output:
 *   lib/phrase-cache.json  — loaded at startup by translationCache.ts
 */

import fs from "fs";
import path from "path";

const OUTPUT = path.join(__dirname, "..", "lib", "phrase-cache.json");
const HF_URL =
  "https://huggingface.co/datasets/gateremark/kikuyu_conversations_synthetic_unreviewed/resolve/main/data/train-00000-of-00001.parquet";
const HF_API =
  "https://datasets-server.huggingface.co/rows?dataset=gateremark%2Fkikuyu_conversations_synthetic_unreviewed&config=default&split=train&offset=0&limit=100";

interface Row {
  row: {
    english?: string;
    kikuyu?: string;
    en?: string;
    ki?: string;
    source?: string;
    target?: string;
    input?: string;
    output?: string;
    [key: string]: string | undefined;
  };
}

async function fetchRows(offset: number, limit: number): Promise<Row[]> {
  const url = `https://datasets-server.huggingface.co/rows?dataset=gateremark%2Fkikuyu_conversations_synthetic_unreviewed&config=default&split=train&offset=${offset}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HF API ${res.status}: ${await res.text()}`);
  const data = await res.json() as { rows: Row[]; num_rows_total: number };
  return data.rows;
}

function extractPair(row: Row["row"]): { en: string; ki: string } | null {
  // Try common field name patterns
  const en =
    row.english || row.en || row.source || row.input ||
    Object.values(row).find((v, i) => i === 0 && typeof v === "string") || "";
  const ki =
    row.kikuyu || row.ki || row.target || row.output ||
    Object.values(row).find((v, i) => i === 1 && typeof v === "string") || "";

  if (!en || !ki || en === ki) return null;
  return { en: en.trim(), ki: ki.trim() };
}

async function main() {
  console.log("Fetching dataset schema...");

  // First fetch to discover field names
  const sample = await fetchRows(0, 5);
  if (sample.length === 0) {
    console.error("No rows returned — dataset may be private or empty");
    process.exit(1);
  }

  console.log("Sample row fields:", Object.keys(sample[0].row));

  const cache: Record<string, string> = {};
  let offset = 0;
  const batchSize = 100;
  let total = 0;

  console.log("Downloading phrases...");

  while (true) {
    const rows = await fetchRows(offset, batchSize);
    if (rows.length === 0) break;

    for (const { row } of rows) {
      const pair = extractPair(row);
      if (pair) {
        // en→ki
        cache[`translate:en:${pair.en.toLowerCase()}`] = pair.ki;
        total++;
      }
    }

    offset += rows.length;
    process.stdout.write(`\r  ${offset} rows processed, ${total} pairs cached`);

    if (rows.length < batchSize) break;
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nSaving ${total} pairs to ${OUTPUT}...`);
  fs.writeFileSync(OUTPUT, JSON.stringify(cache, null, 2), "utf-8");
  console.log("Done! Run `npm run dev` to use the seeded cache.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
