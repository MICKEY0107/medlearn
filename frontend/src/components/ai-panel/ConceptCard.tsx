'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

const RESOURCE_STYLES: Record<string, string> = {
  video:      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  article:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  course:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  definition: 'bg-muted text-muted-foreground',
  paper:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

const LEVEL_STYLES: Record<number, { ring: string; num: string }> = {
  0: { ring: 'border-brand',       num: 'bg-brand text-white' },
  1: { ring: 'border-blue-500',    num: 'bg-blue-500 text-white' },
  2: { ring: 'border-purple-500',  num: 'bg-purple-500 text-white' },
  3: { ring: 'border-amber-500',   num: 'bg-amber-500 text-white' },
  4: { ring: 'border-red-500',     num: 'bg-red-500 text-white' },
}

export function ConceptCard({ concept, index }: { concept: any; index: number }) {
  const [open, setOpen] = useState(index < 2)
  const style = LEVEL_STYLES[index % 5]
  const resourceStyle = RESOURCE_STYLES[(concept.resource.type ?? '').toLowerCase()] ?? RESOURCE_STYLES.definition

  return (
    <div className="flex gap-3 mb-2">
      {/* Timeline column */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-6 h-6 rounded-full border-2 ${style.ring} ${style.num} flex items-center justify-center text-[11px] font-bold shrink-0`}>
          {index + 1}
        </div>
        <div className="w-[2px] flex-1 bg-border mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 mb-3 rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full text-left px-3.5 py-3 hover:bg-muted/40 transition-colors flex items-start justify-between gap-2"
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-[13.5px] font-bold text-foreground leading-snug">{concept.conceptName}</h4>
            {!open && (
              <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{concept.whyNeeded}</p>
            )}
          </div>
          <span className="shrink-0 text-muted-foreground mt-0.5">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {open && (
          <div className="px-3.5 pb-3 border-t border-border pt-2.5 flex flex-col gap-2.5">
            {/* Why needed */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Why you need this</p>
              <p className="text-[13px] leading-[1.6] text-foreground/85">{concept.whyNeeded}</p>
            </div>

            {/* Resource */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${resourceStyle}`}>
                {concept.resource.type}
              </span>
              {concept.resource.url ? (
                <a
                  href={concept.resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[13px] text-brand hover:underline font-semibold truncate"
                >
                  {concept.resource.title}
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              ) : (
                <span className="text-[13px] text-foreground/80 font-semibold truncate">
                  {concept.resource.title}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
