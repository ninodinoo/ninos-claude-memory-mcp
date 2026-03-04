# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektbeschreibung

MCP Server der Context Rot in Claude Code bekämpft. Er legt in jedem Zielprojekt einen `.claude-memory/`-Ordner an und stellt 5 Tools bereit mit denen Claude Wissen persistiert, lädt und sucht. SessionStart Hook lädt automatisch den aktuellen Arbeitsstand.

## Commands

```bash
npm install          # Abhängigkeiten installieren
npm run build        # TypeScript kompilieren → dist/
npm run dev          # Watch-Mode (auto-recompile)
npm start            # Server starten (stdio)
```

## Architektur

```
src/
├── index.ts                  # MCP Server Bootstrap + Transport (v0.3.0)
├── hooks/
│   └── session-start.ts      # SessionStart Hook — lädt current-task + Topic-Liste
├── memory/
│   ├── store.ts              # Dateisystem-Abstraktion für .claude-memory/
│   ├── relevance.ts          # Scoring-Engine (Trigrams + Substring + Stoppwörter)
│   └── initializer.ts        # Auto-Init: Projekterkennung + Standard-Einträge
└── tools/
    ├── memory-tools.ts       # memory_load, memory_save (2 Tools)
    ├── session-tools.ts      # checkpoint, session_end (2 Tools)
    └── search-tools.ts       # memory_search (1 Tool)
```

## Tools (5 total)

| Tool | Beschreibung |
|------|-------------|
| `memory_load(topic?)` | Ohne Topic: Liste + Stats + Diff (24h). Mit Topic: Entry laden |
| `memory_save(topic, content, tags?, mode?)` | mode: "write" (default), "append", "delete". Auto-Init beim ersten Schreiben |
| `memory_search(query, maxResults?, mode?)` | mode: "search" (Volltext), "suggest" (Relevanz-Ranking für Aufgabe) |
| `checkpoint(summary, nextSteps?, blockers?)` | Arbeitsstand in current-task speichern |
| `session_end(accomplishments, decisions?, nextSession?)` | Session archivieren + alte Sessions auto-komprimieren |

## SessionStart Hook

Registriert in `.claude/settings.json` als `UserPromptSubmit` Hook. Gibt beim Start automatisch aus:
- Aktueller Arbeitsstand (current-task)
- Liste aller Memory-Topics

## Datenformat

Jeder Memory-Eintrag ist eine `.md`-Datei mit JSON-Metadaten-Header:
```
<!-- META:{"created":"...","updated":"...","accessCount":0,"tags":[]} -->

Inhalt hier...
```

**Index:** `.claude-memory/index.json` — Mapping `topic → tags[]`

**Topic-Pfade:** Slashes werden zu Unterordnern — `"entities/UserService"` → `.claude-memory/entities/UserService.md`

**Auto-Init:** Beim ersten `memory_save` wird `.claude-memory/` automatisch mit architecture, decisions und current-task initialisiert.

## In Claude Code einbinden (nach dem Build)

In `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "claude-memory": {
      "command": "node",
      "args": ["C:/Users/pnino/Documents/ClaudeWorkspace/projekte/claude-memory-mcp/dist/index.js"]
    }
  }
}
```

Der Server liest `process.cwd()` — er muss also aus dem Ziel-Projektordner heraus gestartet werden (Claude Code macht das automatisch).

## Empfohlene Nutzung in Zielprojekten (CLAUDE.md Snippet)

```markdown
## Memory-Plugin

- Session-Start: Hook lädt automatisch current-task + Topic-Liste
- Nach wichtigen Änderungen: `checkpoint` aufrufen
- Neue Entscheidungen: `memory_save("decisions", "...", [], "append")`
- Löschen: `memory_save("topic", "", [], "delete")`
- Session-Ende: `session_end` aufrufen
```
