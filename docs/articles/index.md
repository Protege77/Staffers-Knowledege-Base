---
title: Articles
---

# Articles

All articles submitted by the community, sorted newest first.

<style>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  margin: 1.2rem 0 1rem 0;
}
.filter-search {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 0.9rem;
  border: 1.5px solid #F0E6D4;
  border-radius: 8px;
  font-size: 0.9rem;
  background: #FFF6E8;
  color: #3A2A1A;
  outline: none;
}
.filter-search:focus { border-color: #7DD5D2; }
.filter-cats { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.cat-btn {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1.5px solid #D4C4B0;
  background: transparent;
  font-size: 0.8rem;
  color: #5C4A3A;
  cursor: pointer;
  transition: all 0.15s;
}
.cat-btn:hover { background: #F0E6D4; }
.cat-btn.active { background: #7DD5D2; border-color: #7DD5D2; color: #3A2A1A; font-weight: 600; }
.articles-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
.articles-table th {
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #B8A898;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #F0E6D4;
}
.articles-table td {
  padding: 0.6rem 0.6rem;
  border-bottom: 1px solid #F0E6D4;
  font-size: 0.92rem;
  vertical-align: middle;
}
.articles-table tr:last-child td { border-bottom: none; }
.articles-table tr.hidden { display: none; }
.cat-badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}
.cat-gis       { background: #d1f0ef; color: #2a7a77; }
.cat-news      { background: #fde8cc; color: #8a4e0f; }
.cat-other     { background: #ece8e3; color: #6b5c4e; }
.no-results {
  text-align: center;
  color: #B8A898;
  font-size: 0.9rem;
  padding: 2rem 0;
  display: none;
}
</style>

<div class="filter-bar">
  <input class="filter-search" id="article-search" type="text" placeholder="Search articles…" oninput="filterArticles()" />
  <div class="filter-cats" id="cat-buttons">
    <button class="cat-btn active" data-cat="all" onclick="setCat(this)">All</button>
    <!-- category buttons are injected dynamically by buildCatButtons() -->
  </div>
</div>

<table class="articles-table" id="articles-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Title</th>
      <th>Category</th>
    </tr>
  </thead>
  <tbody>
    <tr data-cat="GIS" data-title="the power of spatial analysis">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-the-power-of-spatial-analysis/">The Power of Spatial Analysis</a></td>
      <td><span class="cat-badge cat-gis">GIS</span></td>
    </tr>
    <tr data-cat="GIS" data-title="military applications of gis">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-military-applications-of-gis/">Military Applications of GIS</a></td>
      <td><span class="cat-badge cat-gis">GIS</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="ukraine seeks god mode with new control app for drone war">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-ukraine-seeks-god-mode-with-new-control-app-for-drone-war/">Ukraine Seeks God Mode with New Control App for Drone War</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="targeting turbineone frontline perception system">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-targeting-turbineone-frontline-perception-system/">Targeting - TurbineOne Frontline Perception System</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="america downs cheap drones with million-dollar missiles">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-america-downs-cheap-drones-with-million-dollar-missiles-a-fi/">America Downs Cheap Drones with Million-Dollar Missiles</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="ai got the blame for the iran school bombing the truth is far more worrying">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-ai-got-the-blame-for-the-iran-school-bombing-the-truth-is-fa/">AI got the blame for the Iran school bombing. The truth is far more worrying</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="hormuz is not the only weak spot for global trade">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-hormuz-is-not-the-only-weak-spot-for-global-trade/">Hormuz Is Not the Only Weak Spot for Global Trade</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="memory chip price surge hits computer retailers">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-memory-chip-price-surge-hits-computer-retailers-as-customers/">Memory Chip Price Surge Hits Computer Retailers</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="defence experts warn of fitness tracker risks in singapore military bases">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-defence-experts-warn-of-fitness-tracker-risks-in-singapore-m/">Defence experts warn of fitness tracker risks in Singapore military bases</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="refreshed ns medical classification system to take effect from october 2027">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-refreshed-ns-medical-classification-system-to-take-effect-fr/">Refreshed NS Medical Classification System to Take Effect from October 2027</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="singapore must continue to pay particular attention to defence">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-singapore-must-continue-to-pay-particular-attention-to-defen/">Singapore must continue to pay particular attention to defence</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="ministry of defence singapore latest release april 2026">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-ministry-of-defence-singapore-latest-release-april-2026/">Ministry of Defence Singapore Latest Release - April 2026</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Industry News" data-title="ukraine iran war coverage">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-ukraine-iran-war-coverage/">Ukraine-Iran War Coverage</a></td>
      <td><span class="cat-badge cat-news">Industry News</span></td>
    </tr>
    <tr data-cat="Other" data-title="our favorite management tips on leading when overwhelmed">
      <td>27 May 2026</td>
      <td><a href="2026-05-27-our-favorite-management-tips-on-leading-when-youre-overwhelm/">Our Favorite Management Tips on Leading When You're Overwhelmed</a></td>
      <td><span class="cat-badge cat-other">Other</span></td>
    </tr>
  </tbody>
</table>

<div class="no-results" id="no-results">No articles match your search.</div>

<script>
let _activeCat = 'all';

// Build category filter buttons dynamically from whatever categories exist in the table.
// This means new categories added by the pipeline appear automatically — no manual updates needed.
function buildCatButtons() {
  const cats = new Set();
  document.querySelectorAll('#articles-table tbody tr').forEach(row => {
    if (row.dataset.cat) cats.add(row.dataset.cat);
  });
  const container = document.getElementById('cat-buttons');
  // Remove any previously injected buttons (leave the "All" button)
  container.querySelectorAll('[data-cat]:not([data-cat="all"])').forEach(b => b.remove());
  [...cats].sort().forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.onclick = function() { setCat(this); };
    container.appendChild(btn);
  });
}

function setCat(btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  _activeCat = btn.dataset.cat;
  filterArticles();
}

function filterArticles() {
  const query = document.getElementById('article-search').value.toLowerCase();
  const rows  = document.querySelectorAll('#articles-table tbody tr');
  let visible = 0;
  rows.forEach(row => {
    const matchCat  = _activeCat === 'all' || row.dataset.cat === _activeCat;
    const matchText = row.dataset.title.includes(query);
    const show = matchCat && matchText;
    row.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  document.getElementById('no-results').style.display = visible === 0 ? 'block' : 'none';
}

// Run on page load — works with both MkDocs instant navigation and direct page loads
if (typeof document$ !== 'undefined') {
  document$.subscribe(function() { buildCatButtons(); });
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildCatButtons);
  } else {
    buildCatButtons();
  }
}
</script>
