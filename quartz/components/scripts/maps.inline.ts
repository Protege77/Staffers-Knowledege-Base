const LEAFLET_CSS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
const LEAFLET_JS =
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"

type ArticleLocation = {
  id: string
  title: string
  name: string
  lat: number
  lng: number
}

let leafletPromise: Promise<void> | null = null

function ensureLeaflet(): Promise<void> {
  if ((window as any).L) return Promise.resolve()
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }

    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load Leaflet")), { once: true })
      if ((window as any).L) resolve()
      return
    }

    const script = document.createElement("script")
    script.src = LEAFLET_JS
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Leaflet"))
    document.head.appendChild(script)
  })

  return leafletPromise
}

function destroyMap(el: HTMLElement) {
  const map = (el as any)._leafletMap as { remove: () => void } | undefined
  if (map) {
    map.remove()
    ;(el as any)._leafletMap = null
  }
}

function initArticleMap() {
  const el = document.getElementById("article-map") as HTMLElement | null
  if (!el) return

  const lat = Number(el.dataset.lat)
  const lng = Number(el.dataset.lng)
  const label = el.dataset.label || "Article location"
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

  destroyMap(el)

  const L = (window as any).L
  const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 10)
  ;(el as any)._leafletMap = map

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  L.marker([lat, lng]).addTo(map).bindPopup(label)
  setTimeout(() => map.invalidateSize(), 100)
}

async function initSiteMap() {
  const el = document.getElementById("site-map") as HTMLElement | null
  if (!el) return

  destroyMap(el)

  let locations: ArticleLocation[] = []
  try {
    const res = await fetch(new URL("./static/article-locations.json", window.location.href))
    if (res.ok) {
      const data = (await res.json()) as { locations?: ArticleLocation[] }
      locations = data.locations ?? []
    }
  } catch (err) {
    console.warn("Could not load article-locations.json:", err)
  }

  const L = (window as any).L
  const map = L.map(el, { scrollWheelZoom: true })
  ;(el as any)._leafletMap = map

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  if (locations.length === 0) {
    map.setView([20, 0], 2)
    return
  }

  const bounds = L.latLngBounds([])
  const articleBase = new URL("articles/", window.location.href)

  for (const loc of locations) {
    const marker = L.marker([loc.lat, loc.lng]).addTo(map)
    const popup = `<strong>${loc.name}</strong><br><a href="${new URL(loc.id, articleBase).toString()}">${loc.title}</a>`
    marker.bindPopup(popup)
    bounds.extend([loc.lat, loc.lng])
  }

  map.fitBounds(bounds.pad(0.2))
  setTimeout(() => map.invalidateSize(), 100)
}

async function initMaps() {
  try {
    await ensureLeaflet()
    initArticleMap()
    await initSiteMap()
  } catch (err) {
    console.error("Map initialization failed:", err)
  }
}

document.addEventListener("nav", () => {
  void initMaps()
})

void initMaps()
