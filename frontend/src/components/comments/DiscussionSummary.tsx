import { Sparkles } from 'lucide-react'

export interface DiscussionSummaryData {
  key_claims: string[]
  consensus_points: string[]
  open_questions: string[]
}

export function DiscussionSummary({
  commentCount,
  summary,
}: {
  commentCount: number
  summary: DiscussionSummaryData | null | undefined
}) {
  if (commentCount < 10 || !summary) return null

  return (
    <div
      className="mb-[20px] rounded-[0_8px_8px_0] p-[14px_18px]"
      style={{
        borderLeft: '3px solid #D97706',
        backgroundColor: 'rgba(245,166,35,0.05)',
      }}
    >
      <div className="flex items-center gap-[6px] mb-[12px]">
        <Sparkles size={16} fill="#D97706" className="text-[#D97706]" />
        <span className="text-[13px] font-bold text-[#D97706]">AI Summary</span>
        <span className="text-[12px] text-muted-foreground ml-[2px]">
          · {commentCount} comments summarised
        </span>
      </div>

      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[4px]">
          <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            Key Claims
          </h4>
          <ul className="flex flex-col gap-[6px] pl-[12px] mt-[2px]">
            {summary.key_claims.map((claim: string, index: number) => (
              <li key={index} className="text-[13px] text-black/75 leading-[1.6] relative">
                <div className="absolute left-[-12px] top-[7px] w-[5px] h-[5px] bg-[#D97706] rounded-full" />
                {claim}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-[4px]">
          <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            Consensus Points
          </h4>
          <ul className="flex flex-col gap-[6px] pl-[12px] mt-[2px]">
            {summary.consensus_points.map((point: string, index: number) => (
              <li key={index} className="text-[13px] text-black/75 leading-[1.6] relative">
                <div className="absolute left-[-12px] top-[7px] w-[5px] h-[5px] bg-[#D97706] rounded-full" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-[4px]">
          <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            Open Questions
          </h4>
          <ul className="flex flex-col gap-[6px] pl-[12px] mt-[2px]">
            {summary.open_questions.map((question: string, index: number) => (
              <li key={index} className="text-[13px] text-black/75 leading-[1.6] relative">
                <div className="absolute left-[-12px] top-[7px] w-[5px] h-[5px] bg-[#D97706] rounded-full" />
                {question}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
