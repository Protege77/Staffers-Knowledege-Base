const LEAFLET_VERSION = "1.9.4"
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`
const MARKER_ICON = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-icon.png`
const MARKER_ICON_2X = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-icon-2x.png`
const MARKER_SHADOW = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-shadow.png`

type ArticleLocation = {
  id: string
  title: string
  name: string
  lat: number
  lng: number
}

type LeafletMap = {
  remove: () => void
  invalidateSize: (opts?: { animate?: boolean }) => void
  setView: (coords: [number, number], zoom: number) => LeafletMap
  fitBounds: (bounds: unknown, opts?: { padding?: [number, number] }) => LeafletMap
}

let leafletPromise: Promise<void> | null = null
let initPromise: Promise<void> | null = null
const mapObservers = new WeakMap<HTMLElement, IntersectionObserver>()

function loadStylesheet(href: string): Promise<void> {
  const existing = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement | null
  if (existing?.sheet) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${href}`)), {
        once: true,
      })
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load ${href}`))
    document.head.appendChild(link)
  })
}

function loadScript(src: string): Promise<void> {
  if ((window as any).L) return Promise.resolve()

  const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
  if (existing) {
    if ((window as any).L) return Promise.resolve()
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

function configureLeafletIcons(L: any) {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: MARKER_ICON_2X,
    iconUrl: MARKER_ICON,
    shadowUrl: MARKER_SHADOW,
  })
}

function ensureLeaflet(): Promise<void> {
  if ((window as any).L) return Promise.resolve()
  if (leafletPromise) return leafletPromise

  leafletPromise = Promise.all([loadStylesheet(LEAFLET_CSS), loadScript(LEAFLET_JS)]).then(() => {
    const L = (window as any).L
    if (!L) throw new Error("Leaflet failed to load")
    configureLeafletIcons(L)
  })

  return leafletPromise
}

function destroyMap(el: HTMLElement | null) {
  if (!el) return

  const observer = mapObservers.get(el)
  if (observer) {
    observer.disconnect()
    mapObservers.delete(el)
  }

  const map = (el as any)._leafletMap as LeafletMap | undefined
  if (map) {
    map.remove()
    ;(el as any)._leafletMap = null
  }

  el.innerHTML = ""
  if (el.id === "article-map") el.className = "article-map"
  else if (el.id === "site-map") el.className = "site-map"
}

function refreshMapSize(map: LeafletMap) {
  map.invalidateSize({ animate: false })
  requestAnimationFrame(() => {
    map.invalidateSize({ animate: false })
    requestAnimationFrame(() => map.invalidateSize({ animate: false }))
  })
  window.setTimeout(() => map.invalidateSize({ animate: false }), 250)
}

function watchMapVisibility(el: HTMLElement, map: LeafletMap) {
  const prior = mapObservers.get(el)
  prior?.disconnect()

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        refreshMapSize(map)
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(el)
  mapObservers.set(el, observer)
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
  const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 10) as LeafletMap
  ;(el as any)._leafletMap = map

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  L.marker([lat, lng]).addTo(map).bindPopup(label)
  watchMapVisibility(el, map)
  refreshMapSize(map)
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
  const map = L.map(el, { scrollWheelZoom: true }) as LeafletMap
  ;(el as any)._leafletMap = map

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  if (locations.length === 0) {
    map.setView([20, 0], 2)
    watchMapVisibility(el, map)
    refreshMapSize(map)
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
  watchMapVisibility(el, map)
  refreshMapSize(map)
}

function cleanupMaps() {
  destroyMap(document.getElementById("article-map"))
  destroyMap(document.getElementById("site-map"))
}

async function initMaps() {
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      await ensureLeaflet()
      initArticleMap()
      await initSiteMap()
    } catch (err) {
      console.error("Map initialization failed:", err)
    }
  })().finally(() => {
    initPromise = null
  })

  return initPromise
}

document.addEventListener("nav", () => {
  void initMaps()
})

window.addCleanup?.(() => cleanupMaps())
