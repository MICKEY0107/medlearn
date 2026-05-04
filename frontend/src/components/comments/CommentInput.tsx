'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCreateComment } from '@/hooks/useComments'
import { mediaUrl } from '@/lib/utils'

interface CommentInputProps {
  postId: string
  parentCommentId?: string
  onCommentAdded?: () => void
}

export function CommentInput({ postId, parentCommentId, onCommentAdded }: CommentInputProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [showToast, setShowToast] = useState(false)
  const createComment = useCreateComment(postId)

  if (!user) return null

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

  const roleColors: Record<string, string> = {
    student: 'bg-brand/10 text-brand outline-brand',
    doctor: 'bg-blue-50 text-blue-600 outline-blue-600',
    researcher: 'bg-amber-50 text-amber-600 outline-amber-600',
    lab: 'bg-purple-50 text-purple-600 outline-purple-600',
  }
  const avatarClass = roleColors[user.role] || roleColors.student

  const handleSubmit = async () => {
    if (!content.trim()) return
    try {
      await createComment.mutateAsync({ content: content.trim(), parentCommentId })
      setContent('')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      onCommentAdded?.()
    } catch (e) {
      console.error('Comment failed', e)
    }
  }

  return (
    <div className="flex gap-[10px]">
      <div
        className={`shrink-0 w-[36px] h-[36px] rounded-full overflow-hidden flex items-center justify-center font-bold text-[12px] ${avatarClass}`}
      >
        {user.profilePhoto ? (
          <img src={mediaUrl(user.profilePhoto)} alt="" className="w-full h-full object-cover" />
        ) : (
          getInitials(user.name)
        )}
      </div>

      <div className="flex-1 flex flex-col gap-[8px]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border border-border rounded-[8px] px-[14px] py-[10px] text-[14px] min-h-[72px] resize-y bg-transparent focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all font-sans leading-relaxed"
        />

        {content.length > 0 && (
          <div className="flex items-center justify-end gap-[8px] animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => setContent('')}
              className="text-[14px] font-semibold text-muted-foreground hover:bg-[#F3F2EE] px-[12px] py-[6px] rounded-[16px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || createComment.isPending}
              className="text-[14px] font-semibold bg-brand text-white px-[16px] py-[6px] rounded-[16px] hover:bg-[#0a5a47] disabled:opacity-50 transition-colors"
            >
              {createComment.isPending ? 'Posting…' : 'Post'}
            </button>
          </div>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-5 h-5 bg-brand rounded-full flex items-center justify-center">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
          <span className="font-medium text-[14px]">Comment posted</span>
        </div>
      )}
    </div>
  )
}
