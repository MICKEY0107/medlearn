'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DM_Serif_Display } from 'next/font/google'
import { Copy, ExternalLink, ThumbsUp, MessageSquare, Repeat2, Send, Sparkles } from 'lucide-react'
import { usePostActions } from '@/hooks/usePostActions'

// Load Google Font optimally locally for this component
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

interface PaperHeaderProps {
  paper: any;
  post: any;
  author: any;
  onAskAI: () => void;
}

export function PaperHeader({ paper, post, author, onAskAI }: PaperHeaderProps) {
  const { like, unlike, repost } = usePostActions(post.id)
  const [copied, setCopied] = useState(false)

  const isLiked = !!post.isLiked
  const likeCount = post.likeCount ?? 0

  const handleLike = () => {
    if (isLiked) unlike.mutate()
    else like.mutate()
  }

  const handleCopyDOI = () => {
    if (!paper.doi) return
    navigator.clipboard.writeText(paper.doi)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sourceColors: Record<string, string> = {
    'semantic_scholar': 'bg-purple-100 text-purple-700 border-purple-200',
    'pubmed': 'bg-blue-100 text-blue-700 border-blue-200',
    'pdf': 'bg-gray-100 text-gray-700 border-gray-200',
    'crossref': 'bg-orange-100 text-orange-700 border-orange-200'
  }

  const sourceName = paper.source === 'semantic_scholar' ? 'Semantic Scholar' : 
                     paper.source === 'pubmed' ? 'PubMed' : 
                     paper.source === 'crossref' ? 'CrossRef' : 'PDF'

  return (
    <div className="bg-white border border-border rounded-[8px] p-[24px] relative">
      <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[11px] font-mono border ${sourceColors[paper.source] || sourceColors.pdf}`}>
        {sourceName}
      </div>

      <h1 className={`${dmSerif.className} text-[26px] leading-[1.2] text-foreground pr-24 mb-4`}>
        {paper.title}
      </h1>

      <div className="text-[14px] text-muted-foreground mb-2">
        {paper.authors.join(', ')}
      </div>

      <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground mb-4">
        <span>{paper.year}</span>
        {paper.journal && (
          <>
            <span>·</span>
            <span className="italic">{paper.journal}</span>
          </>
        )}
        {paper.doi && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1 group relative">
              DOI: {paper.doi}
              <button 
                onClick={handleCopyDOI}
                className="hover:text-foreground hover:bg-black/5 p-1 rounded-sm transition-colors"
                title="Copy DOI"
              >
                <Copy size={14} />
              </button>
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Copied!
                </span>
              )}
            </span>
          </>
        )}
        {paper.openAccessUrl && (
          <>
            <span>·</span>
            <a 
              href={paper.openAccessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#16A34A] font-medium flex items-center gap-1 hover:underline"
            >
              Open Access
              <ExternalLink size={12} />
            </a>
          </>
        )}
        {paper.citationCount && (
          <>
            <span>·</span>
            <span>{paper.citationCount} citations</span>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {paper.tags?.map((tag: string) => (
          <span key={tag} className="border border-border bg-white rounded-[12px] px-[8px] py-[2px] text-[12px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-5 text-[14px] text-muted-foreground pb-4 border-b border-border/50">
        <span><strong className="text-foreground text-[15px]">{likeCount}</strong> Likes</span>
        <span><strong className="text-foreground text-[15px]">{post.commentCount}</strong> Comments</span>
        <span><strong className="text-foreground text-[15px]">{post.repostCount}</strong> Reposts</span>
      </div>

      {/* Action Row & Ask AI */}
      <div className="flex items-center justify-between pt-4 gap-2 w-full">
        
        {/* Interaction Buttons */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide pr-2 mask-fade-right">
          <button
            type="button"
            onClick={handleLike}
            disabled={like.isPending || unlike.isPending}
            className={`flex shrink-0 items-center justify-center gap-1.5 px-[12px] sm:px-[14px] py-[8px] sm:py-[10px] rounded-[8px] transition-all duration-200 text-[13px] sm:text-[14px] font-semibold ${
              isLiked
                ? 'text-brand bg-brand/10 shadow-[0_2px_8px_rgba(15,110,86,0.15)] transform hover:-translate-y-[1px]'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transform hover:-translate-y-[1px]'
            }`}
          >
            <ThumbsUp
              size={16}
              className={`transition-transform duration-200 ${isLiked ? 'fill-brand scale-110' : ''}`}
            />
            <span className="hidden sm:inline">Like</span>
          </button>

          <Link
            href={`/post/${post.id}`}
            className="flex shrink-0 items-center justify-center gap-1.5 px-[12px] sm:px-[14px] py-[8px] sm:py-[10px] rounded-[8px] transition-all duration-200 text-[13px] sm:text-[14px] font-semibold text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transform hover:-translate-y-[1px]"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Comment</span>
          </Link>

          <button
            type="button"
            onClick={() => repost.mutate()}
            disabled={repost.isPending}
            className="flex shrink-0 items-center justify-center gap-1.5 px-[12px] sm:px-[14px] py-[8px] sm:py-[10px] rounded-[8px] transition-all duration-200 text-[13px] sm:text-[14px] font-semibold text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transform hover:-translate-y-[1px] hidden sm:flex"
          >
            <Repeat2 size={16} />
            <span>Repost</span>
          </button>

          <button className="flex shrink-0 items-center justify-center gap-1.5 px-[12px] sm:px-[14px] py-[8px] sm:py-[10px] rounded-[8px] transition-all duration-200 text-[13px] sm:text-[14px] font-semibold text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transform hover:-translate-y-[1px] hidden sm:flex">
            <Send size={16} />
            <span>Share</span>
          </button>
        </div>

        {/* Large Prominent ASK AI Button */}
        <button 
          onClick={onAskAI}
          className="relative overflow-hidden flex items-center justify-center gap-2 px-[16px] py-[8px] sm:py-[10px] rounded-[8px] transition-all duration-300 text-[13px] sm:text-[14px] font-bold shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_4px_12px_rgba(245,166,35,0.3)] hover:shadow-[0_6px_16px_rgba(245,166,35,0.5)] transform hover:-translate-y-[2px] group/btn border border-orange-400/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <Sparkles size={18} className="text-white drop-shadow-sm group-hover/btn:scale-110 transition-transform duration-300" />
          <span className="drop-shadow-sm tracking-wide">Ask AI</span>
        </button>
      </div>

    </div>
  )
}
