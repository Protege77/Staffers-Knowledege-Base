import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/siteNav.scss"
import { FullSlug, simplifySlug } from "../util/path"
import { classNames } from "../util/lang"
import { GlobalConfiguration } from "../cfg"

const navItems: { label: string; slug: FullSlug }[] = [
  { label: "Home", slug: "index" },
  { label: "Knowledge Graph", slug: "graph" },
  { label: "Article Map", slug: "map" },
  { label: "Ask the Knowledge Base", slug: "ask" },
  { label: "Submit an Article", slug: "submit" },
  { label: "Articles", slug: "articles" },
  { label: "Tags", slug: "tags/index" },
]

function navHref(cfg: GlobalConfiguration, slug: FullSlug): string {
  const site = `https://${cfg.baseUrl}`
  const path = simplifySlug(slug)
  if (path === "/") return `${site}/`
  // Folder index pages must keep a trailing slash or relative links on the listing break under SPA nav.
  const folderTrailingSlash = slug.endsWith("/index") || slug === "articles" ? "/" : ""
  return `${site}/${path}${folderTrailingSlash}`
}

function isActive(current: FullSlug, target: FullSlug): boolean {
  if (target === "index") return current === "index"
  if (target === "articles") return current === "articles" || current.startsWith("articles/")
  if (target === "tags/index") return current === "tags/index" || current.startsWith("tags/")
  return current === target
}

const SiteNav: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  const currentSlug = fileData.slug!

  return (
    <nav class={classNames(displayClass, "site-nav")} aria-label="Site navigation">
      {navItems.map(({ label, slug }) => (
        <a
          href={navHref(cfg, slug)}
          class={classNames(
            undefined,
            "site-nav-btn",
            "internal",
            isActive(currentSlug, slug) ? "active" : "",
          )}
          {...(slug === "map" ? { "data-router-ignore": "" } : {})}
          data-no-popover="true"
          aria-current={isActive(currentSlug, slug) ? "page" : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}

SiteNav.css = style

export default (() => SiteNav) satisfies QuartzComponentConstructor
