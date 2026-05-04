'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Check, ThumbsUp } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsAPI } from '@/lib/api-client'
import { mediaUrl } from '@/lib/utils'

export function CommentCard({
  comment,
  replies,
  postId,
}: {
  comment: any
  replies?: any[]
  postId?: string
}) {
  const queryClient = useQueryClient()
  const author = comment.author
  if (!author) return null

  const likeMutation = useMutation({
    mutationFn: () => commentsAPI.like(comment.id),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })

  const likeCount = comment.likeCount ?? comment._count?.likes ?? 0

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

  const roleColors: Record<string, string> = {
    student: 'bg-[#E8F4F0] text-[#0F6E56]',
    doctor: 'bg-[#EFF6FF] text-[#2563EB]',
    researcher: 'bg-[#FEF3E2] text-[#D97706]',
    lab: 'bg-[#F3E8FF] text-[#7C3AED]',
  }

  const avatarColors: Record<string, string> = {
    student: 'bg-brand/10 text-brand',
    doctor: 'bg-blue-50 text-blue-600',
    researcher: 'bg-amber-50 text-amber-600',
    lab: 'bg-purple-50 text-purple-600',
  }

  const authorRoleBadge = author?.role ? (
    <span
      className={`px-[8px] py-[2px] rounded-full text-[11px] font-semibold ml-2 ${roleColors[author.role] || roleColors.student}`}
    >
      {author.role.charAt(0).toUpperCase() + author.role.slice(1)}
    </span>
  ) : null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex flex-col mb-[16px]">
      <div className="flex gap-[10px]">
        <div className="shrink-0 mt-[4px]">
          <Link href={`/profile/${author.id}`}>
            <div
              className={`w-[36px] h-[36px] rounded-full overflow-hidden flex items-center justify-center font-bold text-[12px] ${avatarColors[author?.role] || avatarColors.student}`}
            >
              {author.profilePhoto ? (
                <img src={mediaUrl(author.profilePhoto)} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(author.name)
              )}
            </div>
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-[4px]">
              <div className="flex items-center min-w-0">
                <Link
                  href={`/profile/${author.id}`}
                  className="text-[14px] font-bold text-foreground hover:underline hover:text-brand truncate"
                >
                  {author.name}
                </Link>
                {authorRoleBadge}
              </div>
              <span className="text-[12px] text-muted-foreground whitespace-nowrap ml-2">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <span className="text-[12px] text-muted-foreground truncate leading-none mb-[8px]">
              {author.headline}
            </span>

            {comment.isBestAnswer && (
              <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] text-[12px] font-semibold mb-[6px] self-start">
                <Check size={14} strokeWidth={3} />
                Best Answer
              </div>
            )}

            <div className="text-[14px] leading-[1.6] text-foreground/90 prose prose-sm max-w-none">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-[16px] mt-[8px]">
              <button
                type="button"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors text-muted-foreground hover:text-foreground/80"
              >
                <ThumbsUp size={14} />
                <span>
                  {likeCount > 0 ? `${likeCount} Like${likeCount > 1 ? 's' : ''}` : 'Like'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {replies && replies.length > 0 && (
        <div className="pl-[22px] mt-[12px]">
          <div className="pl-[22px] border-l-[2px] border-[#E0DDD6] flex flex-col pt-[4px]">
            {replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} postId={postId} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
