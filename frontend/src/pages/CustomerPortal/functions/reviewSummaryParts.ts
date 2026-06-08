export type HighlightedSummaryPart = { text: string; highlighted: boolean }

export function highlightedSummaryParts(summary: string, highlights: string[]) {
  const cleanHighlights = highlights.filter((item) => item.trim() && summary.includes(item)).slice(0, 4)
  const parts: HighlightedSummaryPart[] = []
  let cursor = 0

  while (cursor < summary.length) {
    const next = cleanHighlights
      .map((highlight) => ({ highlight, index: summary.indexOf(highlight, cursor) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => a.index - b.index || b.highlight.length - a.highlight.length)[0]

    if (!next) {
      parts.push({ text: summary.slice(cursor), highlighted: false })
      break
    }

    if (next.index > cursor) {
      parts.push({ text: summary.slice(cursor, next.index), highlighted: false })
    }
    parts.push({ text: next.highlight, highlighted: true })
    cursor = next.index + next.highlight.length
  }

  return parts
}
