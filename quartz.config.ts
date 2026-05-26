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
          light: "#FFF6E8",          // cream background
          lightgray: "#F0E6D4",      // warm borders
          gray: "#B8A898",           // muted warm gray
          darkgray: "#5C4A3A",       // warm brown body text
          dark: "#3A2A1A",           // deep brown headings
          secondary: "#7DD5D2",      // teal links
          tertiary: "#E8806A",       // coral hover
          highlight: "rgba(255, 224, 138, 0.35)", // yellow wash
          textHighlight: "#FFE08A",  // yellow selection
        },
        darkMode: {
          light: "#2A1F14",          // deep warm dark bg
          lightgray: "#3D2E20",      // dark warm borders
          gray: "#8A7060",           // muted on dark
          darkgray: "#E8D8C4",       // warm body text on dark
          dark: "#FFF6E8",           // cream headings on dark
          secondary: "#7DD5D2",      // teal on dark
          tertiary: "#E8806A",       // coral hover on dark
          highlight: "rgba(255, 224, 138, 0.15)", // yellow wash dark
          textHighlight: "#5C3A1A",  // deep amber selection
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
