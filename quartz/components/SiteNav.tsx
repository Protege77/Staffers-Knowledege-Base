import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/siteNav.scss"
import { FullSlug, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"

const navItems: { label: string; slug: FullSlug }[] = [
  { label: "Home", slug: "index" },
  { label: "Knowledge Graph", slug: "graph" },
  { label: "Ask the Knowledge Base", slug: "ask" },
  { label: "Submit an Article", slug: "submit" },
  { label: "Articles", slug: "articles" },
  { label: "Tags", slug: "tags/index" },
]

function isActive(current: FullSlug, target: FullSlug): boolean {
  if (target === "index") return current === "index"
  if (target === "articles") return current === "articles" || current.startsWith("articles/")
  if (target === "tags/index") return current === "tags/index" || current.startsWith("tags/")
  return current === target
}

const SiteNav: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const currentSlug = fileData.slug!

  return (
    <nav class={classNames(displayClass, "site-nav")} aria-label="Site navigation">
      {navItems.map(({ label, slug }) => (
        <a
          href={resolveRelative(currentSlug, slug)}
          class={classNames(
            undefined,
            "site-nav-btn",
            "internal",
            isActive(currentSlug, slug) ? "active" : "",
          )}
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
