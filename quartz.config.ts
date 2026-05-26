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
          light: "#FFF8E8",
          lightgray: "#EDE0C8",
          gray: "#A09080",
          darkgray: "#5A5040",
          dark: "#1A1510",
          secondary: "#2A8C87",
          tertiary: "#E8876A",
          highlight: "rgba(125, 211, 206, 0.18)",
          textHighlight: "#FFF0A0",
        },
        darkMode: {
          light: "#1C1E1A",
          lightgray: "#2A2C28",
          gray: "#6B6A60",
          darkgray: "#D4CFC0",
          dark: "#F5F0E8",
          secondary: "#7DD3CE",
          tertiary: "#E8876A",
          highlight: "rgba(125, 211, 206, 0.12)",
          textHighlight: "#4A3C10",
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
