---
title: The Field Notes
---

A centralised knowledge base for staffers to store, share, and rediscover reference materials. Submit any link and our AI pipeline automatically analyses, classifies, and organises it - so the team's collective knowledge is always easy to find.

Browse the latest articles, filter by tags, or submit an article worth sharing with the community.

<style>
.home-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-top: 1.5rem;
}
.home-sidebar {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.home-main {
  flex: 1;
  min-width: 0;
}
.stat-card {
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  padding: 1rem 0.8rem;
  text-align: center;
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--secondary);
  line-height: 1;
  margin-bottom: 0.3rem;
}
.stat-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--gray);
  font-weight: 600;
}
.stat-sub {
  font-size: 0.68rem;
  color: var(--gray);
  margin-top: 0.2rem;
}
.home-graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 0.5rem 0;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.home-graph-header h2 {
  margin: 0;
  font-size: 1.1rem;
}
.home-graph-header p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--gray);
}
@media (max-width: 600px) {
  .home-layout { flex-direction: column; }
  .home-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .stat-card { flex: 1; min-width: 120px; }
}
</style>

<div class="home-layout">

  <div class="home-sidebar">
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

  <div class="home-main">
    <div class="home-graph-header">
      <div>
        <h2>Knowledge Graph</h2>
        <p>Click a node to open the article · Drag to move · Scroll to zoom</p>
      </div>
      <a href="./graph" data-no-popover="true" style="display:inline-block;padding:0.45rem 1rem;background:var(--secondary);color:var(--dark) !important;border-radius:8px;font-size:0.85rem;font-weight:600;text-decoration:none !important;">View Full Graph</a>
    </div>
    <div id="home-graph-container" style="width:100%;height:500px;background:var(--light);border-radius:12px;border:1px solid var(--lightgray);overflow:hidden;position:relative;">
      <div id="home-graph-tooltip" style="position:absolute;background:var(--dark);color:var(--light);padding:6px 10px;border-radius:6px;font-size:0.78rem;pointer-events:none;opacity:0;transition:opacity 0.15s;max-width:220px;line-height:1.4;z-index:10;"></div>
      <button id="home-graph-reset-btn" title="Reset view" style="position:absolute;top:10px;right:10px;z-index:10;background:var(--light);border:1px solid var(--lightgray);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:0.78rem;color:var(--darkgray);opacity:0.8;">Reset</button>
      <svg id="home-graph-svg" style="width:100%;height:100%;"></svg>
    </div>
    <p style="font-size:0.8rem;color:var(--gray);margin-top:0.5rem;">
      Articles are teal — click to open. Topics are gray — click to search.
    </p>
  </div>

</div>
