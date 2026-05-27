---
title: Home
---

# The Field Notes

A centralised knowledge base for staffers to store, share, and rediscover reference materials. Submit any link and our AI pipeline automatically analyses, classifies, and organises it — so the team's collective knowledge is always easy to find.

Browse the [latest articles](articles/index.md), filter by [tags](tags.md), or [submit an article](submit.md) worth sharing with the community.

<style>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}
.stat-card {
  background: #FFF6E8;
  border: 1px solid #F0E6D4;
  border-radius: 10px;
  padding: 1.2rem 1rem;
  text-align: center;
}
.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #7DD5D2;
  line-height: 1;
  margin-bottom: 0.3rem;
}
.stat-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8A7060;
  font-weight: 600;
}
.stat-sub {
  font-size: 0.72rem;
  color: #B8A898;
  margin-top: 0.2rem;
}
.graph-preview {
  background: #FFF6E8;
  border: 1px solid #F0E6D4;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.graph-preview-left h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  color: #3A2A1A;
}
.graph-preview-left p {
  margin: 0;
  font-size: 0.85rem;
  color: #8A7060;
}
.graph-preview-btn {
  display: inline-block;
  padding: 0.55rem 1.2rem;
  background: #7DD5D2;
  color: #3A2A1A !important;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none !important;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.graph-preview-btn:hover { opacity: 0.85; }
.mini-graph-wrap {
  flex: 1;
  min-width: 200px;
  max-width: 340px;
  height: 130px;
  border-radius: 8px;
  overflow: hidden;
  background: #FFF6E8;
}
</style>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">16</div>
    <div class="stat-label">Articles</div>
    <div class="stat-sub">in the knowledge base</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">71</div>
    <div class="stat-label">Tags</div>
    <div class="stat-sub">across all articles</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">50</div>
    <div class="stat-label">Topics</div>
    <div class="stat-sub">AI-identified connections</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">4</div>
    <div class="stat-label">Categories</div>
    <div class="stat-sub">GIS · Data Science · News · Other</div>
  </div>
</div>

<div class="graph-preview">
  <div class="graph-preview-left">
    <h3>🗺️ Knowledge Graph</h3>
    <p>See how articles connect to topics and each other. Click any node to explore.</p>
    <br>
    <a class="graph-preview-btn" href="graph/">View Full Graph →</a>
  </div>
  <div class="mini-graph-wrap">
    <svg id="mini-graph-svg" style="width:100%;height:100%;"></svg>
  </div>
</div>

<script>
(function() {
  const articles = [
    { id: "a1", type: "article" }, { id: "a2", type: "article" },
    { id: "a3", type: "article" }, { id: "a4", type: "article" },
    { id: "a5", type: "article" }, { id: "a6", type: "article" },
    { id: "a7", type: "article" }, { id: "a8", type: "article" },
    { id: "a9", type: "article" }, { id: "a10", type: "article" },
    { id: "a11", type: "article" }, { id: "a12", type: "article" },
    { id: "a13", type: "article" }, { id: "a14", type: "article" },
    { id: "a15", type: "article" }, { id: "a16", type: "article" },
  ];
  const topicIds = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10",
                    "t11","t12","t13","t14","t15","t16","t17","t18","t19","t20"];
  const topics = topicIds.map(id => ({ id, type: "topic" }));
  const nodes = [...articles, ...topics];
  const links = [
    {source:"a1",target:"t1"},{source:"a1",target:"t2"},
    {source:"a2",target:"t2"},{source:"a2",target:"t3"},
    {source:"a3",target:"t3"},{source:"a3",target:"t4"},
    {source:"a4",target:"t4"},{source:"a4",target:"t5"},
    {source:"a5",target:"t5"},{source:"a5",target:"t6"},
    {source:"a6",target:"t1"},{source:"a6",target:"t7"},
    {source:"a7",target:"t7"},{source:"a7",target:"t8"},
    {source:"a8",target:"t8"},{source:"a8",target:"t9"},
    {source:"a9",target:"t9"},{source:"a9",target:"t10"},
    {source:"a10",target:"t10"},{source:"a10",target:"t11"},
    {source:"a11",target:"t11"},{source:"a11",target:"t12"},
    {source:"a12",target:"t12"},{source:"a12",target:"t13"},
    {source:"a13",target:"t13"},{source:"a13",target:"t14"},
    {source:"a14",target:"t14"},{source:"a14",target:"t15"},
    {source:"a15",target:"t15"},{source:"a15",target:"t16"},
    {source:"a16",target:"t16"},{source:"a16",target:"t17"},
    {source:"a1",target:"t18"},{source:"a5",target:"t19"},
    {source:"a9",target:"t20"},{source:"a13",target:"t18"},
  ];

  function initMiniGraph() {
    const svgEl = document.getElementById('mini-graph-svg');
    if (!svgEl || typeof d3 === 'undefined') return;
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

    const w = svgEl.clientWidth || 340;
    const h = svgEl.clientHeight || 130;

    const freshNodes = nodes.map(n => ({...n}));
    const freshLinks = links.map(l => ({...l}));

    const svg = d3.select(svgEl);
    const g = svg.append('g');

    const sim = d3.forceSimulation(freshNodes)
      .force('link', d3.forceLink(freshLinks).id(d => d.id).distance(28))
      .force('charge', d3.forceManyBody().strength(-60))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide(10))
      .alphaDecay(0.04);

    const link = g.append('g').selectAll('line').data(freshLinks).join('line')
      .attr('stroke', '#D4C4B0').attr('stroke-width', 1);

    const node = g.append('g').selectAll('circle').data(freshNodes).join('circle')
      .attr('r', d => d.type === 'article' ? 6 : 3.5)
      .attr('fill', d => d.type === 'article' ? '#7DD5D2' : '#B8A898')
      .attr('stroke', d => d.type === 'article' ? '#5ABFBB' : '#8A7060')
      .attr('stroke-width', 1);

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y);
    });
  }

  if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
      if (document.getElementById('mini-graph-svg')) initMiniGraph();
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMiniGraph);
    } else {
      initMiniGraph();
    }
  }
})();
</script>
