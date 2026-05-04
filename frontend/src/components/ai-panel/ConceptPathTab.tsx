import type { ConceptItem } from '@/hooks/useAIPanel'
import { ConceptCard } from './ConceptCard'
import { AISkeleton } from './AISkeleton'
import { GitBranch } from 'lucide-react'

export interface ConceptPathTabProps {
  concepts: ConceptItem[] | null
  loading: boolean
  error: string
}

export function ConceptPathTab({ concepts, loading, error }: ConceptPathTabProps) {
  if (loading || (!concepts && !error)) return <AISkeleton />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-[14px] text-red-700 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!concepts || concepts.length === 0) return <AISkeleton />

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1">
        <GitBranch size={15} className="text-brand" />
        <p className="text-[13px] font-semibold text-muted-foreground">
          {concepts.length} concepts to understand before this paper — tap to expand
        </p>
      </div>

      {concepts.map((concept, index) => {
        const mapped = {
          conceptName: concept.concept_name,
          whyNeeded: concept.why_needed,
          resource: {
            type: concept.resource_type,
            title: concept.resource_title,
            url: concept.resource_url,
          },
        }
        return <ConceptCard key={index} concept={mapped} index={index} />
      })}
    </div>
  )
}
