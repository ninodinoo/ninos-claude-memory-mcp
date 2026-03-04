#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

async function main(): Promise<void> {
  const memoryRoot = path.join(process.cwd(), ".claude-memory");

  // Prüfe ob .claude-memory existiert
  try {
    await fs.access(memoryRoot);
  } catch {
    return;
  }

  const output: string[] = [];

  // current-task laden
  try {
    const raw = await fs.readFile(path.join(memoryRoot, "current-task.md"), "utf-8");
    // META-Header entfernen
    const content = raw.replace(/^<!-- META:.+? -->\n\n?/, "");
    if (content.trim()) {
      output.push("## Aktueller Arbeitsstand\n");
      output.push(content.trim());
      output.push("");
    }
  } catch {
    // Kein current-task
  }

  // Topic-Liste aus index.json
  try {
    const raw = await fs.readFile(path.join(memoryRoot, "index.json"), "utf-8");
    const index = JSON.parse(raw) as Record<string, string[]>;
    const topics = Object.keys(index);
    if (topics.length > 0) {
      output.push(`## Memory-Topics (${topics.length})\n`);
      output.push(topics.map(t => `- ${t}`).join("\n"));
      output.push("");
    }
  } catch {
    // Kein index.json
  }

  if (output.length > 0) {
    console.log(output.join("\n"));
  }
}

main().catch(() => {
  // Fehler leise schlucken — Hook darf Claude-Start nicht blockieren
});
