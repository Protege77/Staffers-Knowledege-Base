const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyuAxU3vIu89wXtEo6c0oO60StgSbHIBNJfy47riDfTMDURQTjZ4oj-nedkBMr3izNe/exec"

const STOPWORDS = new Set([
  "what",
  "how",
  "are",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "about",
  "does",
  "into",
  "your",
  "you",
  "can",
  "has",
  "have",
  "was",
  "were",
  "will",
  "would",
  "could",
  "should",
  "when",
  "where",
  "which",
  "who",
  "why",
  "any",
  "all",
  "use",
  "used",
  "using",
])

function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) ?? []
  return [...new Set(words.filter((word) => !STOPWORDS.has(word)))]
}

function extractSummary(content: string): string {
  const match = content.match(/Summary\n([\s\S]*?)(\nRelated Topics|\nSource|$)/)
  if (match?.[1]) return match[1].trim()

  const firstParagraph = content.split(/\n{2,}/).find((part) => part.trim().length > 0)
  return (firstParagraph ?? content).slice(0, 320).trim()
}

function scoreArticle(article: ContentDetails, terms: string[]): number {
  const title = article.title.toLowerCase()
  const body = article.content.toLowerCase()
  const tags = article.tags.join(" ").toLowerCase()

  let score = 0
  for (const term of terms) {
    if (title.includes(term)) score += 6
    if (tags.includes(term)) score += 4
    const bodyMatches = body.split(term).length - 1
    score += Math.min(bodyMatches, 5)
  }

  return score
}

async function answerFromLocalIndex(question: string): Promise<string> {
  const index = await fetchData
  const terms = tokenize(question)

  if (terms.length === 0) {
    return "Please enter a more specific question about a topic covered in the articles."
  }

  const ranked = Object.values(index)
    .filter((article) => article.slug.startsWith("articles/"))
    .map((article) => ({ article, score: scoreArticle(article, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (ranked.length === 0) {
    return "I couldn't find articles matching that question. Try a topic such as GIS, drones, spatial analysis, or Singapore defence, or browse the Articles page."
  }

  const sections = ranked.map(({ article }, index) => {
    const summary = extractSummary(article.content)
    return `${index + 1}. ${article.title}\n${summary}`
  })

  return `Based on ${ranked.length} relevant article${ranked.length === 1 ? "" : "s"} in the knowledge base:\n\n${sections.join("\n\n")}\n\nOpen the matching articles from the Articles page for full detail and sources.`
}

async function tryGasAsk(question: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({ action: "ask", question })
    // GET avoids Apps Script POST→redirect issues that return HTML instead of JSON.
    const res = await fetch(`${SCRIPT_URL}?${params.toString()}`)
    const contentType = res.headers.get("content-type") ?? ""

    if (!contentType.includes("json")) return null

    const data = (await res.json()) as { success?: boolean; answer?: string; message?: string }
    if (data.success && data.answer) return data.answer
    if (data.message) throw new Error(data.message)

    return null
  } catch (err) {
    if (err instanceof Error) throw err
    return null
  }
}

async function submitAsk(question?: string) {
  const input = document.getElementById("ask-input") as HTMLInputElement | null
  const btn = document.getElementById("ask-btn") as HTMLButtonElement | null
  const loading = document.getElementById("loading") as HTMLElement | null
  const answer = document.getElementById("answer-box") as HTMLElement | null
  const label = document.getElementById("answer-label") as HTMLElement | null
  const text = document.getElementById("answer-text") as HTMLElement | null
  const error = document.getElementById("error-box") as HTMLElement | null

  if (!input || !btn || !loading || !answer || !text || !error) return

  const q = question || input.value.trim()
  if (!q) return

  if (question) input.value = question

  answer.style.display = "none"
  error.style.display = "none"
  loading.style.display = "flex"
  btn.disabled = true

  try {
    const gasAnswer = await tryGasAsk(q)
    const answerText = gasAnswer ?? (await answerFromLocalIndex(q))

    if (label) {
      label.textContent = gasAnswer ? "Claude's answer" : "Answer from the knowledge base"
    }

    text.textContent = answerText
    answer.style.display = "block"
  } catch (err) {
    error.textContent =
      "✗ " + (err instanceof Error ? err.message : "Something went wrong. Please try again.")
    error.style.display = "block"
  } finally {
    loading.style.display = "none"
    btn.disabled = false
  }
}

function initAskPage() {
  const input = document.getElementById("ask-input") as HTMLInputElement | null
  const btn = document.getElementById("ask-btn") as HTMLButtonElement | null
  if (!input || !btn) return

  const onAskClick = () => {
    void submitAsk()
  }

  const onEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") void submitAsk()
  }

  btn.addEventListener("click", onAskClick)
  input.addEventListener("keydown", onEnter)
  window.addCleanup(() => btn.removeEventListener("click", onAskClick))
  window.addCleanup(() => input.removeEventListener("keydown", onEnter))

  document.querySelectorAll<HTMLElement>(".example-chip[data-question]").forEach((chip) => {
    const onChipClick = () => {
      const question = chip.dataset.question
      if (question) void submitAsk(question)
    }
    chip.addEventListener("click", onChipClick)
    window.addCleanup(() => chip.removeEventListener("click", onChipClick))
  })
}

document.addEventListener("nav", () => {
  initAskPage()
})

initAskPage()
