import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, FlaskConical, Users, Lightbulb, CheckCircle2 } from 'lucide-react'
import type { SimplifyResult } from '@/hooks/useAIPanel'
import { AISkeleton } from './AISkeleton'

export interface SummariseTabProps {
  data: SimplifyResult | null
  loading: boolean
  error: string
}

function Section({
  icon,
  label,
  color,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode
  label: string
  color: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`p-1.5 rounded-lg ${color}`}>{icon}</span>
          <span className="text-[13px] font-bold text-foreground tracking-wide uppercase">{label}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  )
}

export function SummariseTab({ data, loading, error }: SummariseTabProps) {
  if (loading || (!data && !error)) return <AISkeleton />

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 text-[14px] text-red-700 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!data) return <AISkeleton />

  return (
    <div className="flex flex-col gap-3">

      {/* TL;DR — always visible, no collapse */}
      <div className="rounded-xl border-l-4 border-brand bg-brand/5 dark:bg-brand/10 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-1.5">TL;DR</p>
        <p className="text-[14px] leading-[1.75] text-foreground">{data.plain_summary}</p>
      </div>

      {/* Key Findings */}
      <Section
        icon={<CheckCircle2 size={14} className="text-emerald-600" />}
        label="Key Findings"
        color="bg-emerald-50 dark:bg-emerald-950/40"
      >
        <ol className="flex flex-col gap-2.5 mt-1">
          {data.key_findings.map((finding: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-[13.5px] leading-[1.65] text-foreground/90">{finding}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Methodology */}
      <Section
        icon={<FlaskConical size={14} className="text-blue-600" />}
        label="Methodology"
        color="bg-blue-50 dark:bg-blue-950/40"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-2 mt-1">
          <span className="self-start bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[12px] font-bold px-3 py-1 rounded-full">
            {data.methodology_type}
          </span>
          <p className="text-[13.5px] leading-[1.65] text-foreground/80">{data.methodology_detail}</p>
        </div>
      </Section>

      {/* Study Population */}
      {data.study_population && (
        <Section
          icon={<Users size={14} className="text-purple-600" />}
          label="Study Population"
          color="bg-purple-50 dark:bg-purple-950/40"
          defaultOpen={false}
        >
          <p className="text-[13.5px] leading-[1.65] text-foreground/80 mt-1">{data.study_population}</p>
        </Section>
      )}

      {/* Limitations */}
      {data.limitations && data.limitations.length > 0 && (
        <Section
          icon={<AlertTriangle size={14} className="text-amber-600" />}
          label="Limitations"
          color="bg-amber-50 dark:bg-amber-950/40"
          defaultOpen={false}
        >
          <ul className="flex flex-col gap-2 mt-1">
            {data.limitations.map((limit: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="text-[13.5px] leading-[1.65] text-foreground/80">{limit}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Clinical Implication — if present */}
      {(data as any).clinical_implication && (
        <Section
          icon={<Lightbulb size={14} className="text-brand" />}
          label="Clinical Implication"
          color="bg-brand/10"
          defaultOpen={false}
        >
          <p className="text-[13.5px] leading-[1.65] text-foreground/80 mt-1">{(data as any).clinical_implication}</p>
        </Section>
      )}

    </div>
  )
}
