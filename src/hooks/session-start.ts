#!/usr/bin/env node
import { readEntry, listTopics, memoryExists } from "../memory/store.js";

async function main(): Promise<void> {
  if (!(await memoryExists())) return;

  const output: string[] = [];

  // current-task laden
  const currentTask = await readEntry("current-task");
  if (currentTask && currentTask.content.trim()) {
    output.push("## Aktueller Arbeitsstand\n");
    output.push(currentTask.content.trim());
    output.push("");
  }

  // Topic-Liste
  const topics = await listTopics();
  if (topics.length > 0) {
    output.push(`## Memory-Topics (${topics.length})\n`);
    output.push(topics.map(t => `- ${t}`).join("\n"));
    output.push("");
  }

  if (output.length > 0) {
    console.log(output.join("\n"));
  }
}

main().catch(() => {
  // Fehler leise schlucken — Hook darf Claude-Start nicht blockieren
});
