'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, MessageSquare, Repeat2, Sparkles, MoreHorizontal, Bookmark } from 'lucide-react'
import { AIBottomSheet } from '../ai-panel/AIBottomSheet'
import { usePostActions } from '@/hooks/usePostActions'
import { mediaUrl } from '@/lib/utils'

// Pass in post, paper, and author from the feed
export function PaperPostCard({ post, paper, author }: { post: any, paper: any, author: any }) {
  const { like, unlike, bookmark, unbookmark, repost } = usePostActions(post.id)
  const [expanded, setExpanded] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)

  const isLiked = !!post.isLiked
  const isBookmarked = !!post.isBookmarked
  const likeCount = post.likeCount ?? 0

  const handleLike = () => {
    if (isLiked) unlike.mutate()
    else like.mutate()
  }

  const handleBookmark = () => {
    if (isBookmarked) unbookmark.mutate()
    else bookmark.mutate()
  }

  const handleRepost = () => {
    repost.mutate()
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const roleColors: Record<string, string> = {
    student: 'bg-[#FDF0E8] text-[#C2692A]',
    doctor: 'bg-[#EFF6FF] text-[#2563EB]',
    researcher: 'bg-[#FEF3E2] text-[#D97706]',
    lab: 'bg-[#F3E8FF] text-[#7C3AED]'
  }

  const avatarColors: Record<string, string> = {
    student: 'bg-brand/10 text-brand',
    doctor: 'bg-blue-50 text-blue-600',
    researcher: 'bg-amber-50 text-amber-600',
    lab: 'bg-purple-50 text-purple-600'
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

  const authorRoleBadge = author.role ? (
    <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-semibold ml-2 ${roleColors[author.role] || roleColors.student}`}>
      {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
    </span>
  ) : null

  // Function to simulate opening AI bottom sheet for Phase 1
  const handleAskAI = () => {
    setIsAIOpen(true)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
    <div className="feed-card feed-card-paper p-[20px] group relative">
      
      {/* Paper Metadata Block (Above author row) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 relative group-hover:bg-blue-100/60 transition-colors">
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-mono border ${sourceColors[paper.source] || sourceColors.pdf}`}>
          {sourceName}
        </div>
        
        <Link href={`/paper/${paper.id}`} className="block pr-24 group">
          <h3 className="text-[16px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            {paper.title}
          </h3>
        </Link>
        
        <div className="mt-2 text-[13px] text-muted-foreground flex flex-wrap items-center gap-x-1">
          <span className="font-medium text-foreground/80">{paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 ? ' et al.' : ''}</span>
          <span>·</span>
          <span>{paper.year}</span>
          {paper.journal && (
            <>
              <span>·</span>
              <span className="italic">{paper.journal}</span>
            </>
          )}
          {paper.citationCount && (
            <>
              <span>·</span>
              <span>{paper.citationCount} citations</span>
            </>
          )}
          {paper.openAccessUrl && (
            <>
              <span>·</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Open Access
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {paper.tags?.map((tag: string) => (
            <span key={tag} className="border border-blue-200 bg-blue-50/80 rounded-[12px] px-[8px] py-[2px] text-[12px] text-blue-700">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Author Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.id}`}>
            <div
              className={`w-[40px] h-[40px] rounded-full overflow-hidden flex items-center justify-center font-bold text-[13px] ${avatarColors[author.role] || avatarColors.student}`}
            >
              {author.profilePhoto ? (
                <img src={mediaUrl(author.profilePhoto)} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(author.name)
              )}
            </div>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Link href={`/profile/${author.id}`} className="text-[14px] font-bold hover:underline hover:text-brand cursor-pointer">
                {author.name}
              </Link>
              {authorRoleBadge}
            </div>
            <div className="text-[13px] text-muted-foreground truncate max-w-[300px]">
              {author.headline}
            </div>
            <div className="text-[12px] text-muted-foreground">
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:bg-black/5 p-1.5 rounded-full transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Caption Content */}
      <div className="mb-4">
        <p className={`text-[14px] text-foreground leading-[1.5] ${expanded ? '' : 'line-clamp-3'}`}>
          {post.content}
        </p>
        {!expanded && post.content.length > 150 && (
          <button 
            onClick={() => setExpanded(true)}
            className="text-[14px] text-brand hover:underline font-semibold mt-1"
          >
            ...see more
          </button>
        )}
      </div>

      {/* Interaction Row + Ask AI Button */}
      <div className="flex items-center justify-between border-t border-border pt-3 mt-1 gap-2">
        <div className="flex items-center sm:gap-1 flex-1 overflow-x-auto pr-2 scrollbar-hide mask-fade-right">
          <button
            type="button"
            onClick={handleLike}
            disabled={like.isPending || unlike.isPending}
            className={`flex items-center gap-1.5 px-[10px] py-[6px] rounded-[6px] transition-colors text-[13px] font-semibold ${
              isLiked ? 'text-brand bg-brand/10' : 'text-slate-600 hover:bg-black/5 hover:text-foreground'
            }`}
          >
            <ThumbsUp size={16} className={isLiked ? 'fill-brand' : ''} />
            <span>Like {likeCount > 0 && <span className="ml-1 font-normal opacity-80">{likeCount}</span>}</span>
          </button>

          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 px-[10px] py-[6px] rounded-[6px] transition-colors text-[13px] font-semibold text-slate-600 hover:bg-black/5 hover:text-foreground"
          >
            <MessageSquare size={16} />
            <span>Comment {post.commentCount > 0 && <span className="ml-1 font-normal opacity-80">{post.commentCount}</span>}</span>
          </Link>

          <button
            type="button"
            onClick={handleRepost}
            disabled={repost.isPending}
            className="flex items-center gap-1.5 px-[10px] py-[6px] rounded-[6px] transition-colors text-[13px] font-semibold text-slate-600 hover:bg-black/5 hover:text-foreground hidden sm:flex"
          >
            <Repeat2 size={16} />
            <span>Repost {post.repostCount > 0 && <span className="ml-1 font-normal opacity-80">{post.repostCount}</span>}</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            disabled={bookmark.isPending || unbookmark.isPending}
            className={`flex items-center gap-1.5 px-[10px] py-[6px] rounded-[6px] transition-colors text-[13px] font-semibold hidden sm:flex ${
              isBookmarked ? 'text-brand bg-brand/10' : 'text-slate-600 hover:bg-black/5 hover:text-foreground'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark size={16} className={isBookmarked ? 'fill-brand' : ''} />
          </button>
        </div>

        {/* ASK AI Button - Solid Box Premium Design */}
        <button 
          onClick={handleAskAI}
          className="relative overflow-hidden flex items-center justify-center gap-2 px-[16px] py-[8px] rounded-[8px] transition-all duration-300 text-[13px] font-bold shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_4px_12px_rgba(245,166,35,0.3)] hover:shadow-[0_6px_16px_rgba(245,166,35,0.5)] transform hover:-translate-y-[1px] group/btn border border-orange-400/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <Sparkles size={16} className="text-white drop-shadow-sm group-hover/btn:scale-110 transition-transform duration-300" />
          <span className="drop-shadow-sm tracking-wide">Ask AI</span>
        </button>
      </div>
    </div>
    
    <AIBottomSheet
      isOpen={isAIOpen}
      onClose={() => setIsAIOpen(false)}
      paperTitle={paper.title}
      paperId={paper?.id ?? null}
    />
    </>
  )
}
