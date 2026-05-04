'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, MessageSquare, Repeat2, Send, HelpCircle, Check, MoreHorizontal } from 'lucide-react'
import { usePostActions } from '@/hooks/usePostActions'
import { mediaUrl } from '@/lib/utils'

export function QuestionPostCard({ post, author }: { post: any, author: any }) {
  const { like, unlike, repost } = usePostActions(post.id)
  const [expanded, setExpanded] = useState(false)

  const isLiked = !!post.isLiked
  const likeCount = post.likeCount ?? 0

  const handleLike = () => {
    if (isLiked) unlike.mutate()
    else like.mutate()
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

  const authorRoleBadge = author?.role ? (
    <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-semibold ml-2 ${roleColors[author.role] || roleColors.student}`}>
      {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
    </span>
  ) : null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="feed-card feed-card-question p-[16px] relative">
      
      {/* Top Question Badge */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-[8px] py-[3px] rounded-full bg-green-50 text-green-700 border border-green-200 text-[12px] font-semibold">
          <HelpCircle size={14} />
          Question
        </div>
      </div>

      {/* Author Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author?.id}`}>
            <div
              className={`w-[40px] h-[40px] rounded-full overflow-hidden flex items-center justify-center font-bold text-[13px] ${avatarColors[author?.role] || avatarColors.student}`}
            >
              {author?.profilePhoto ? (
                <img src={mediaUrl(author.profilePhoto)} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(author?.name || 'User')
              )}
            </div>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center">
              <Link href={`/profile/${author.id}`} className="text-[14px] font-bold text-foreground hover:underline hover:text-brand cursor-pointer">
                {author?.name}
              </Link>
              {authorRoleBadge}
            </div>
            <div className="text-[13px] text-muted-foreground truncate max-w-[300px]">
              {author?.headline}
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

      {/* Question Content */}
      <div className="mb-4">
        <p className={`text-[14px] text-foreground leading-[1.5] ${expanded ? '' : 'line-clamp-4'}`}>
          {post.content}
        </p>
        {!expanded && post.content.length > 200 && (
          <button 
            onClick={() => setExpanded(true)}
            className="text-[14px] text-brand hover:underline font-semibold mt-1"
          >
            ...see more
          </button>
        )}
      </div>

      {/* Best Answer exists */}
      {post.bestAnswerCommentId && (
        <div className="mb-3 flex items-center gap-1 text-[13px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-md self-start inline-flex">
          <Check size={16} />
          <span>Best answer exists</span>
        </div>
      )}

      {/* Tags Row */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag: string) => (
            <span key={tag} className="border border-green-200 bg-green-50/80 rounded-[12px] px-[8px] py-[2px] text-[12px] text-green-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Interaction Row */}
      <div className="flex items-center border-t border-border pt-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center sm:gap-1 w-full shrink-0">
          <button
            type="button"
            onClick={handleLike}
            disabled={like.isPending || unlike.isPending}
            className={`flex items-center gap-1.5 px-[12px] py-[8px] rounded-[6px] transition-colors text-[14px] font-semibold ${
              isLiked ? 'text-brand bg-brand/5' : 'text-foreground/60 hover:bg-black/5 hover:text-foreground/80'
            }`}
          >
            <ThumbsUp size={18} className={isLiked ? 'fill-brand' : ''} />
            <span>Like {likeCount > 0 && <span className="ml-1 font-normal opacity-80">{likeCount}</span>}</span>
          </button>

          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 px-[12px] py-[8px] rounded-[6px] transition-colors text-[14px] font-semibold text-foreground/60 hover:bg-black/5 hover:text-foreground/80"
          >
            <MessageSquare size={18} />
            <span>Answer {post.commentCount > 0 && <span className="ml-1 font-normal opacity-80">{post.commentCount}</span>}</span>
          </Link>

          <button
            type="button"
            onClick={() => repost.mutate()}
            disabled={repost.isPending}
            className="flex items-center gap-1.5 px-[12px] py-[8px] rounded-[6px] transition-colors text-[14px] font-semibold text-foreground/60 hover:bg-black/5 hover:text-foreground/80"
          >
            <Repeat2 size={18} />
            <span>Repost {post.repostCount > 0 && <span className="ml-1 font-normal opacity-80">{post.repostCount}</span>}</span>
          </button>

          <button className="flex items-center gap-1.5 px-[12px] py-[8px] rounded-[6px] transition-colors text-[14px] font-semibold text-foreground/60 hover:bg-black/5 hover:text-foreground/80">
            <Send size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

    </div>
  )
}
