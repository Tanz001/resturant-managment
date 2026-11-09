export function splitLines(element) {
  if (!element) return []
  const text = element.textContent.trim()
  const words = text.split(/\s+/)
  element.innerHTML = words
    .map(
      (word) =>
        `<span class="line-mask"><span class="word">${word}&nbsp;</span></span>`,
    )
    .join('')
  return element.querySelectorAll('.word')
}

export function splitWords(element) {
  if (!element) return []
  const text = element.textContent.trim()
  const words = text.split(/\s+/)
  element.innerHTML = words
    .map((word) => `<span class="word">${word}&nbsp;</span>`)
    .join('')
  return element.querySelectorAll('.word')
}
