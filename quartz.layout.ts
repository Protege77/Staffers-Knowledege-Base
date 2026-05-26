import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// ============================================================
// QUARTZ LAYOUT — Warm Editorial
// Top navigation bar, no left sidebar, slim right panel
// ============================================================

// Components shared across ALL pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.PageTitle(),
    Component.Search(),
    Component.Darkmode(),
  ],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "Submit an Article": "https://protege77.github.io/Staffers-Knowledege-Base/submit",
      "GitHub": "https://github.com/Protege77/Staffers-Knowledege-Base",
    },
  }),
}

// Layout for regular article/note pages
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [],
  right: [
    Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.RecentNotes({
      title: "Recently Added",
      limit: 4,
      showTags: false,
    })),
  ],
}

// Layout for folder/index pages (e.g. /articles/)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [],
  right: [],
}
