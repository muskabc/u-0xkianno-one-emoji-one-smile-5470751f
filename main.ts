// One Emoji, One Smile: a single emoji, nothing else. The script reads
// emoji.txt, insists on exactly one emoji character (1-8 characters,
// no whitespace, no words), and writes it alone to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const raw = readFileSync(join(import.meta.dirname, "emoji.txt"), "utf8").trim();
const points = Array.from(raw);

if (points.length < 1 || points.length > 8) {
  throw new Error(`entry must be 1-8 characters, got ${points.length}`);
}
if (/\s/.test(raw)) {
  throw new Error("the entry must be a single emoji, no spaces or words");
}
if (!/\p{Extended_Pictographic}/u.test(raw)) {
  throw new Error("the entry must be an emoji");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), raw, "utf8");
console.log(`wrote ${JSON.stringify(raw)} to entry.txt`);
