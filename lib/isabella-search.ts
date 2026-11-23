type SearchableRecord = { title: string; searchText: string }

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
}

export function rankPublicRecords<T extends SearchableRecord>(query: string, records: T[], limit = 5) {
  const terms = [...new Set(normalize(query).match(/[\p{L}\p{N}]{2,}/gu) ?? [])].slice(0, 12)
  if (terms.length === 0) return []

  return records
    .map((record, index) => {
      const title = normalize(record.title)
      const text = normalize(`${record.title} ${record.searchText}`)
      const matchedTerms = terms.filter((term) => text.includes(term))
      const titleMatches = terms.filter((term) => title.includes(term)).length
      return { record, index, score: matchedTerms.length + titleMatches * 2 }
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, Math.max(1, Math.min(8, limit)))
    .map(({ record }) => record)
}
