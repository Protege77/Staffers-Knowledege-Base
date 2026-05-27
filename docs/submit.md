---
title: Submit an Article
---

# Submit an Article

Found something worth sharing? Paste the link below and Claude will classify and summarise it automatically. It'll appear in the knowledge base within a minute.

<style>
.submit-wrapper{max-width:560px;margin:0 auto;padding:0 0 3rem}
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:1.25rem}
.field label{font-size:.875rem;font-weight:600}
.required{color:#E8806A;margin-left:2px}
.optional{font-weight:400;opacity:0.6;font-size:.8rem}
.field input,.field textarea{padding:10px 14px;border:1.5px solid #F0E6D4;border-radius:8px;font-size:.95rem;font-family:inherit;outline:none;width:100%;box-sizing:border-box}
.field input:focus,.field textarea:focus{border-color:#7DD5D2}
.field textarea{resize:vertical}
button[type=submit]{width:100%;padding:12px;background:#7DD5D2;color:#3A2A1A;border:none;border-radius:8px;font-size:.95rem;font-weight:600;cursor:pointer;transition:opacity .15s;margin-top:.5rem}
button[type=submit]:hover{opacity:.88}
button[type=submit]:disabled{opacity:.55;cursor:not-allowed}
.message{margin-top:1.25rem;padding:12px 16px;border-radius:8px;font-size:.9rem;font-weight:500}
.success{background:#dcfce7;color:#15803d}
.error{background:#fee2e2;color:#b91c1c}
</style>

<div class="submit-wrapper">
<form id="submitForm">
  <div class="field">
    <label for="url">Article URL <span class="required">*</span></label>
    <input type="url" id="url" name="url" placeholder="https://..." required />
  </div>
  <div class="field">
    <label for="submitter">Your Name <span class="required">*</span></label>
    <input type="text" id="submitter" name="submitter" placeholder="Herman" required />
  </div>
  <div class="field">
    <label for="notes">Notes <span class="optional">(optional)</span></label>
    <textarea id="notes" name="notes" rows="3" placeholder="Why is this worth reading?"></textarea>
  </div>
  <button type="submit" id="submitBtn">
    <span id="btnText">Submit Article</span>
    <span id="btnSpinner" style="display:none">Submitting…</span>
  </button>
</form>
<div id="successMsg" style="display:none" class="message success">✓ Article submitted! It will appear in the knowledge base within a minute.</div>
<div id="errorMsg" style="display:none" class="message error">✗ Something went wrong. Please try again.</div>
</div>

<script>
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuAxU3vIu89wXtEo6c0oO60StgSbHIBNJfy47riDfTMDURQTjZ4oj-nedkBMr3izNe/exec';
document.getElementById('submitForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const url       = document.getElementById('url').value.trim();
  const submitter = document.getElementById('submitter').value.trim();
  const notes     = document.getElementById('notes').value.trim();
  const btn       = document.getElementById('submitBtn');
  const btnText   = document.getElementById('btnText');
  const spinner   = document.getElementById('btnSpinner');
  const success   = document.getElementById('successMsg');
  const error     = document.getElementById('errorMsg');
  success.style.display = 'none';
  error.style.display   = 'none';
  btn.disabled          = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline';
  try {
    const body = new URLSearchParams({ url, submitter, notes });
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
    success.style.display = 'block';
    document.getElementById('submitForm').reset();
  } catch(err) {
    error.style.display = 'block';
  } finally {
    btn.disabled          = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
});
</script>
