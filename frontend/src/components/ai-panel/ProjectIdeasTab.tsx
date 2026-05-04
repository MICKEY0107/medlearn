import type { ProjectIdea } from '@/hooks/useAIPanel'
import { ProjectIdeaCard } from './ProjectIdeaCard'
import { AISkeleton } from './AISkeleton'
import { Rocket } from 'lucide-react'

export interface ProjectIdeasTabProps {
  ideas: ProjectIdea[] | null
  loading: boolean
  error: string
}

export function ProjectIdeasTab({ ideas, loading, error }: ProjectIdeasTabProps) {
  if (loading || (!ideas && !error)) return <AISkeleton />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-[14px] text-red-700 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!ideas || ideas.length === 0) return <AISkeleton />

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1">
        <Rocket size={15} className="text-brand" />
        <p className="text-[13px] font-semibold text-muted-foreground">
          {ideas.length} projects you could build from this paper — tap to expand
        </p>
      </div>

      {ideas.map((idea, index) => {
        const mapped = {
          difficulty: idea.difficulty,
          estimatedWeeks: idea.estimated_weeks,
          title: idea.project_title,
          problem: idea.problem_statement,
          approach: idea.approach,
          techStack: idea.tech_stack,
          dataset: idea.dataset_name ? { name: idea.dataset_name, url: idea.dataset_url } : null,
        }
        return <ProjectIdeaCard key={index} idea={mapped} index={index} />
      })}
    </div>
  )
}
