const D3_URL = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"

type GraphArticle = { id: string; label: string; type: "article" }
type GraphData = { articles: GraphArticle[]; links: [string, string][] }

type GraphConfig = {
  containerId: string
  svgId: string
  tooltipId: string
  resetBtnId: string
  height: number
}

let d3LoadPromise: Promise<void> | null = null
let graphDataPromise: Promise<GraphData> | null = null

async function loadGraphData(): Promise<GraphData> {
  if (!graphDataPromise) {
    graphDataPromise = (async () => {
      try {
        const res = await fetch(new URL("./static/graph-data.json", window.location.href))
        if (res.ok) {
          const data = (await res.json()) as Partial<GraphData>
          return {
            articles: data.articles ?? [],
            links: data.links ?? [],
          }
        }
      } catch (err) {
        console.warn("Could not load graph-data.json:", err)
      }

      return { articles: [], links: [] }
    })()
  }

  return graphDataPromise
}

function ensureD3(): Promise<void> {
  if ((window as any).d3) return Promise.resolve()
  if (d3LoadPromise) return d3LoadPromise

  d3LoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${D3_URL}"]`) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load D3")), { once: true })
      if ((window as any).d3) resolve()
      return
    }

    const script = document.createElement("script")
    script.src = D3_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load D3"))
    document.head.appendChild(script)
  })

  return d3LoadPromise
}

function navigateTo(url: URL) {
  const spaNavigate = (window as any).spaNavigate as ((url: URL) => void) | undefined
  if (spaNavigate) {
    spaNavigate(url)
  } else {
    window.location.assign(url)
  }
}

function openTopicSearch(label: string) {
  const searchButton = document.querySelector(".search-button") as HTMLButtonElement | null
  const searchBar = document.querySelector(".search-bar") as HTMLInputElement | null
  searchButton?.click()
  if (!searchBar) return
  searchBar.value = label
  searchBar.dispatchEvent(new Event("input", { bubbles: true }))
  searchBar.focus()
}

function initGraphInstance(
  config: GraphConfig,
  articles: GraphArticle[],
  linksRaw: [string, string][],
) {
  const d3 = (window as any).d3
  if (!d3) return

  const container = document.getElementById(config.containerId)
  const tooltip = document.getElementById(config.tooltipId)
  const svgEl = document.getElementById(config.svgId) as SVGSVGElement | null
  if (!container || !tooltip || !svgEl) return

  const previousSim = (container as any)._graphSim
  if (previousSim) previousSim.stop()

  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild)

  const topicSet: Record<string, boolean> = {}
  linksRaw.forEach(([, topic]) => {
    topicSet[topic] = true
  })
  const topics = Object.keys(topicSet).map((t) => ({ id: t, label: t, type: "topic" }))
  const nodes = [...articles.map((a) => ({ ...a })), ...topics]
  const links = linksRaw.map(([source, target]) => ({ source, target }))

  const w = container.clientWidth || 800
  const h = container.clientHeight || config.height

  const svg = d3.select(svgEl)
  const g = svg.append("g")

  const zoom = d3.zoom().scaleExtent([0.2, 3]).on("zoom", (e: any) => g.attr("transform", e.transform))
  svg.call(zoom)

  const sim = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-220))
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force("collision", d3.forceCollide(30))

  ;(container as any)._graphSim = sim

  const link = g
    .append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#D4C4B0")
    .attr("stroke-width", 1.5)

  const node = g
    .append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", (d: any) => (d.type === "article" ? 18 : 10))
    .attr("fill", (d: any) => (d.type === "article" ? "#7DD5D2" : "#B8A898"))
    .attr("stroke", (d: any) => (d.type === "article" ? "#5ABFBB" : "#8A7060"))
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .call(
      d3
        .drag()
        .on("start", (e: any, d: any) => {
          if (!e.active) sim.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (e: any, d: any) => {
          d.fx = e.x
          d.fy = e.y
        })
        .on("end", (e: any, d: any) => {
          if (!e.active) sim.alphaTarget(0)
          d.fx = null
          d.fy = null
        }),
    )
    .on("mouseover", (_e: any, d: any) => {
      tooltip.style.opacity = "1"
      tooltip.textContent = d.label
      const connected = new Set<string>()
      links.forEach((l: any) => {
        if (l.source.id === d.id) connected.add(l.target.id)
        if (l.target.id === d.id) connected.add(l.source.id)
      })
      node.attr("opacity", (n: any) => (n.id === d.id || connected.has(n.id) ? 1 : 0.2))
      link.attr("opacity", (l: any) => (l.source.id === d.id || l.target.id === d.id ? 1 : 0.1))
    })
    .on("mousemove", (e: any) => {
      const rect = container.getBoundingClientRect()
      tooltip.style.left = `${e.clientX - rect.left + 12}px`
      tooltip.style.top = `${e.clientY - rect.top - 28}px`
    })
    .on("mouseout", () => {
      tooltip.style.opacity = "0"
      node.attr("opacity", 1)
      link.attr("opacity", 1)
    })
    .on("click", (_e: any, d: any) => {
      if (d.type === "topic") {
        openTopicSearch(d.label)
        return
      }
      navigateTo(new URL(`articles/${d.id}`, window.location.href))
    })

  sim.on("tick", () => {
    link
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y)
    node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y)
  })

  let resetFn: (() => void) | null = null

  sim.on("end", () => {
    const xs = nodes.map((d: any) => d.x)
    const ys = nodes.map((d: any) => d.y)
    const x0 = Math.min(...xs) - 40
    const x1 = Math.max(...xs) + 40
    const y0 = Math.min(...ys) - 40
    const y1 = Math.max(...ys) + 40
    const scale = Math.min(0.9, w / (x1 - x0), h / (y1 - y0))
    const tx = (w - scale * (x0 + x1)) / 2
    const ty = (h - scale * (y0 + y1)) / 2
    const fitTransform = d3.zoomIdentity.translate(tx, ty).scale(scale)
    svg.transition().duration(600).call(zoom.transform, fitTransform)
    resetFn = () => svg.transition().duration(500).call(zoom.transform, fitTransform)
  })

  const resetBtn = document.getElementById(config.resetBtnId)
  if (resetBtn) {
    const onReset = () => resetFn?.()
    resetBtn.addEventListener("click", onReset)
    window.addCleanup(() => resetBtn.removeEventListener("click", onReset))
  }
}

async function initKnowledgeGraphs() {
  const configs: GraphConfig[] = []

  if (document.getElementById("graph-svg")) {
    configs.push({
      containerId: "graph-container",
      svgId: "graph-svg",
      tooltipId: "graph-tooltip",
      resetBtnId: "graph-reset-btn",
      height: 620,
    })
  }

  if (document.getElementById("home-graph-svg")) {
    configs.push({
      containerId: "home-graph-container",
      svgId: "home-graph-svg",
      tooltipId: "home-graph-tooltip",
      resetBtnId: "home-graph-reset-btn",
      height: 500,
    })
  }

  if (configs.length === 0) return

  try {
    const [graphData] = await Promise.all([loadGraphData(), ensureD3()])
    configs.forEach((config) => initGraphInstance(config, graphData.articles, graphData.links))
  } catch (err) {
    console.error("Knowledge graph failed to initialize:", err)
  }
}

document.addEventListener("nav", () => {
  graphDataPromise = null
  void initKnowledgeGraphs()
})

void initKnowledgeGraphs()
