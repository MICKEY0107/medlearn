'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Clock, Layers, Database } from 'lucide-react'

const DIFFICULTY_STYLES: Record<string, { pill: string; bar: string; width: string }> = {
  beginner:     { pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', bar: 'bg-emerald-500', width: 'w-1/3' },
  intermediate: { pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',         bar: 'bg-amber-500',   width: 'w-2/3' },
  advanced:     { pill: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',                 bar: 'bg-red-500',     width: 'w-full' },
}

export function ProjectIdeaCard({ idea, index }: { idea: any; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const diff = (idea.difficulty ?? 'beginner').toLowerCase()
  const styles = DIFFICULTY_STYLES[diff] ?? DIFFICULTY_STYLES.beginner

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-4 py-3.5 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${styles.pill}`}>
                {idea.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-muted-foreground font-medium">
                <Clock size={11} />
                ~{idea.estimatedWeeks} weeks
              </span>
            </div>
            <h3 className="text-[14px] font-bold text-foreground leading-snug">{idea.title}</h3>
          </div>
          <span className="shrink-0 mt-1 text-muted-foreground">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>

        {/* Difficulty bar */}
        <div className="mt-2.5 h-1 w-full bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${styles.bar} ${styles.width}`} />
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">

          {/* Problem */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">What you'll build</p>
            <p className="text-[13px] leading-[1.65] text-foreground/85">{idea.problem}</p>
          </div>

          {/* Approach */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Approach</p>
            <p className="text-[13px] leading-[1.65] text-foreground/85">{idea.approach}</p>
          </div>

          {/* Tech stack */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Layers size={11} /> Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {idea.techStack.map((tech: string) => (
                <span key={tech} className="bg-muted border border-border rounded-full px-2.5 py-0.5 text-[12px] font-medium text-foreground/80">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Dataset */}
          {idea.dataset && (
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <Database size={13} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground font-medium">Dataset:</span>
              {idea.dataset.url ? (
                <a
                  href={idea.dataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-brand hover:underline font-semibold flex items-center gap-1"
                >
                  {idea.dataset.name}
                  <ExternalLink size={11} />
                </a>
              ) : (
                <span className="text-[13px] text-foreground/80 font-semibold">{idea.dataset.name}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
