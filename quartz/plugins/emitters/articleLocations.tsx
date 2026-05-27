import { joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

type ArticleLocation = {
  id: string
  title: string
  name: string
  lat: number
  lng: number
  confidence: string
}

export const ArticleLocations: QuartzEmitterPlugin = () => ({
  name: "ArticleLocations",
  async *emit(_ctx, content) {
    const locations: ArticleLocation[] = []

    for (const [, file] of content) {
      const slug = file.data.slug
      if (!slug?.startsWith("articles/") || slug === "articles") continue

      const fm = file.data.frontmatter
      const lat = Number(fm?.location_lat)
      const lng = Number(fm?.location_lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue

      locations.push({
        id: slug.replace(/^articles\//, ""),
        title: String(fm?.title ?? slug),
        name: String(fm?.location_name ?? fm?.title ?? slug),
        lat,
        lng,
        confidence: String(fm?.location_confidence ?? "high"),
      })
    }

    const fp = joinSegments("static", "article-locations")
    yield write({
      ctx: _ctx,
      slug: fp,
      ext: ".json",
      content: JSON.stringify({ locations }, null, 2),
    })
  },
})
