---
title: Knowledge Graph
---

# Knowledge Graph

Articles and their connected topics — click a node to open the article, drag to explore.

<div id="graph-container" style="width:100%;height:620px;background:#FFF6E8;border-radius:12px;border:1px solid #F0E6D4;overflow:hidden;position:relative;">
  <div id="graph-tooltip" style="position:absolute;background:#3A2A1A;color:#FFF6E8;padding:6px 10px;border-radius:6px;font-size:0.78rem;pointer-events:none;opacity:0;transition:opacity 0.15s;max-width:220px;line-height:1.4;"></div>
  <svg id="graph-svg" style="width:100%;height:100%;"></svg>
</div>

<p style="font-size:0.8rem;color:#B8A898;margin-top:0.5rem;">
  🔵 Articles &nbsp;·&nbsp; 🟤 Topics &nbsp;·&nbsp; Click an article node to open it &nbsp;·&nbsp; Scroll to zoom
</p>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script>
(function() {

const articles = [
  { id: "2026-05-27-the-power-of-spatial-analysis", label: "The Power of Spatial Analysis", type: "article" },
  { id: "2026-05-27-military-applications-of-gis", label: "Military Applications of GIS", type: "article" },
  { id: "2026-05-27-ukraine-seeks-god-mode-with-new-control-app-for-drone-war", label: "Ukraine Seeks God Mode with Drone War App", type: "article" },
  { id: "2026-05-27-targeting-turbineone-frontline-perception-system", label: "TurbineOne Frontline Perception System", type: "article" },
  { id: "2026-05-27-america-downs-cheap-drones-with-million-dollar-missiles-a-fi", label: "America Downs Cheap Drones with Million-Dollar Missiles", type: "article" },
  { id: "2026-05-27-ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-fa", label: "AI got the blame for the Iran School Bombing", type: "article" },
  { id: "2026-05-27-hormuz-is-not-the-only-weak-spot-for-global-trade", label: "Hormuz Is Not the Only Weak Spot for Global Trade", type: "article" },
  { id: "2026-05-27-memory-chip-price-surge-hits-computer-retailers-as-customers", label: "Memory Chip Price Surge Hits Retailers", type: "article" },
  { id: "2026-05-27-defence-experts-warn-of-fitness-tracker-risks-in-singapore-m", label: "Fitness Tracker Risks in Singapore Military Bases", type: "article" },
  { id: "2026-05-27-refreshed-ns-medical-classification-system-to-take-effect-fr", label: "Refreshed NS Medical Classification System", type: "article" },
  { id: "2026-05-27-singapore-must-continue-to-pay-particular-attention-to-defen", label: "Singapore Must Continue to Pay Attention to Defence", type: "article" },
  { id: "2026-05-27-ministry-of-defence-singapore-latest-release-april-2026", label: "Ministry of Defence Singapore - April 2026", type: "article" },
  { id: "2026-05-27-ukraine-iran-war-coverage", label: "Ukraine-Iran War Coverage", type: "article" },
  { id: "2026-05-27-our-favorite-management-tips-on-leading-when-youre-overwhelm", label: "Management Tips on Leading When Overwhelmed", type: "article" },
];

const links_raw = [
  ["2026-05-27-ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-fa", "Military AI Systems"],
  ["2026-05-27-ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-fa", "Defense Contractors"],
  ["2026-05-27-ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-fa", "Data Quality and Governance"],
  ["2026-05-27-ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-fa", "Technology Accountability"],
  ["2026-05-27-america-downs-cheap-drones-with-million-dollar-missiles-a-fi", "Unmanned Aerial Vehicles"],
  ["2026-05-27-america-downs-cheap-drones-with-million-dollar-missiles-a-fi", "Military Defense Systems"],
  ["2026-05-27-america-downs-cheap-drones-with-million-dollar-missiles-a-fi", "Cost-Benefit Analysis"],
  ["2026-05-27-defence-experts-warn-of-fitness-tracker-risks-in-singapore-m", "Geospatial Security"],
  ["2026-05-27-defence-experts-warn-of-fitness-tracker-risks-in-singapore-m", "Military Intelligence"],
  ["2026-05-27-defence-experts-warn-of-fitness-tracker-risks-in-singapore-m", "Location Data Privacy"],
  ["2026-05-27-defence-experts-warn-of-fitness-tracker-risks-in-singapore-m", "Cybersecurity Threats"],
  ["2026-05-27-hormuz-is-not-the-only-weak-spot-for-global-trade", "Supply Chain Analysis"],
  ["2026-05-27-hormuz-is-not-the-only-weak-spot-for-global-trade", "Geopolitical Risk Assessment"],
  ["2026-05-27-hormuz-is-not-the-only-weak-spot-for-global-trade", "International Trade Networks"],
  ["2026-05-27-memory-chip-price-surge-hits-computer-retailers-as-customers", "Semiconductor Supply Chain"],
  ["2026-05-27-memory-chip-price-surge-hits-computer-retailers-as-customers", "Hardware Market Trends"],
  ["2026-05-27-memory-chip-price-surge-hits-computer-retailers-as-customers", "Electronics Retail"],
  ["2026-05-27-memory-chip-price-surge-hits-computer-retailers-as-customers", "Computer Hardware Economics"],
  ["2026-05-27-military-applications-of-gis", "Geospatial Intelligence"],
  ["2026-05-27-military-applications-of-gis", "Defense Applications"],
  ["2026-05-27-military-applications-of-gis", "Spatial Analysis"],
  ["2026-05-27-military-applications-of-gis", "GIS Technology"],
  ["2026-05-27-ministry-of-defence-singapore-latest-release-april-2026", "Defence GIS Applications"],
  ["2026-05-27-ministry-of-defence-singapore-latest-release-april-2026", "Geospatial Intelligence"],
  ["2026-05-27-ministry-of-defence-singapore-latest-release-april-2026", "Government Data Systems"],
  ["2026-05-27-our-favorite-management-tips-on-leading-when-youre-overwhelm", "Leadership Development"],
  ["2026-05-27-our-favorite-management-tips-on-leading-when-youre-overwhelm", "Burnout Prevention"],
  ["2026-05-27-our-favorite-management-tips-on-leading-when-youre-overwhelm", "Stress Management"],
  ["2026-05-27-our-favorite-management-tips-on-leading-when-youre-overwhelm", "Team Management"],
  ["2026-05-27-refreshed-ns-medical-classification-system-to-take-effect-fr", "Military Health Assessment"],
  ["2026-05-27-refreshed-ns-medical-classification-system-to-take-effect-fr", "Defense Policy Implementation"],
  ["2026-05-27-refreshed-ns-medical-classification-system-to-take-effect-fr", "Workforce Classification Systems"],
  ["2026-05-27-refreshed-ns-medical-classification-system-to-take-effect-fr", "Personnel Deployment Optimization"],
  ["2026-05-27-singapore-must-continue-to-pay-particular-attention-to-defen", "Drone Technology"],
  ["2026-05-27-singapore-must-continue-to-pay-particular-attention-to-defen", "Military Innovation"],
  ["2026-05-27-singapore-must-continue-to-pay-particular-attention-to-defen", "Geopolitical Risk"],
  ["2026-05-27-singapore-must-continue-to-pay-particular-attention-to-defen", "Unmanned Aerial Systems"],
  ["2026-05-27-targeting-turbineone-frontline-perception-system", "Machine Learning"],
  ["2026-05-27-targeting-turbineone-frontline-perception-system", "Automatic Target Recognition"],
  ["2026-05-27-targeting-turbineone-frontline-perception-system", "Intelligence Analysis"],
  ["2026-05-27-targeting-turbineone-frontline-perception-system", "Sensor Data Processing"],
  ["2026-05-27-the-power-of-spatial-analysis", "GIS Fundamentals"],
  ["2026-05-27-the-power-of-spatial-analysis", "Spatial Analysis Techniques"],
  ["2026-05-27-the-power-of-spatial-analysis", "Geospatial Data"],
  ["2026-05-27-the-power-of-spatial-analysis", "ArcGIS"],
  ["2026-05-27-ukraine-iran-war-coverage", "Geopolitical Analysis"],
  ["2026-05-27-ukraine-iran-war-coverage", "Conflict Mapping"],
  ["2026-05-27-ukraine-iran-war-coverage", "Regional Security"],
  ["2026-05-27-ukraine-seeks-god-mode-with-new-control-app-for-drone-war", "Command And Control Systems"],
  ["2026-05-27-ukraine-seeks-god-mode-with-new-control-app-for-drone-war", "Unmanned Aerial Systems"],
  ["2026-05-27-ukraine-seeks-god-mode-with-new-control-app-for-drone-war", "Battlefield Data Management"],
  ["2026-05-27-ukraine-seeks-god-mode-with-new-control-app-for-drone-war", "Military GIS Applications"],
];

// Base URL for article links
const base = window.location.origin + window.location.pathname.replace(/graph.*/, '');

function initGraph() {
  // Recreate nodes and links fresh each time — D3 mutates these objects during simulation
  const topicSet = {};
  links_raw.forEach(([, topic]) => { topicSet[topic] = true; });
  const topics = Object.keys(topicSet).map(t => ({ id: t, label: t, type: "topic" }));
  const nodes  = [...articles.map(a => ({...a})), ...topics];
  const links  = links_raw.map(([source, target]) => ({ source, target }));
  const container = document.getElementById('graph-container');
  const tooltip   = document.getElementById('graph-tooltip');
  const svgEl     = document.getElementById('graph-svg');

  // Clear any previous render
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  const w = container.clientWidth  || 800;
  const h = container.clientHeight || 620;

  const svg = d3.select(svgEl);
  const g   = svg.append('g');

  const zoom = d3.zoom().scaleExtent([0.2, 3]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoom);

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('collision', d3.forceCollide(30));

  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#D4C4B0')
    .attr('stroke-width', 1.5);

  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => d.type === 'article' ? 10 : 6)
    .attr('fill', d => d.type === 'article' ? '#7DD5D2' : '#B8A898')
    .attr('stroke', d => d.type === 'article' ? '#5ABFBB' : '#8A7060')
    .attr('stroke-width', 1.5)
    .style('cursor', d => d.type === 'article' ? 'pointer' : 'default')
    .call(d3.drag()
      .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
    .on('mouseover', (e, d) => {
      tooltip.style.opacity = '1';
      tooltip.textContent = d.label;
      const connected = new Set();
      links.forEach(l => {
        if (l.source.id === d.id) connected.add(l.target.id);
        if (l.target.id === d.id) connected.add(l.source.id);
      });
      node.attr('opacity', n => n.id === d.id || connected.has(n.id) ? 1 : 0.2);
      link.attr('opacity', l => l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);
    })
    .on('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top  = (e.clientY - rect.top  - 28) + 'px';
    })
    .on('mouseout', () => {
      tooltip.style.opacity = '0';
      node.attr('opacity', 1);
      link.attr('opacity', 1);
    })
    .on('click', (e, d) => {
      if (d.type === 'article') {
        window.location.href = base + 'articles/' + d.id + '/';
      }
    });

  sim.on('tick', () => {
    link
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  });

  // After simulation settles, auto-fit all nodes into view
  sim.on('end', () => {
    const xs = nodes.map(d => d.x);
    const ys = nodes.map(d => d.y);
    const x0 = Math.min(...xs) - 40, x1 = Math.max(...xs) + 40;
    const y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 40;
    const scale = Math.min(0.9, w / (x1 - x0), h / (y1 - y0));
    const tx = (w - scale * (x0 + x1)) / 2;
    const ty = (h - scale * (y0 + y1)) / 2;
    svg.transition().duration(600)
      .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  });
}

// Init on page load — also re-init on MkDocs SPA navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGraph);
} else {
  initGraph();
}
// MkDocs instant navigation re-fires content — re-init after tab switch
document.addEventListener('DOMContentMutated', initGraph);
// Fallback: re-init when page becomes visible (handles tab switching)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) initGraph();
});

})();
</script>
