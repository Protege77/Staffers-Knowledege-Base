# The Field Notes

GIS & Data Science community knowledge base, published as a static site.

**Live site:** https://protege77.github.io/Staffers-Knowledege-Base/

## Quick start

```bash
npm install
npx quartz build --serve
```

Open http://localhost:8080

## Where things live

| What | Location |
|------|----------|
| Published articles | `content/articles/` |
| Site pages (Home, Map, Graph, Ask, Submit) | `content/` |
| Quartz theme & layout | `quartz.config.ts`, `quartz.layout.ts`, `quartz/styles/` |
| Apps Script source (Ask + Submit pipeline) | `apps-script/Code.gs` |
| Project overview & workflows | [`PROJECT.md`](PROJECT.md) |

## Content workflow (Option A)

1. Draft and research in the local **Obsidian vault** (`../obsidian-vault/` when using the multi-root workspace).
2. When ready to publish, add or edit markdown under **`content/articles/`**.
3. Push to `main` — GitHub Actions builds and deploys the Quartz site.
4. Form submissions via Submit page are handled by the **Field Notes** Apps Script project (see `apps-script/README.md`).

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml` and publish to GitHub Pages.

## Repo name

The GitHub repo is still named `Staffers-Knowledege-Base` for URL stability. The public product name is **The Field Notes**.
