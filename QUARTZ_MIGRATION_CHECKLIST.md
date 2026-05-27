# Quartz Migration Checklist (MkDocs -> Quartz)

This checklist is tailored to the current state of this repository:

- Live site is deployed from `mkdocs.yml` + `.github/workflows/mkdocs.yml`
- Quartz config exists in `quartz.config.ts` and `quartz.layout.ts`
- Content exists in both `docs/` (MkDocs source) and `content/` (Quartz source)

Use this as the single source of truth for migration work.

## 0) Safety Rules

- Keep MkDocs deployment active until Quartz parity is confirmed.
- Make all migration changes on a dedicated branch.
- Do not remove MkDocs files/workflows until at least 1 week after cutover.

## 1) Create Migration Branch

```bash
git checkout -b chore/quartz-migration
```

## 2) Baseline Snapshot (Current MkDocs)

Capture what must remain true after migration:

- Top nav pages: Home, Articles, Graph, Ask Claude, Tags, Submit
- Branding: "The Field Notes" tone and warm cream/teal/coral palette
- Homepage sections:
  - intro text
  - 4 stat cards
  - D3 knowledge graph block
- Key URLs currently in use:
  - `/Staffers-Knowledege-Base/`
  - `/Staffers-Knowledege-Base/articles/...`
  - `/Staffers-Knowledege-Base/graph/`
  - `/Staffers-Knowledege-Base/submit/`

## 3) Content Source of Truth

Pick one source of truth for content edits during migration:

- Preferred for Quartz: `content/`

Action:

- Freeze edits in `docs/` except urgent production fixes.
- Add all new/updated articles under `content/articles/`.

## 4) Quartz Branding and IA Alignment

Align Quartz text and structure to match current live branding:

- In `quartz.config.ts`
  - set page title to "The Field Notes"
  - keep `baseUrl` as `protege77.github.io/Staffers-Knowledege-Base`
- In `content/index.md`
  - ensure homepage headline/copy match desired public wording
- In `quartz.layout.ts`
  - confirm header/footer links map to Home/Articles/Graph/Tags/Submit paths

## 5) Feature Parity Validation (Local)

Run Quartz local preview:

```bash
npm install
npx quartz build --serve
```

Validation checklist:

- Home renders with expected theme and readability.
- Article pages render frontmatter, tags, and metadata.
- Graph page is reachable and usable.
- Search works across current article set.
- Dark mode toggles correctly.
- Mobile layout remains usable.

## 6) URL and SEO Checks

Before cutover, validate:

- No broken internal links from homepage and article pages.
- Canonical/base URL is correct for GitHub Pages subpath.
- Sitemap and RSS generate correctly from Quartz build output.

Suggested checks:

```bash
npx quartz build
```

Then inspect generated output under `public/` for:

- `sitemap.xml`
- `index.xml` (RSS)
- expected article paths

## 7) CI/CD Cutover Plan

Current production deploy workflow: `.github/workflows/mkdocs.yml`

Cutover steps:

1. Keep `mkdocs.yml` workflow file as rollback path.
2. Enable or update Quartz deploy workflow to publish `public/`.
3. Trigger manual run and verify Pages output URL.
4. Smoke test live pages (Home, 3 articles, Graph, Tags, Submit).

## 8) Rollback Plan

If Quartz production has regression:

1. Re-enable MkDocs deploy workflow as primary.
2. Re-run Pages deploy from latest good MkDocs commit.
3. Open follow-up fix PR for Quartz before next cutover attempt.

## 9) Done Criteria (Cutover Gate)

Do not switch production until all are true:

- [ ] Visual parity accepted for Home and article pages
- [ ] Functional parity accepted for search, graph, tags, submit link
- [ ] URL/path behavior works under `/Staffers-Knowledege-Base/`
- [ ] No major broken links in nav and content pages
- [ ] Quartz deploy workflow passes on main branch
- [ ] Rollback steps tested at least once

## 10) Post-Cutover (Week 1)

- Monitor for 404s and broken links daily.
- Keep MkDocs source/workflow in repo for at least 7 days.
- After stability period, archive or remove legacy MkDocs paths in a separate cleanup PR.

