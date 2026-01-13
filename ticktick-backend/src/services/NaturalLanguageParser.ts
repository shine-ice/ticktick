export type ParsedDraft = {
  title: string
  dueAt?: string
  startAt?: string
  priority?: number
  tagNames?: string[]
  repeatRule?: string
  warnings?: string[]
}

export const NaturalLanguageParser = {
  async parse(text: string, _timezone: string): Promise<ParsedDraft> {
    // TODO: replace with full NLP parsing (dates, priorities, tags, repeat rules)
    const tagNames: string[] = []
    const re = /#([\p{L}\p{N}_-]+)/gu
    for (const m of text.matchAll(re)) tagNames.push(m[1])

    const priority = /!!/.test(text) ? 3 : /!/.test(text) ? 2 : 0
    const title = text.replace(re, '').replace(/!!/g, '').replace(/!/g, '').trim() || text.trim()

    return { title, tagNames, priority, warnings: [] }
  }
}
