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
    pageTitle: "The Field Notes",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,

    // Your GitHub Pages URL: https://<username>.github.io/<repo>
    // Example: https://hermantan.github.io/gis-knowledge-base
    baseUrl: "protege77.github.io/Staffers-Knowledege-Base",

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
        header: "Playfair Display",
        body: "Lato",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#ebedef",          // off-white background
          lightgray: "#d4d8dc",      // borders
          gray: "#737b85",           // muted text
          darkgray: "#373e47",       // body text
          dark: "#22272e",           // headings
          secondary: "#00adb5",      // teal accent
          tertiary: "#22272e",       // hover / emphasis
          highlight: "rgba(0, 173, 181, 0.12)",
          textHighlight: "rgba(0, 173, 181, 0.35)",
        },
        darkMode: {
          light: "#22272e",          // charcoal background
          lightgray: "#373e47",      // borders / surfaces
          gray: "#9aa3ad",           // muted text
          darkgray: "#ebedef",       // body text
          dark: "#ebedef",           // headings
          secondary: "#00adb5",      // teal accent
          tertiary: "#ebedef",       // hover on links
          highlight: "rgba(0, 173, 181, 0.18)",
          textHighlight: "rgba(0, 173, 181, 0.45)",
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
