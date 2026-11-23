// One Emoji, One Smile: a single emoji, nothing else. The script reads
// emoji.txt, insists on exactly one emoji character (1-8 characters,
// no whitespace, no words), and writes it alone to /output/entry.txt.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MIN_CHARS = 1;
const MAX_CHARS = 8;
const SOURCE = join(import.meta.dirname, "emoji.txt");
const OUTPUT_NAME = "entry.txt";

function loadEmoji(): string {
  if (!existsSync(SOURCE)) {
    throw new Error("emoji.txt is missing next to main.ts");
  }
  const raw = readFileSync(SOURCE, "utf8");
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const kept = lines.filter((part) => part.trim().length > 0);
  if (kept.length === 0) {
    throw new Error("the entry must not be empty");
  }
  if (kept.length > 1) {
    throw new Error("the entry must be a single emoji");
  }
  return kept[0].trim();
}

function isBlank(ch: string): boolean {
  return ch.trim().length === 0;
}

function isPictographic(ch: string): boolean {
  return /\p{Extended_Pictographic}/u.test(ch);
}

function validateEmoji(entry: string): void {
  const points = Array.from(entry);
  if (points.length < MIN_CHARS || points.length > MAX_CHARS) {
    throw new Error(`entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${points.length}`);
  }
  let pictographic = 0;
  for (const ch of points) {
    if (isBlank(ch)) {
      throw new Error("the entry must be a single emoji, no spaces or words");
    }
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("the entry must not contain control characters");
    }
    if (isPictographic(ch)) pictographic += 1;
  }
  if (pictographic === 0) {
    throw new Error("the entry must be an emoji");
  }
}

function deliver(entry: string): string {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, OUTPUT_NAME);
  writeFileSync(path, entry, "utf8");
  return path;
}

function main(): void {
  const entry = loadEmoji();
  validateEmoji(entry);
  const path = deliver(entry);
  console.log(`wrote ${JSON.stringify(entry)} (${Array.from(entry).length} chars) to ${path}`);
}

main();
