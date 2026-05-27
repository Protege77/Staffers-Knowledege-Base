// ============================================================
// THE FIELD NOTES — GOOGLE APPS SCRIPT + GITHUB
// WhatsApp Group → Google Form → Claude API → GitHub + Drive
// Served as a web app via Apps Script doGet / doPost
// ============================================================
//
// SETUP:
//  1. Paste this file into the Field Notes Apps Script project
//  2. Add Index.html and Article.html if you still use the legacy web UI
//  3. Script Properties: CLAUDE_API_KEY (required), GITHUB_TOKEN (optional, higher rate limits)
//  4. Run setupDriveFolder() once if you use the form submit → Drive backup path
//  5. Run testListArticles() to verify GitHub reads from content/articles/
//  6. Deploy → Manage deployments → Web app → New version
//     - Execute as: Me
//     - Who has access: Anyone
//  7. Attach onFormSubmit to your Google Form via Triggers
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {

  // Drive folder still used when saving new submissions from the form pipeline
  DRIVE_FOLDER_NAME: 'FILO Knowledge Bank Articles',

  // Quartz site paths
  ARTICLES_GITHUB_PATH: 'content/articles',
  GRAPH_DATA_PATH: 'quartz/static/graph-data.json',
  HOME_INDEX_PATH: 'content/index.md',

  // Must match the exact field labels in your Google Form
  FORM_FIELD_URL:       'Article URL',
  FORM_FIELD_SUBMITTER: 'Your Name',
  FORM_FIELD_NOTES:     'Notes (optional)',

  CLAUDE_MODEL: 'claude-haiku-4-5-20251001',

  SITE_TITLE: 'The Field Notes',

  ALERT_EMAIL: '',
};

/** Read at call time — not from CONFIG — so web app picks up Script property changes. */
function getClaudeApiKey() {
  return PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY') || '';
}


// ============================================================
// ONE-TIME SETUP
// ============================================================
function setupDriveFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    Logger.log('Folder already exists: ' + folders.next().getUrl());
    return;
  }
  const folder = DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
  Logger.log('Created folder: ' + folder.getUrl());
  Logger.log('Folder ID: ' + folder.getId());
}


// ============================================================
// MAIN TRIGGER
// ============================================================
function onFormSubmit(e) {
  let url       = '';
  let submitter = 'Anonymous';
  let userNotes = '';

  try {
    if (e.namedValues) {
      url       = (e.namedValues[CONFIG.FORM_FIELD_URL]      || [''])[0].trim();
      submitter = (e.namedValues[CONFIG.FORM_FIELD_SUBMITTER] || ['Anonymous'])[0].trim();
      userNotes = (e.namedValues[CONFIG.FORM_FIELD_NOTES]     || [''])[0].trim();
    } else if (e.response) {
      const items = e.response.getItemResponses();
      for (const item of items) {
        const title = item.getItem().getTitle();
        const value = item.getResponse();
        if (title === CONFIG.FORM_FIELD_URL)       url       = value;
        if (title === CONFIG.FORM_FIELD_SUBMITTER)  submitter = value;
        if (title === CONFIG.FORM_FIELD_NOTES)      userNotes = value;
      }
      url       = (url || '').trim();
      submitter = (submitter || 'Anonymous').trim();
      userNotes = (userNotes || '').trim();
    }

    if (!url) {
      log('Submission skipped — no URL found.');
      return;
    }

    log('Processing: ' + url);

    const article        = fetchArticleContent(url);
    const classification = classifyWithClaude(url, article);
    const markdown       = buildMarkdown(url, submitter, userNotes, classification);
    const filePath       = saveToDrive(classification.title, markdown);
    const slug           = today() + '-' + slugify(classification.title);

    log('✓ Done → ' + filePath);
    syncToGitHub(slug, markdown, classification, today());

  } catch (err) {
    log('✗ Error: ' + err.message);
    if (CONFIG.ALERT_EMAIL) {
      MailApp.sendEmail(
        CONFIG.ALERT_EMAIL,
        '⚠️ Field Notes Pipeline Error',
        'URL: ' + url + '\n\nError: ' + err.message + '\n\nStack: ' + err.stack
      );
    }
  }
}


// ============================================================
// WEB APP ENTRY POINT
// ============================================================
function doGet(e) {
  const page = (e.parameter.page || 'home');
  const slug = (e.parameter.slug || '');
  const tag  = (e.parameter.tag  || '');
  const q    = (e.parameter.q    || '');

  try {
    if (page === 'article' && slug) {
      return serveArticle(slug);
    }
    return serveHome(tag, q);
  } catch (err) {
    return serveError(err.message);
  }
}


// ============================================================
// WEB APP — API ENDPOINT (form submissions + Q&A)
// ============================================================
function doPost(e) {
  const action = (e.parameter.action || '').trim();

  try {
    if (action === 'ask') {
      const question = (e.parameter.question || '').trim();
      if (!question) return respond(false, 'No question provided');
      const answer = askKnowledgeBase(question);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, answer: answer }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const url       = (e.parameter.url       || '').trim();
    const submitter = (e.parameter.submitter  || 'Anonymous').trim();
    const notes     = (e.parameter.notes      || '').trim();

    if (!url) return respond(false, 'No URL provided');

    const article        = fetchArticleContent(url);
    const classification = classifyWithClaude(url, article);
    const markdown       = buildMarkdown(url, submitter, notes, classification);
    const filePath       = saveToDrive(classification.title, markdown);
    const slug           = today() + '-' + slugify(classification.title);

    syncToGitHub(slug, markdown, classification, today());
    return respond(true, classification.title);
  } catch (err) {
    return respond(false, err.message);
  }
}


// ============================================================
// ASK THE KNOWLEDGE BASE
// ============================================================
function askKnowledgeBase(question) {
  const articles = getAllArticles();

  const context = articles.map(function(a) {
    const tags = (a.tags || []).join(', ');
    return '## ' + a.title + '\n'
      + (a.category ? 'Category: ' + a.category + '\n' : '')
      + (tags ? 'Tags: ' + tags + '\n' : '')
      + (a.summary ? a.summary : '')
      + '\n';
  }).join('\n---\n');

  const prompt = 'You are an assistant for "The Field Notes", a GIS and Data Science community knowledge base.\n\n'
    + 'Below are summaries of articles in the knowledge base. Use them to answer the member\'s question as helpfully as possible. '
    + 'If the answer isn\'t covered by the articles, say so honestly and suggest what they might search for instead.\n\n'
    + 'Keep your answer concise — 2 to 4 sentences unless the question needs more detail. '
    + 'If relevant, mention which article(s) the information comes from.\n\n'
    + 'KNOWLEDGE BASE ARTICLES:\n'
    + context + '\n\n'
    + 'MEMBER QUESTION: ' + question;

  const payload = {
    model: CONFIG.CLAUDE_MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }]
  };

  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getClaudeApiKey(),
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Claude API error: ' + response.getResponseCode());
  }

  return JSON.parse(response.getContentText()).content[0].text.trim();
}

function respond(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// PAGE SERVERS
// ============================================================
function serveHome(filterTag, searchQuery) {
  let articles = getAllArticles();

  if (filterTag) {
    articles = articles.filter(function(a) {
      return (a.tags || []).some(function(t) {
        return t.toLowerCase() === filterTag.toLowerCase();
      });
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    articles = articles.filter(function(a) {
      return (a.title  || '').toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q) ||
        (a.tags || []).some(function(t) { return t.toLowerCase().includes(q); });
    });
  }

  const allTags = getAllTags();

  const template = HtmlService.createTemplateFromFile('Index');
  template.siteTitle   = CONFIG.SITE_TITLE;
  template.articles    = articles;
  template.allTags     = allTags;
  template.filterTag   = filterTag;
  template.searchQuery = searchQuery;

  return template.evaluate()
    .setTitle(CONFIG.SITE_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function serveArticle(slug) {
  const article = getArticleBySlug(slug);
  if (!article) {
    return serveError('Article not found: ' + slug);
  }

  const template = HtmlService.createTemplateFromFile('Article');
  template.siteTitle = CONFIG.SITE_TITLE;
  template.article   = article;
  template.bodyHtml  = markdownToHtml(article.body);

  return template.evaluate()
    .setTitle(article.title + ' — ' + CONFIG.SITE_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

function serveError(message) {
  const html = '<html><body style="font-family:sans-serif;padding:2rem">'
    + '<h2>Something went wrong</h2><p>' + escapeHtml(message) + '</p>'
    + '<a href="' + getBaseUrl() + '">← Back to home</a>'
    + '</body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Error — ' + CONFIG.SITE_TITLE);
}


// ============================================================
// ARTICLE STORAGE — READ FROM GITHUB, WRITE BACKUP TO DRIVE
// ============================================================

function saveToDrive(title, content) {
  const folder   = getDriveFolder();
  const filename = today() + '-' + slugify(title) + '.md';

  const existing = folder.getFilesByName(filename);
  if (existing.hasNext()) {
    const file = existing.next();
    file.setContent(content);
    log('Updated existing file: ' + filename);
    return filename;
  }

  folder.createFile(filename, content, MimeType.PLAIN_TEXT);
  log('Created: ' + filename);
  return filename;
}

/**
 * Load all published articles from GitHub content/articles/.
 */
function getAllArticles() {
  const paths = githubListDirectory(CONFIG.ARTICLES_GITHUB_PATH);
  const articles = [];

  for (var i = 0; i < paths.length; i++) {
    const filePath = paths[i];
    const name = filePath.split('/').pop();
    try {
      const file = githubGetFile(filePath);
      if (!file) continue;
      articles.push(parseMarkdownFile(file.content, name));
    } catch (e) {
      log('Warning: could not parse ' + name + ' — ' + e.message);
    }
  }

  articles.sort(function(a, b) {
    return (b.date || '').localeCompare(a.date || '');
  });

  log('Loaded ' + articles.length + ' articles from GitHub/' + CONFIG.ARTICLES_GITHUB_PATH);
  return articles;
}

/**
 * Load a single article by slug (filename without .md).
 */
function getArticleBySlug(slug) {
  const filePath = CONFIG.ARTICLES_GITHUB_PATH + '/' + slug + '.md';
  const file = githubGetFile(filePath);
  if (!file) return null;
  return parseMarkdownFile(file.content, slug + '.md');
}

function getAllTags() {
  const articles = getAllArticles();
  const tagSet   = {};
  for (var i = 0; i < articles.length; i++) {
    const a = articles[i];
    for (var j = 0; j < (a.tags || []).length; j++) {
      const t = a.tags[j];
      tagSet[t] = (tagSet[t] || 0) + 1;
    }
  }
  return Object.entries(tagSet)
    .sort(function(a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); })
    .map(function(entry) { return { tag: entry[0], count: entry[1] }; });
}

function getDriveFolder() {
  const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
}


// ============================================================
// MARKDOWN PARSER
// ============================================================

function extractSummaryFromBody(body) {
  const match = (body || '').match(/## Summary\s*\r?\n+([\s\S]*?)(?:\r?\n## |\s*$)/);
  return match ? match[1].trim() : '';
}

function parseMarkdownFile(content, filename) {
  const slug = (filename || '').replace(/\.md$/, '');

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fmMatch) {
    return { slug: slug, title: slug, body: content, tags: [], related_topics: [], summary: '' };
  }

  const fm   = parseYaml(fmMatch[1]);
  const body = (fmMatch[2] || '').trim();

  return {
    slug:           slug,
    title:          fm.title          || slug,
    url:            fm.url            || '',
    date:           fm.date           || '',
    submitted_by:   fm.submitted_by   || '',
    category:       fm.category       || '',
    tags:           parseTags(fm.tags),
    summary:        fm.summary        || extractSummaryFromBody(body) || '',
    related_topics: parseList(fm.related_topics),
    body:           body,
  };
}

function parseYaml(yaml) {
  const result = {};
  const lines  = yaml.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const listKeyMatch = line.match(/^(\w[\w_]*):\s*$/);
    if (listKeyMatch) {
      const key   = listKeyMatch[1];
      const items = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s+-\s/)) {
        items.push(lines[i].replace(/^\s+-\s+/, '').trim());
        i++;
      }
      result[key] = items;
      continue;
    }

    const kvMatch = line.match(/^(\w[\w_]*):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1];
      let val   = kvMatch[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).replace(/\\"/g, '"');
      }
      result[key] = val;
    }
    i++;
  }

  return result;
}

function parseTags(val) {
  if (Array.isArray(val)) return val.map(function(t) { return String(t).trim(); }).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
  return [];
}

function parseList(val) {
  if (Array.isArray(val)) return val.map(function(t) { return String(t).trim(); }).filter(Boolean);
  return [];
}


// ============================================================
// MARKDOWN → HTML
// ============================================================
function markdownToHtml(md) {
  if (!md) return '';

  let html = md;

  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,         '<em>$1</em>');
  html = html.replace(/\[\[([^\]]+)\]\]/g, '<span class="wikilink">$1</span>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>');

  html = html.replace(/(^- .+$(\n^- .+$)*)/gm, function(block) {
    const items = block.split('\n').map(function(l) { return '<li>' + l.replace(/^- /, '') + '</li>'; }).join('');
    return '<ul>' + items + '</ul>';
  });

  const blocks = html.split(/\n{2,}/);
  html = blocks.map(function(block) {
    block = block.trim();
    if (!block) return '';
    if (block.match(/^<(h[1-6]|ul|ol|li|hr|blockquote|div|p)/)) return block;
    if (block.match(/<\/(h[1-6]|ul|ol|li|hr)>$/)) return block;
    return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  return html;
}


// ============================================================
// URL HELPER
// ============================================================
function getBaseUrl() {
  return ScriptApp.getService().getUrl();
}

function getArticleUrl(slug) {
  return getBaseUrl() + '?page=article&slug=' + encodeURIComponent(slug);
}

function getTagUrl(tag) {
  return getBaseUrl() + '?tag=' + encodeURIComponent(tag);
}


// ============================================================
// FETCH ARTICLE CONTENT (for new submissions)
// ============================================================
function fetchArticleContent(url) {
  let title = '';
  let text  = '';

  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FieldNotesBot/1.0)' }
    });

    if (response.getResponseCode() !== 200) {
      log('Warning: HTTP ' + response.getResponseCode() + ' fetching article — continuing with URL only.');
      return { title: '', text: '' };
    }

    let html = response.getContentText();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) title = titleMatch[1].replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();

    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '');

    text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 4000) text = text.substring(0, 4000) + '…';

  } catch (err) {
    log('Warning: Could not fetch article content — ' + err.message);
  }

  return { title: title, text: text };
}


// ============================================================
// CLASSIFY WITH CLAUDE
// ============================================================
function getExistingCategories() {
  try {
    const articles = getAllArticles();
    const cats = new Set();
    articles.forEach(function(a) {
      if (a.category) cats.add(a.category);
    });
    return [...cats].sort();
  } catch (err) {
    log('Warning: could not read existing categories — ' + err.message);
    return [];
  }
}

function classifyWithClaude(url, article) {
  const existingCats = getExistingCategories();
  const catSeedLine  = existingCats.length > 0
    ? 'Categories already in use (reuse one if it fits): ' + existingCats.join(', ') + '.'
    : 'No categories exist yet — create the first appropriate one.';

  const prompt = 'You are a knowledge-base curator for a GIS and Data Science professional community.\n\n'
    + 'Analyse the article below and return a JSON object with EXACTLY these fields:\n'
    + '- "title": clean article title (fix any HTML entities, remove site name suffix)\n'
    + '- "category": a short Title Case label (1–3 words) that best describes this article\'s topic. '
    + catSeedLine + ' Only create a new category if none of the existing ones is a good fit — prefer consistency over novelty.\n'
    + '- "tags": array of 3–6 lowercase tags, use hyphens for multi-word tags (e.g. "remote-sensing")\n'
    + '- "summary": exactly 2 sentences summarising the key points\n'
    + '- "related_topics": array of 2–4 topic names that Obsidian wikilinks should point to (Title Case)\n\n'
    + 'Article URL: ' + url + '\n'
    + 'Page title: ' + (article.title || '(unavailable)') + '\n'
    + 'Content excerpt:\n'
    + (article.text || '(content unavailable — classify from URL and title only)') + '\n\n'
    + 'Return ONLY a valid JSON object. No markdown fences, no explanation, no trailing text.';

  const payload = {
    model: CONFIG.CLAUDE_MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }]
  };

  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getClaudeApiKey(),
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Claude API error ' + response.getResponseCode() + ': ' + response.getContentText());
  }

  const raw = JSON.parse(response.getContentText()).content[0].text.trim();

  try {
    return JSON.parse(raw);
  } catch (_) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);

    log('Warning: Could not parse Claude response — using fallback classification.');
    return {
      title: article.title || 'Untitled Article',
      category: 'Other',
      tags: ['unclassified'],
      summary: 'Article saved. Manual classification needed.',
      related_topics: []
    };
  }
}


// ============================================================
// BUILD MARKDOWN NOTE
// ============================================================
function buildMarkdown(url, submitter, userNotes, c) {
  const date      = today();
  const tagList   = (c.tags || []).map(function(t) { return '  - ' + t; }).join('\n');
  const wikilinks = (c.related_topics || []).map(function(t) { return '- [[' + t + ']]'; }).join('\n');
  const notesSection = userNotes ? '\n## Member Notes\n\n' + userNotes + '\n' : '';

  return '---\n'
    + 'title: "' + escapeQuotes(c.title) + '"\n'
    + 'url: "' + url + '"\n'
    + 'date: ' + date + '\n'
    + 'submitted_by: ' + submitter + '\n'
    + 'category: ' + c.category + '\n'
    + 'tags:\n' + tagList + '\n'
    + '---\n\n'
    + '## Summary\n\n'
    + c.summary + '\n\n'
    + '## Related Topics\n\n'
    + (wikilinks || '_None suggested_') + '\n'
    + notesSection
    + '## Source\n\n'
    + '[' + escapeMarkdown(c.title) + '](' + url + ')\n';
}


// ============================================================
// HELPERS
// ============================================================
function today() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function slugify(str) {
  return (str || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

function escapeQuotes(str) {
  return (str || '').replace(/"/g, '\\"');
}

function escapeMarkdown(str) {
  return (str || '').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function log(msg) {
  console.log('[FieldNotes] ' + msg);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd MMM yyyy');
  } catch (_) {
    return dateStr;
  }
}


// ============================================================
// GITHUB SYNC
// ============================================================

const GITHUB_REPO   = 'Protege77/Staffers-Knowledege-Base';
const GITHUB_BRANCH = 'main';

function _ghToken() {
  return PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN') || '';
}

function githubRequest(method, filePath, body) {
  const url = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + filePath;
  const options = {
    method: method,
    headers: {
      'Authorization': 'token ' + _ghToken(),
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FieldNotesPipeline/1.0'
    },
    muteHttpExceptions: true
  };
  if (body) options.payload = JSON.stringify(body);
  return UrlFetchApp.fetch(url, options);
}

function githubGetFile(filePath) {
  const res = githubRequest('GET', filePath, null);
  if (res.getResponseCode() !== 200) {
    log('GitHub GET failed (' + res.getResponseCode() + '): ' + filePath);
    return null;
  }
  const data = JSON.parse(res.getContentText());
  const content = Utilities.newBlob(
    Utilities.base64Decode(data.content.replace(/[\n\r]/g, ''))
  ).getDataAsString('UTF-8');
  return { content: content, sha: data.sha };
}

/**
 * List markdown file paths in a GitHub directory (non-recursive).
 */
function githubListDirectory(dirPath) {
  const res = githubRequest('GET', dirPath, null);
  const code = res.getResponseCode();
  if (code !== 200) {
    log('GitHub list failed (' + code + '): ' + dirPath);
    return [];
  }
  const items = JSON.parse(res.getContentText());
  if (!Array.isArray(items)) return [];
  return items
    .filter(function(item) {
      return item.type === 'file' && /\.md$/i.test(item.name);
    })
    .map(function(item) {
      return item.path;
    });
}

function githubPutFile(filePath, content, sha, message) {
  const encoded = Utilities.base64Encode(
    Utilities.newBlob(content, 'UTF-8').getBytes()
  );
  const body = { message: message, content: encoded, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const res = githubRequest('PUT', filePath, body);
  const code = res.getResponseCode();
  if (code !== 200 && code !== 201) {
    throw new Error('GitHub PUT failed (' + code + ') for ' + filePath + ': ' + res.getContentText());
  }
  log('GitHub: ✓ ' + filePath);
}

function syncToGitHub(slug, markdown, classification, date) {
  const token = _ghToken();
  if (!token) {
    log('GitHub sync skipped — GITHUB_TOKEN not set in Script Properties.');
    return;
  }

  const title     = classification.title    || 'Untitled';
  const category  = classification.category || 'Other';
  const topics    = classification.related_topics || [];
  const shortLabel = title.length > 55 ? title.substring(0, 52) + '...' : title;

  const steps = [
    ['Push article file',       function() { _ghPushArticle(slug, markdown); }],
    ['Update knowledge graph',  function() { _ghUpdateGraphData(slug, shortLabel, topics); }],
    ['Update home stats',       function() { _ghUpdateHomeStats(); }],
  ];

  for (var i = 0; i < steps.length; i++) {
    const name = steps[i][0];
    const fn   = steps[i][1];
    try {
      fn();
    } catch (err) {
      log('GitHub sync — ' + name + ' failed: ' + err.message);
    }
  }

  log('GitHub sync complete for: ' + slug);
}

function _ghPushArticle(slug, markdown) {
  const path     = CONFIG.ARTICLES_GITHUB_PATH + '/' + slug + '.md';
  const existing = githubGetFile(path);
  githubPutFile(path, markdown, existing ? existing.sha : null, 'Add article: ' + slug);
}

function parseRelatedTopicsFromBody(body) {
  const sectionMatch = (body || '').match(/## Related Topics\s*\r?\n([\s\S]*?)(?:\r?\n## |\s*$)/);
  if (!sectionMatch) return [];

  const topics = [];
  const wikilinkRe = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = wikilinkRe.exec(sectionMatch[1])) !== null) {
    const topic = (match[1] || '').trim();
    if (topic && topic !== '_None suggested_') topics.push(topic);
  }
  return topics;
}

function shortLabelFromTitle(title) {
  const text = title || 'Untitled';
  return text.length > 55 ? text.substring(0, 52) + '...' : text;
}

/**
 * Build graph JSON from all article markdown files on GitHub.
 */
function _ghCollectGraphDataFromArticles() {
  const paths = githubListDirectory(CONFIG.ARTICLES_GITHUB_PATH);
  const articles = [];
  const links = [];

  for (var i = 0; i < paths.length; i++) {
    const name = paths[i].split('/').pop();
    const id = name.replace(/\.md$/, '');
    const file = githubGetFile(paths[i]);
    if (!file) continue;

    const parsed = parseMarkdownFile(file.content, name);
    articles.push({
      id: id,
      label: shortLabelFromTitle(parsed.title || id),
      type: 'article',
    });

    parseRelatedTopicsFromBody(parsed.body).forEach(function(topic) {
      links.push([id, topic]);
    });
  }

  return { articles: articles, links: links };
}

/**
 * Create or update quartz/static/graph-data.json on GitHub.
 */
function _ghUpdateGraphData(slug, shortLabel, topics) {
  const file = githubGetFile(CONFIG.GRAPH_DATA_PATH);
  let data;

  if (file) {
    data = JSON.parse(file.content);
    if (!data.articles) data.articles = [];
    if (!data.links) data.links = [];
  } else {
    log('Graph data file missing — bootstrapping from ' + CONFIG.ARTICLES_GITHUB_PATH);
    data = _ghCollectGraphDataFromArticles();
  }

  const hasArticle = data.articles.some(function(a) { return a.id === slug; });
  if (!hasArticle) {
    data.articles.push({ id: slug, label: shortLabel, type: 'article' });
  } else {
    log('Graph already contains article: ' + slug);
  }

  topics.forEach(function(topic) {
    const exists = data.links.some(function(link) {
      return link[0] === slug && link[1] === topic;
    });
    if (!exists) data.links.push([slug, topic]);
  });

  const content = JSON.stringify(data, null, 2) + '\n';
  githubPutFile(
    CONFIG.GRAPH_DATA_PATH,
    content,
    file ? file.sha : null,
    'Update knowledge graph: ' + shortLabel
  );
}

/**
 * Recompute Articles, Tags, Topics, and Categories counts on the home page.
 */
function _ghUpdateHomeStats() {
  const file = githubGetFile(CONFIG.HOME_INDEX_PATH);
  if (!file) throw new Error('Could not read ' + CONFIG.HOME_INDEX_PATH);

  if (file.content.indexOf('stat-number') === -1) {
    log('Home stats skipped — ' + CONFIG.HOME_INDEX_PATH + ' has no stat cards yet (merge Quartz home page to main).');
    return;
  }

  const paths = githubListDirectory(CONFIG.ARTICLES_GITHUB_PATH);
  const tagSet = {};
  const catSet = {};

  for (var i = 0; i < paths.length; i++) {
    const articleFile = githubGetFile(paths[i]);
    if (!articleFile) continue;
    const parsed = parseMarkdownFile(articleFile.content, paths[i].split('/').pop());
    (parsed.tags || []).forEach(function(t) { tagSet[t] = true; });
    if (parsed.category) catSet[parsed.category] = true;
  }

  const graphFile = githubGetFile(CONFIG.GRAPH_DATA_PATH);
  const uniqueTopics = new Set();
  if (graphFile) {
    const graphData = JSON.parse(graphFile.content);
    (graphData.links || []).forEach(function(link) {
      if (link[1]) uniqueTopics.add(link[1]);
    });
  }

  let updated = file.content;

  updated = updated.replace(
    /(<div class="stat-number">)\d+(<\/div>\s*\n\s*<div class="stat-label">Articles<\/div>)/,
    function(_, pre, post) { return pre + paths.length + post; }
  );

  updated = updated.replace(
    /(<div class="stat-number">)\d+(<\/div>\s*\n\s*<div class="stat-label">Tags<\/div>)/,
    function(_, pre, post) { return pre + Object.keys(tagSet).length + post; }
  );

  updated = updated.replace(
    /(<div class="stat-number">)\d+(<\/div>\s*\n\s*<div class="stat-label">Topics<\/div>)/,
    function(_, pre, post) { return pre + uniqueTopics.size + post; }
  );

  updated = updated.replace(
    /(<div class="stat-number">)\d+(<\/div>\s*\n\s*<div class="stat-label">Categories<\/div>)/,
    function(_, pre, post) { return pre + Object.keys(catSet).length + post; }
  );

  if (updated === file.content) {
    log('Home stats: no changes detected');
    return;
  }

  githubPutFile(CONFIG.HOME_INDEX_PATH, updated, file.sha, 'Update home stats');
}


// ============================================================
// TEST FUNCTIONS
// ============================================================
function testListArticles() {
  const articles = getAllArticles();
  Logger.log('Found ' + articles.length + ' articles from GitHub');
  articles.slice(0, 5).forEach(function(a) {
    Logger.log('- ' + a.title + ' | ' + (a.summary || '').substring(0, 60));
  });
}

function testAsk() {
  const answer = askKnowledgeBase('What GIS tools are used in military operations?');
  Logger.log(answer);
}

function testPipeline() {
  const testEvent = {
    namedValues: {
      'Article URL':      ['https://www.esri.com/about/newsroom/arcuser/the-power-of-spatial-analysis/'],
      'Your Name':        ['Herman'],
      'Notes (optional)': ['Good overview of spatial analysis trends']
    }
  };
  onFormSubmit(testEvent);
}
