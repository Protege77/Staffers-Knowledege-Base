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
  const heading = document.getElementById("related-topics")
  if (!heading) return

  let el: Element | null = heading.nextElementSibling
  while (el && el.tagName !== "H2") {
    if (el.tagName === "UL" || el.tagName === "OL") {
      el.querySelectorAll("a").forEach((anchor) => {
        const label = anchor.textContent?.trim() ?? ""
        if (!label) return

        anchor.classList.add("topic-search-link")
        anchor.setAttribute("data-router-ignore", "")
        anchor.setAttribute("href", "#")
        anchor.setAttribute("title", `Search for "${label}"`)

        const onClick = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          openTopicSearch(label)
        }
        anchor.addEventListener("click", onClick, true)
        window.addCleanup(() => anchor.removeEventListener("click", onClick, true))
      })
      break
    }
    el = el.nextElementSibling
  }
}

document.addEventListener("nav", wireRelatedTopicLinks)
wireRelatedTopicLinks()
