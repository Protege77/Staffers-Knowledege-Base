import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

// ============================================================
// QUARTZ CONFIGURATION
// GIS & Data Science Community Knowledge Base
// ============================================================

const config: QuartzConfig = {
  configuration: {
    // --------------------------------------------------------
    // SITE IDENTITY — update these
    // --------------------------------------------------------
    pageTitle: "FILO Knowledge Bank",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,

    // Your GitHub Pages URL: https://<username>.github.io/<repo>
    // Example: https://hermantan.github.io/gis-knowledge-base
    baseUrl: "Protege77.github.io/Staffers-Knowledege-Base",

    // --------------------------------------------------------
    // ANALYTICS — optional, add your Plausible/Google ID or leave as-is
    // --------------------------------------------------------
    analytics: null,

    // --------------------------------------------------------
    // LOCALE & DISPLAY
    // --------------------------------------------------------
    locale: "en-US",
    defaultDateType: "created",
    ignorePatterns: ["private", "templates", ".obsidian"],

    // --------------------------------------------------------
    // THEME
    // Light/dark mode with a clean, professional colour scheme
    // --------------------------------------------------------
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Source Sans Pro",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#F8FAFC",          // slate-50 background
          lightgray: "#E2E8F0",      // slate-200 borders
          gray: "#94A3B8",           // slate-400 muted
          darkgray: "#475569",       // slate-600 body text
          dark: "#0F172A",           // slate-900 headings
          secondary: "#D97706",      // amber-600 links
          tertiary: "#EA580C",       // orange-600 hover
          highlight: "rgba(251, 191, 36, 0.15)", // amber wash
          textHighlight: "#FEF3C7",  // amber-100 selection
        },
        darkMode: {
          light: "#0F172A",          // slate-900 dark bg
          lightgray: "#1E293B",      // slate-800 dark borders
          gray: "#64748B",           // slate-500 muted on dark
          darkgray: "#CBD5E1",       // slate-300 body text on dark
          dark: "#F1F5F9",           // slate-100 headings on dark
          secondary: "#FCD34D",      // amber-300 on dark
          tertiary: "#FB923C",       // orange-400 hover on dark
          highlight: "rgba(251, 191, 36, 0.10)", // amber wash dark
          textHighlight: "#451A03",  // amber-950 selection
        },
      },
    },
  },

  // ============================================================
  // PLUGINS
  // ============================================================
  plugins: {

    // ----------------------------------------------------------
    // TRANSFORMERS — process markdown content
    // ----------------------------------------------------------
    transformers: [
      Plugin.FrontMatter(),                   // reads YAML frontmatter (title, tags, date, etc.)
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({
        enableInHtmlEmbed: false,
        parseTags: true,
        parseArrows: true,
        parseBlockReferences: true,
      }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents({
        maxDepth: 3,
        minEntries: 3,                         // only show ToC if 3+ headings
        showByDefault: true,
      }),
      Plugin.CrawlLinks({
        markdownLinkResolution: "shortest",
        prettyLinks: true,
        openLinksInNewTab: true,               // external article links open in new tab
        lazyLoad: true,
      }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],

    // ----------------------------------------------------------
    // FILTERS — control which files are published
    // ----------------------------------------------------------
    filters: [
      Plugin.RemoveDrafts(),                   // exclude notes with draft: true in frontmatter
    ],

    // ----------------------------------------------------------
    // EMITTERS — generate the site pages
    // ----------------------------------------------------------
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),                        // generates a page for each tag
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,                       // RSS feed for members who prefer it
        rssLimit: 30,
        rssFullHtml: false,
        includeEmptyFiles: false,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
