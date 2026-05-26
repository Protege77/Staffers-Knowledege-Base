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
          light: "#fafafa",
          lightgray: "#e8e8e8",
          gray: "#9b9b9b",
          darkgray: "#3a3a3a",
          dark: "#1a1a1a",
          secondary: "#2563eb",     // blue — links and highlights
          tertiary: "#16a34a",      // green — hover states
          highlight: "rgba(37, 99, 235, 0.08)",
          textHighlight: "#fff3b0", // yellow — text highlight
        },
        darkMode: {
          light: "#1a1a2e",
          lightgray: "#2a2a3e",
          gray: "#6b7280",
          darkgray: "#d1d5db",
          dark: "#f9fafb",
          secondary: "#60a5fa",
          tertiary: "#34d399",
          highlight: "rgba(96, 165, 250, 0.10)",
          textHighlight: "#4b5320",
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
