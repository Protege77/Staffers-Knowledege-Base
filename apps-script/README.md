# Google Apps Script backend (Ask + Submit)

The live site uses two separate Apps Script web app deployments:

| Feature | URL suffix (deployment ID) |
|---------|----------------------------|
| Ask | `...AKfycbyuAxU3vIu89wXtEo6c0oO60StgSbHIBNJfy47riDfTMDURQTjZ4oj-nedkBMr3izNe/exec` |
| Submit | `...AKfycbw3_FE2AVyP-dQIzkJ5w5ysVWFG-O36cMxveGQ5Jgdc1LdWqxaOVs3MrlDloUoWc13uZA/exec` |

The script source lives in [`apps-script/Code.gs`](Code.gs). Copy it into the **[Field Notes](https://script.google.com/d/1ISnE85xVIY49zFVPkA1XgzP9w-WkEasbY7Me99Cnfi0tezqi8wpb9KEU/edit)** Apps Script project, then redeploy.

## Article source (GitHub)

`getAllArticles()`, `getArticleBySlug()`, and `askKnowledgeBase()` read published articles from **`content/articles/`** on GitHub (`Protege77/Staffers-Knowledege-Base`). This matches the Quartz site content folder.

New form submissions are still backed up to Google Drive (`saveToDrive`). When `GITHUB_TOKEN` is set, `syncToGitHub()` pushes to the Quartz site:

| Step | GitHub path |
|------|-------------|
| Article markdown | `content/articles/{slug}.md` |
| Knowledge graph nodes + links | `quartz/static/graph-data.json` |
| Home page stat counts | `content/index.md` (requires Quartz home page with stat cards on `main`) |

The graph sync **creates** `graph-data.json` if it is missing, bootstrapping from all files in `content/articles/`.

Legacy MkDocs paths (`docs/articles/`, `mkdocs.yml`) are no longer updated by the pipeline.

Optional Script properties:

| Property | Purpose |
|----------|---------|
| `CLAUDE_API_KEY` | Required for Ask and Submit classification |
| `GITHUB_TOKEN` | Recommended for GitHub API rate limits; required for `syncToGitHub` writes |

Public repo reads work without a token but may hit rate limits when loading 16+ files.

## Deploy updated Code.gs

1. Open [Field Notes](https://script.google.com/d/1ISnE85xVIY49zFVPkA1XgzP9w-WkEasbY7Me99Cnfi0tezqi8wpb9KEU/edit)
2. Replace `Code.gs` with the contents of `apps-script/Code.gs` from this repo
3. Run **`testListArticles`** — expect ~16 articles in Executions log
4. Run **`testAsk`** — expect a Claude answer (requires `CLAUDE_API_KEY`)
5. **Deploy → Manage deployments → Edit → New version → Deploy** (Execute as: Me, Anyone)

## Current status

The Ask page calls the web app with **GET** (`?action=ask&question=...`). Browser `POST` requests to Apps Script often follow a redirect and receive HTML instead of JSON, which forced a fallback to local keyword search.

After updating `Code.gs`, redeploy the Ask web app. Answers should show as **"Claude's answer"** when the backend returns JSON.

## Expected Ask API contract

**Request** (GET, preferred for browser clients):

```
GET .../exec?action=ask&question=<url-encoded question>
```

**Request** (POST, still supported for curl/scripts):

```
action=ask
question=<user question>
```

**Response** (JSON, `ContentService.MimeType.JSON`):

```json
{ "success": true, "answer": "..." }
```

or on failure:

```json
{ "success": false, "message": "..." }
```

The client is in `quartz/components/scripts/ask-knowledge-base.inline.ts`.

## Redeploy checklist

1. Open the **[Field Notes](https://script.google.com/d/1ISnE85xVIY49zFVPkA1XgzP9w-WkEasbY7Me99Cnfi0tezqi8wpb9KEU/edit)** project in Google Apps Script (same Google account that owns the deployment).
2. Confirm `doPost` handles `action === "ask"` and calls `askKnowledgeBase(question)`.
3. Ensure the handler returns JSON, for example:

   ```javascript
   return ContentService.createTextOutput(JSON.stringify({ success: true, answer }))
     .setMimeType(ContentService.MimeType.JSON);
   ```

4. If using Claude, set **Script properties** → `CLAUDE_API_KEY` (Project settings → Script properties). Get the key from [console.anthropic.com](https://console.anthropic.com).
5. **Deploy** → **Manage deployments** → edit the Ask web app → **New version** → Deploy.
6. Execute as: **Me**. Who has access: **Anyone** (required for public site CORS).
7. Test:

   ```bash
   curl -s "https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?action=ask&question=What%20GIS%20tools%20are%20used%20in%20military%20operations%3F"
   ```

   You should get JSON, not HTML or a redirect error page.

## Submit pipeline

- Accepts article submissions from the form
- Classifies content with Claude (`classifyWithClaude`)
- Saves to Drive and syncs to GitHub (`syncToGitHub`)

That flow still depends on the same script project and valid API keys / GitHub token in script properties. The Submit page (`content/submit.md`) has not yet been migrated to the Quartz SPA loader pattern used on Ask.

## Local alternative (no GAS)

Quartz builds a full article index at build time. Ask uses keyword search over titles, tags, and article bodies when Apps Script is unavailable. No API keys required; answers are summaries from matching articles, not generative AI.
