function openTopicSearch(label: string) {
  const searchButton = document.querySelector(".search-button") as HTMLButtonElement | null
  const searchBar = document.querySelector(".search-bar") as HTMLInputElement | null
  searchButton?.click()
  if (!searchBar) return
  searchBar.value = label
  searchBar.dispatchEvent(new Event("input", { bubbles: true }))
  searchBar.focus()
}

function wireRelatedTopicLinks() {
  document.querySelectorAll("article h2").forEach((h2) => {
    if (h2.textContent?.trim() !== "Related Topics") return

    let el: Element | null = h2.nextElementSibling
    while (el && el.tagName !== "H2") {
      if (el.tagName === "UL" || el.tagName === "OL") {
        el.querySelectorAll("a").forEach((anchor) => {
          const label = anchor.textContent?.trim() ?? ""
          anchor.classList.add("topic-search-link")
          anchor.setAttribute("title", `Search for "${label}"`)

          const onClick = (e: Event) => {
            e.preventDefault()
            openTopicSearch(label)
          }
          anchor.addEventListener("click", onClick)
          window.addCleanup(() => anchor.removeEventListener("click", onClick))
        })
        break
      }
      el = el.nextElementSibling
    }
  })
}

document.addEventListener("nav", wireRelatedTopicLinks)
wireRelatedTopicLinks()
