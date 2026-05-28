# The Field Notes — Project Map

Single reference for how the pieces fit together.

## System overview

```
WhatsApp / Submit form
        │
        ▼
Google Apps Script (Field Notes pipeline)
        │  Claude API · GitHub API · Drive backup
        ▼
GitHub repo (this project)
  content/articles/  ──►  Quartz build  ──►  GitHub Pages (live site)
  quartz/static/graph-data.json
        ▲
        │
Obsidian vault (local drafts only — Option A)
```

## Components

| Component | Role | Location |
|-----------|------|----------|
| **Quartz site** | Public knowledge base | This repo; deploy via GitHub Actions |
| **Apps Script** | Submit pipeline, Ask API, GitHub sync | [Field Notes script](https://script.google.com/d/1ISnE85xVIY49zFVPkA1XgzP9w-WkEasbY7Me99Cnfi0tezqi8wpb9KEU/edit) · source in `apps-script/` |
| **Obsidian vault** | Local drafts & research (not auto-synced) | `../obsidian-vault/` (sibling folder in workspace) |
| **GitHub Pages** | Hosting | https://protege77.github.io/Staffers-Knowledege-Base/ |

## Content source of truth

**`content/`** is the only published content tree.

- New articles: `content/articles/{slug}.md`
- Do not edit legacy MkDocs paths — removed in May 2026 (see `archive/migration/`).

## Local development

Open the multi-root workspace at:

`Documents/Cursor/Projects/Field Notes/field-notes.code-workspace`

```bash
cd field-notes
npm install
npx quartz build --serve
```

## Deploy & secrets

| Trigger | Result |
|---------|--------|
| Push to `main` | Quartz build → GitHub Pages |

Secrets live outside the repo:

| Secret | Where |
|--------|-------|
| `CLAUDE_API_KEY` | Apps Script → Project settings → Script properties |
| `GITHUB_TOKEN` | Apps Script script properties (for `syncToGitHub`) |

## Publishing workflows

### Manual (Option A)

1. Write or refine notes in Obsidian.
2. Copy or adapt into `content/articles/`.
3. Commit and push to `main`.

### Submit form (automated)

1. User submits URL via Submit page.
2. Apps Script classifies, drafts markdown, backs up to Drive.
3. If `GITHUB_TOKEN` is set, pushes to `content/articles/` and updates graph data.

See [`apps-script/README.md`](apps-script/README.md) for deploy steps.

## Migration status

Quartz cutover completed May 2026. MkDocs source and deploy workflow removed; baseline docs kept in `archive/migration/`.
