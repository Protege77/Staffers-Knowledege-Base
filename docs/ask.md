---
title: Ask the Knowledge Base
---

# Ask the Knowledge Base

Ask a question and Claude will answer using the articles shared by the community.

<style>
.ask-wrap { max-width: 680px; margin: 0 auto; }

.ask-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.ask-input {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1.5px solid #F0E6D4;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: #FFF6E8;
  color: #3A2A1A;
  outline: none;
  min-width: 0;
}

.ask-input:focus { border-color: #7DD5D2; }

.ask-btn {
  padding: 0.65rem 1.2rem;
  background: #7DD5D2;
  color: #3A2A1A;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.ask-btn:hover { opacity: 0.85; }
.ask-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.answer-box {
  background: rgba(255, 224, 138, 0.3);
  border-left: 3px solid #7DD5D2;
  border-radius: 0 8px 8px 0;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  line-height: 1.75;
  color: #3A2A1A;
  display: none;
}

.answer-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #B8A898;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.error-box {
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  display: none;
}

.loading {
  display: none;
  align-items: center;
  gap: 0.5rem;
  color: #B8A898;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #F0E6D4;
  border-top-color: #7DD5D2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.example-questions {
  margin-bottom: 1.5rem;
}

.example-questions p {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #B8A898;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.example-chip {
  display: inline-block;
  margin: 0.2rem 0.3rem 0.2rem 0;
  padding: 0.25rem 0.7rem;
  background: #F0E6D4;
  border-radius: 999px;
  font-size: 0.82rem;
  color: #5C4A3A;
  cursor: pointer;
  transition: background 0.15s;
}

.example-chip:hover { background: #7DD5D2; color: #3A2A1A; }
</style>

<div class="ask-wrap">

  <div class="example-questions">
    <p>Try asking</p>
    <span class="example-chip" onclick="ask(this.textContent)">What GIS tools are used in military operations?</span>
    <span class="example-chip" onclick="ask(this.textContent)">How are drones changing modern warfare?</span>
    <span class="example-chip" onclick="ask(this.textContent)">What are the risks of fitness trackers in defence?</span>
    <span class="example-chip" onclick="ask(this.textContent)">What spatial analysis techniques are covered?</span>
  </div>

  <div class="ask-form">
    <input class="ask-input" id="ask-input" type="text" placeholder="Ask anything about the articles…" />
    <button class="ask-btn" id="ask-btn" onclick="ask()">Ask</button>
  </div>

  <div class="loading" id="loading">
    <div class="spinner"></div> Claude is reading the knowledge base…
  </div>

  <div class="error-box" id="error-box"></div>

  <div class="answer-box" id="answer-box">
    <div class="answer-label">Claude's answer</div>
    <div id="answer-text"></div>
  </div>

</div>

<script>
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuAxU3vIu89wXtEo6c0oO60StgSbHIBNJfy47riDfTMDURQTjZ4oj-nedkBMr3izNe/exec';

async function ask(question) {
  const input   = document.getElementById('ask-input');
  const btn     = document.getElementById('ask-btn');
  const loading = document.getElementById('loading');
  const answer  = document.getElementById('answer-box');
  const text    = document.getElementById('answer-text');
  const error   = document.getElementById('error-box');

  const q = question || input.value.trim();
  if (!q) return;

  if (question) input.value = question;

  // Reset
  answer.style.display = 'none';
  error.style.display  = 'none';
  loading.style.display = 'flex';
  btn.disabled = true;

  try {
    const body = new URLSearchParams({ action: 'ask', question: q });
    const res  = await fetch(SCRIPT_URL, { method: 'POST', body });
    const data = await res.json();

    if (data.success) {
      text.textContent     = data.answer;
      answer.style.display = 'block';
    } else {
      error.textContent   = '✗ ' + (data.message || 'Something went wrong.');
      error.style.display = 'block';
    }
  } catch (err) {
    error.textContent   = '✗ Could not reach the knowledge base. Please try again.';
    error.style.display = 'block';
  } finally {
    loading.style.display = 'none';
    btn.disabled = false;
  }
}

document.getElementById('ask-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') ask();
});
</script>
