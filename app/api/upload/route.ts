import { writeFile, mkdir, appendFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file       = formData.get("file")       as File;
  const transcript = formData.get("transcript") as string;
  const english    = formData.get("english")    as string;

  if (!file) return new Response("No file", { status: 400 });

  const bytes    = await file.arrayBuffer();
  const buffer   = Buffer.from(bytes);
  const audioDir = path.join(process.cwd(), "dataset", "audio");

  // Ensure directory exists
  if (!existsSync(audioDir)) await mkdir(audioDir, { recursive: true });

  const filename  = `${Date.now()}.wav`;
  const filepath  = path.join(audioDir, filename);
  await writeFile(filepath, buffer);

  // Append to metadata.csv
  const metaPath = path.join(process.cwd(), "dataset", "metadata.csv");
  const line     = `audio/${filename}|${transcript}|${english}\n`;
  await appendFile(metaPath, line);

  return new Response(JSON.stringify({ saved: filename, transcript }), {
    headers: { "Content-Type": "application/json" },
  });
}
