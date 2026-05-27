const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw3_FE2AVyP-dQIzkJ5w5ysVWFG-O36cMxveGQ5Jgdc1LdWqxaOVs3MrlDloUoWc13uZA/exec"

type SubmitResponse = {
  success?: boolean
  message?: string
}

async function postToGas(body: URLSearchParams): Promise<SubmitResponse> {
  const res = await fetch(SCRIPT_URL, { method: "POST", body })
  const contentType = res.headers.get("content-type") ?? ""

  if (!contentType.includes("json")) {
    throw new Error("Unexpected response from the submission service. Please try again.")
  }

  const data = (await res.json()) as SubmitResponse
  if (data.success) return data

  throw new Error(data.message || "Submission failed. Please try again.")
}

async function submitArticle(e?: Event) {
  e?.preventDefault()

  const form = document.getElementById("submitForm") as HTMLFormElement | null
  const urlInput = document.getElementById("url") as HTMLInputElement | null
  const submitterInput = document.getElementById("submitter") as HTMLInputElement | null
  const notesInput = document.getElementById("notes") as HTMLTextAreaElement | null
  const btn = document.getElementById("submitBtn") as HTMLButtonElement | null
  const btnText = document.getElementById("btnText") as HTMLElement | null
  const spinner = document.getElementById("btnSpinner") as HTMLElement | null
  const success = document.getElementById("successMsg") as HTMLElement | null
  const error = document.getElementById("errorMsg") as HTMLElement | null

  if (!form || !urlInput || !submitterInput || !notesInput || !btn || !btnText || !spinner || !success || !error) {
    return
  }

  const url = urlInput.value.trim()
  const submitter = submitterInput.value.trim()
  const notes = notesInput.value.trim()

  if (!url || !submitter) return

  success.style.display = "none"
  error.style.display = "none"
  btn.disabled = true
  btnText.style.display = "none"
  spinner.style.display = "inline"

  try {
    const body = new URLSearchParams({ url, submitter, notes })
    const data = await postToGas(body)
    const title = data.message?.trim()

    success.textContent = title
      ? `✓ Article submitted: “${title}”. It will appear in the knowledge base within a minute.`
      : "✓ Article submitted! It will appear in the knowledge base within a minute."
    success.style.display = "block"
    form.reset()
  } catch (err) {
    error.textContent =
      "✗ " + (err instanceof Error ? err.message : "Something went wrong. Please try again.")
    error.style.display = "block"
  } finally {
    btn.disabled = false
    btnText.style.display = "inline"
    spinner.style.display = "none"
  }
}

function initSubmitPage() {
  const form = document.getElementById("submitForm") as HTMLFormElement | null
  if (!form) return

  const onSubmit = (e: Event) => {
    void submitArticle(e)
  }

  form.addEventListener("submit", onSubmit)
  window.addCleanup(() => form.removeEventListener("submit", onSubmit))
}

document.addEventListener("nav", () => {
  initSubmitPage()
})

initSubmitPage()
