function openTopicSearch(label: string) {
  const searchButton = document.querySelector(".search-button") as HTMLButtonElement | null
  const searchBar = document.querySelector(".search-bar") as HTMLInputElement | null
  searchButton?.click()
  if (!searchBar) return
  searchBar.value = label
  searchBar.dispatchEvent(new Event("input", { bubbles: true }))
  searchBar.focus()
}

function getTopicLabel(el: Element): string {
  return el.getAttribute("data-topic")?.trim() || el.textContent?.trim() || ""
}

function isRelatedTopicLink(el: Element): boolean {
  const list = el.closest("ul, ol")
  if (!list) return false
  const heading = list.previousElementSibling
  return heading?.id === "related-topics"
}

function handleRelatedTopicClick(e: Event) {
  const target = e.target
  if (!(target instanceof Element)) return

  const topicEl = target.closest(".topic-search-link")
  if (!topicEl || !isRelatedTopicLink(topicEl)) return

  e.preventDefault()
  e.stopImmediatePropagation()
  openTopicSearch(getTopicLabel(topicEl))
}

function handleRelatedTopicKeydown(e: KeyboardEvent) {
  if (e.key !== "Enter" && e.key !== " ") return
  handleRelatedTopicClick(e)
}

document.addEventListener("click", handleRelatedTopicClick, true)
document.addEventListener("keydown", handleRelatedTopicKeydown, true)
