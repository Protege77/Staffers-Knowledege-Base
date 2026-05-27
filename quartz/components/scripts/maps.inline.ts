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
  whenReady: (fn: () => void) => void
}

let leafletPromise: Promise<void> | null = null
let initGeneration = 0
const mapObservers = new WeakMap<HTMLElement, IntersectionObserver>()
const resizeObservers = new WeakMap<HTMLElement, ResizeObserver>()

function getArticleMapEl(): HTMLElement | null {
  return document.querySelector(".article-map[data-lat][data-lng]")
}

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

function disconnectObservers(el: HTMLElement) {
  const observer = mapObservers.get(el)
  if (observer) {
    observer.disconnect()
    mapObservers.delete(el)
  }

  const resizeObserver = resizeObservers.get(el)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObservers.delete(el)
  }
}

function destroyMap(el: HTMLElement | null) {
  if (!el) return

  disconnectObservers(el)

  const map = (el as any)._leafletMap as LeafletMap | undefined
  if (map) {
    map.remove()
    ;(el as any)._leafletMap = null
  }

  el.innerHTML = ""
  if (el.classList.contains("article-map")) el.className = "article-map"
  else if (el.id === "site-map") el.className = "site-map"
}

function resetMapHost(el: HTMLElement, className: string): HTMLElement {
  destroyMap(el)
  const parent = el.parentElement
  if (!parent) return el

  const replacement = document.createElement("div")
  replacement.id = el.id
  replacement.className = className
  if (el.dataset.lat) replacement.dataset.lat = el.dataset.lat
  if (el.dataset.lng) replacement.dataset.lng = el.dataset.lng
  if (el.dataset.label) replacement.dataset.label = el.dataset.label
  parent.replaceChild(replacement, el)
  return replacement
}

async function waitForStableSize(el: HTMLElement, minHeight: number): Promise<void> {
  let lastW = -1
  let lastH = -1
  let stable = 0

  for (let frame = 0; frame < 48; frame++) {
    await new Promise((resolve) => requestAnimationFrame(resolve))
    const { width, height } = el.getBoundingClientRect()
    if (width >= 200 && height >= minHeight) {
      if (width === lastW && height === lastH) {
        stable++
        if (stable >= 3) return
      } else {
        stable = 0
        lastW = width
        lastH = height
      }
    }
  }
}

function refreshMapSize(map: LeafletMap) {
  map.invalidateSize({ animate: false })
  requestAnimationFrame(() => {
    map.invalidateSize({ animate: false })
    requestAnimationFrame(() => map.invalidateSize({ animate: false }))
  })
  window.setTimeout(() => map.invalidateSize({ animate: false }), 250)
}

function watchMapVisibility(el: HTMLElement, map: LeafletMap, onVisible?: () => void) {
  disconnectObservers(el)

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        refreshMapSize(map)
        onVisible?.()
      }
    },
    { threshold: 0.1 },
  )
  observer.observe(el)
  mapObservers.set(el, observer)
}

function watchMapResize(el: HTMLElement, map: LeafletMap, onResize: () => void) {
  const resizeObserver = new ResizeObserver(() => {
    refreshMapSize(map)
    onResize()
  })
  resizeObserver.observe(el)
  resizeObservers.set(el, resizeObserver)
}

function scheduleFit(map: LeafletMap, fitView: () => void) {
  fitView()
  map.whenReady(() => {
    fitView()
    window.setTimeout(fitView, 100)
    window.setTimeout(fitView, 400)
    window.setTimeout(fitView, 900)
  })
}

function pathToRootPrefix(slug: string): string {
  const segments = slug.split("/").filter((x) => x !== "")
  const ups = segments
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  return ups.length === 0 ? "./" : `${ups}/`
}

function fixPersistedStylesheet(): void {
  const link = document.querySelector('link[href$="index.css"]') as HTMLLinkElement | null
  if (!link) return
  const slug = document.body.dataset.slug ?? "index"
  link.setAttribute("href", `${pathToRootPrefix(slug)}index.css`)
}

function projectBaseUrl(): URL {
  const slug = document.body.dataset.slug ?? ""
  const og = document.querySelector('meta[property="og:url"]')?.getAttribute("content")
  if (og && slug) {
    const base = new URL(og)
    if (slug !== "index") {
      const suffix = slug.split("/").join("/")
      if (base.pathname.endsWith(`/${suffix}`)) {
        base.pathname = base.pathname.slice(0, -(suffix.length + 1)) || "/"
      }
    } else {
      base.pathname = base.pathname.replace(/\/?index\/?$/, "/") || "/"
    }
    if (!base.pathname.endsWith("/")) base.pathname += "/"
    return base
  }

  const segments = window.location.pathname.split("/").filter(Boolean)
  if (segments.length > 1) {
    return new URL(`/${segments[0]}/`, window.location.origin)
  }
  return new URL("/", window.location.origin)
}

function staticAssetUrl(path: string): URL {
  return new URL(path.replace(/^\.\//, ""), projectBaseUrl())
}

async function loadArticleLocations(): Promise<ArticleLocation[]> {
  try {
    const res = await fetch(staticAssetUrl("static/article-locations.json"))
    if (!res.ok) return []
    const data = (await res.json()) as { locations?: ArticleLocation[] }
    return data.locations ?? []
  } catch (err) {
    console.warn("Could not load article-locations.json:", err)
    return []
  }
}

async function initArticleMap(generation: number) {
  let el = getArticleMapEl()
  if (!el) return

  const lat = Number(el.dataset.lat)
  const lng = Number(el.dataset.lng)
  const label = el.dataset.label || "Article location"
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

  el = resetMapHost(el, "article-map")
  await waitForStableSize(el, 120)
  if (generation !== initGeneration) return

  const L = (window as any).L
  const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 10) as LeafletMap
  ;(el as any)._leafletMap = map

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  L.marker([lat, lng]).addTo(map).bindPopup(label)

  const fitView = () => {
    if (generation !== initGeneration) return
    map.setView([lat, lng], 10)
    refreshMapSize(map)
  }

  watchMapVisibility(el, map, fitView)
  watchMapResize(el, map, fitView)
  scheduleFit(map, fitView)
}

async function initSiteMap(generation: number) {
  let el = document.getElementById("site-map")
  if (!el) return

  el = resetMapHost(el, "site-map")
  await waitForStableSize(el, 200)
  if (generation !== initGeneration) return

  const locations = await loadArticleLocations()
  if (generation !== initGeneration) return

  const L = (window as any).L
  const map = L.map(el, { scrollWheelZoom: true }) as LeafletMap
  ;(el as any)._leafletMap = map

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map)

  const bounds = L.latLngBounds([])
  const articleBase = staticAssetUrl("articles/")

  for (const loc of locations) {
    const marker = L.marker([loc.lat, loc.lng]).addTo(map)
    const popup = `<strong>${loc.name}</strong><br><a href="${new URL(loc.id, articleBase).toString()}">${loc.title}</a>`
    marker.bindPopup(popup)
    bounds.extend([loc.lat, loc.lng])
  }

  const fitView = () => {
    if (generation !== initGeneration) return
    if (locations.length === 0) {
      map.setView([20, 0], 2)
    } else {
      map.fitBounds(bounds.pad(0.2))
    }
    refreshMapSize(map)
  }

  watchMapVisibility(el, map, fitView)
  watchMapResize(el, map, fitView)
  scheduleFit(map, fitView)
}

function cleanupMaps() {
  destroyMap(getArticleMapEl())
  destroyMap(document.getElementById("site-map"))
}

async function initMaps() {
  const generation = ++initGeneration

  try {
    await ensureLeaflet()
    if (generation !== initGeneration) return

    await initArticleMap(generation)
    if (generation !== initGeneration) return

    await initSiteMap(generation)
  } catch (err) {
    console.error("Map initialization failed:", err)
  }
}

let initTimer: number | null = null

function scheduleMapInit() {
  fixPersistedStylesheet()

  if (initTimer !== null) {
    window.clearTimeout(initTimer)
  }

  initTimer = window.setTimeout(() => {
    initTimer = null
    void initMaps()
  }, 120)
}

document.addEventListener("nav", scheduleMapInit)
scheduleMapInit()

window.addCleanup?.(() => cleanupMaps())
