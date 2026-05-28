# MkDocs Baseline Snapshot

Captured on: 2026-05-27

Purpose: define expected behavior and appearance before Quartz cutover.

## Deployment Baseline

- Live URL: `https://protege77.github.io/Staffers-Knowledege-Base/`
- Deployment workflow: `.github/workflows/mkdocs.yml`
- Build system: MkDocs Material via `mkdocs.yml`

## Information Architecture Baseline

Primary nav entries:

1. Home
2. Articles
3. Graph
4. Ask Claude
5. Tags
6. Submit

## Homepage Baseline

- Title: "The Field Notes"
- Intro paragraph present
- Left stats cards:
  - 16 Articles
  - 71 Tags
  - 50 Topics
  - 4 Categories
- Main panel:
  - "Knowledge Graph" section
  - interactive D3 graph
  - "View Full Graph" action

## Styling Baseline

- Warm editorial palette (cream/teal/coral/brown)
- Heading font: Playfair Display
- Body font: Lato
- Dark mode toggle present and functional

## Content Baseline

- Article pages under `docs/articles/`
- Dedicated pages:
  - `docs/graph.md`
  - `docs/tags.md`
  - `docs/submit.md`
  - `docs/ask.md`

## Known Current Warnings (MkDocs Local Serve)

- Tags plugin setting `tags_file` is deprecated.
- Favicon path points to `assets/favicon.png` but file is currently missing.
- Some docs files exist but are not listed in `nav`.

