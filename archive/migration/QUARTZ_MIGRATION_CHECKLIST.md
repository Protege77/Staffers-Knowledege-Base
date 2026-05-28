# Quartz Migration Checklist (MkDocs -> Quartz)

**Status: Completed — May 2026**

MkDocs source (`docs/`), `mkdocs.yml`, and `.github/workflows/mkdocs.yml` have been removed.
Production deploy is `.github/workflows/deploy.yml` (Quartz → GitHub Pages).

## Done criteria (all met)

- [x] Visual parity accepted for Home and article pages
- [x] Functional parity for search, graph, tags, submit link, maps
- [x] URL/path behavior works under `/Staffers-Knowledege-Base/`
- [x] Quartz deploy workflow passes on main branch
- [x] Legacy MkDocs paths archived and removed

## Content source of truth

**`content/`** — all new and updated articles go under `content/articles/`.

## Rollback note

MkDocs rollback is no longer available in-repo. To rollback, restore `docs/` and `mkdocs.yml` from git history before the May 2026 cleanup commit.

See `MKDOCS_BASELINE_SNAPSHOT.md` for the pre-cutover reference.
