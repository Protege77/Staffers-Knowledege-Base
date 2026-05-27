---
title: Ask the Knowledge Base
---

# Ask the Knowledge Base

Ask a question about the articles in this knowledge base. Answers are drawn from published article summaries, with Claude used when the backend is available.

<style>
.ask-wrap { max-width: 680px; margin: 0 auto; }
.ask-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.ask-input { flex: 1; padding: 0.65rem 1rem; border: 1.5px solid var(--lightgray); border-radius: 8px; font-size: 1rem; font-family: inherit; background: var(--light); color: var(--dark); outline: none; min-width: 0; }
.ask-input:focus { border-color: var(--secondary); }
.ask-btn { padding: 0.65rem 1.2rem; background: var(--secondary); color: var(--dark); border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
.ask-btn:hover { opacity: 0.85; }
.ask-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.answer-box { background: var(--highlight); border-left: 3px solid var(--secondary); border-radius: 0 8px 8px 0; padding: 1rem 1.2rem; font-size: 1rem; line-height: 1.75; color: var(--dark); display: none; }
.answer-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray); font-weight: 600; margin-bottom: 0.4rem; }
.error-box { background: #fee2e2; color: #b91c1c; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.9rem; display: none; }
.loading { display: none; align-items: center; gap: 0.5rem; color: var(--gray); font-size: 0.9rem; margin-bottom: 1rem; }
.spinner { width: 16px; height: 16px; border: 2px solid var(--lightgray); border-top-color: var(--secondary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.example-questions { margin-bottom: 1.5rem; }
.example-questions p { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray); font-weight: 600; margin-bottom: 0.5rem; }
.example-chip { display: inline-block; margin: 0.2rem 0.3rem 0.2rem 0; padding: 0.25rem 0.7rem; background: var(--lightgray); border-radius: 999px; font-size: 0.82rem; color: var(--darkgray); cursor: pointer; transition: background 0.15s; }
.example-chip:hover { background: var(--secondary); color: var(--dark); }
</style>

<div class="ask-wrap">
  <div class="example-questions">
    <p>Try asking</p>
    <span class="example-chip" data-question="What GIS tools are used in military operations?">What GIS tools are used in military operations?</span>
    <span class="example-chip" data-question="How are drones changing modern warfare?">How are drones changing modern warfare?</span>
    <span class="example-chip" data-question="What are the risks of fitness trackers in defence?">What are the risks of fitness trackers in defence?</span>
    <span class="example-chip" data-question="What spatial analysis techniques are covered?">What spatial analysis techniques are covered?</span>
  </div>
  <div class="ask-form">
    <input class="ask-input" id="ask-input" type="text" placeholder="Ask anything about the articles..." />
    <button class="ask-btn" id="ask-btn" type="button">Ask</button>
  </div>
  <div class="loading" id="loading">
    <div class="spinner"></div> Searching the knowledge base...
  </div>
  <div class="error-box" id="error-box"></div>
  <div class="answer-box" id="answer-box">
    <div class="answer-label" id="answer-label">Answer</div>
    <div id="answer-text"></div>
  </div>
</div>
