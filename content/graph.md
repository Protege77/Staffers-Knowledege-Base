---
title: Knowledge Graph
---

# Knowledge Graph

Articles and their connected topics — click a node to open the article, drag to explore.

<div id="graph-container" style="width:100%;height:620px;background:var(--light);border-radius:12px;border:1px solid var(--lightgray);overflow:hidden;position:relative;">
  <div id="graph-tooltip" style="position:absolute;background:var(--dark);color:var(--light);padding:6px 10px;border-radius:6px;font-size:0.78rem;pointer-events:none;opacity:0;transition:opacity 0.15s;max-width:220px;line-height:1.4;z-index:10;"></div>
  <button id="graph-reset-btn" title="Reset view" style="position:absolute;top:10px;right:10px;z-index:10;background:var(--light);border:1px solid var(--lightgray);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:0.78rem;color:var(--darkgray);opacity:0.8;transition:opacity 0.2s;">Reset</button>
  <svg id="graph-svg" style="width:100%;height:100%;"></svg>
</div>

<p style="font-size:0.8rem;color:var(--gray);margin-top:0.5rem;">
  Articles are teal — click to open. Topics are gray — click to search.
</p>
