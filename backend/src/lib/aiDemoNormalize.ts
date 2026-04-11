/** Normalize seeded / legacy AI cache JSON to the shape the API returns to the client. */

export function normalizeSimplifyResult(content: unknown): Record<string, unknown> {
  const c = content as Record<string, unknown>
  if (c && typeof c.plain_summary === 'string') return c

  if (c && typeof c.summary === 'string') {
    return {
      plain_summary: c.summary,
      key_findings: Array.isArray(c.keyFindings) ? c.keyFindings : [],
      methodology_type: (c.methodology_type as string) || 'Systematic Review',
      methodology_detail:
        (c.methodology_detail as string) ||
        'Review of peer-reviewed studies (2019–2024) across radiology, pathology, and ophthalmology.',
      limitations: Array.isArray(c.limitations) ? c.limitations : [],
      study_population:
        (c.study_population as string) ||
        'Synthesised evidence from 200+ imaging studies; modalities and cohort sizes vary by paper.',
    }
  }

  return c as Record<string, unknown>
}

export function normalizeProjectIdeasResult(content: unknown): unknown[] {
  if (Array.isArray(content)) return content
  const c = content as { ideas?: unknown[] }
  if (c?.ideas && Array.isArray(c.ideas)) {
    const mapDiff = (d: unknown) => {
      const s = String(d || '').toLowerCase()
      if (s.includes('advanced')) return 'advanced'
      if (s.includes('beginner')) return 'beginner'
      return 'intermediate'
    }
    return c.ideas.map((raw: unknown) => {
      const idea = raw as Record<string, unknown>
      return {
        difficulty: mapDiff(idea.difficulty),
        estimated_weeks: typeof idea.estimated_weeks === 'number' ? idea.estimated_weeks : 4,
        project_title: (idea.title as string) || (idea.project_title as string) || 'Project',
        problem_statement: (idea.description as string) || (idea.problem_statement as string) || '',
        approach: (idea.approach as string) || (idea.description as string) || '',
        tech_stack: Array.isArray(idea.techStack) ? idea.techStack : idea.tech_stack || ['Python'],
        dataset_name: (idea.dataset as string) || (idea.dataset_name as string) || '',
        dataset_url: (idea.dataset_url as string) || 'https://example.com',
      }
    })
  }
  return []
}

export function normalizeConceptPathResult(content: unknown): { concepts: unknown[] } {
  const c = content as { concepts?: unknown[] }
  if (!c?.concepts || !Array.isArray(c.concepts)) return { concepts: [] }

  const first = c.concepts[0] as Record<string, unknown> | undefined
  if (first && typeof first.concept_name === 'string') {
    return { concepts: c.concepts }
  }

  return {
    concepts: c.concepts.map((raw: unknown) => {
      const x = raw as Record<string, unknown>
      return {
        concept_name: (x.name as string) || (x.concept_name as string) || 'Concept',
        why_needed: (x.description as string) || (x.why_needed as string) || '',
        resource_type: (x.resource_type as string) || 'article',
        resource_title: (x.resource as string)?.split('—')[0]?.trim() || 'Resource',
        resource_url:
          typeof x.resource === 'string' && x.resource.includes('http')
            ? (x.resource.match(/https?:\/\/[^\s]+/) || [])[0] || 'https://example.com'
            : (x.resource_url as string) || 'https://example.com',
      }
    }),
  }
}

export function claudeConfigured(): boolean {
  const k = process.env.CLAUDE_API_KEY
  return !!k && k !== 'placeholder' && k.length > 10
}
