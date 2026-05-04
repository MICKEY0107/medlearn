'use client'

import { useParams, redirect, notFound } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { postsAPI, aiAPI } from '@/lib/api-client'
import { InsightPostCard } from '@/components/feed/InsightPostCard'
import { QuestionPostCard } from '@/components/feed/QuestionPostCard'
import { ProjectPostCard } from '@/components/feed/ProjectPostCard'
import { CommentInput } from '@/components/comments/CommentInput'
import { DiscussionSummary } from '@/components/comments/DiscussionSummary'
import { CommentThread } from '@/components/comments/CommentThread'
import { useComments } from '@/hooks/useComments'
import { usePaper } from '@/hooks/usePaper'
import { Loader2 } from 'lucide-react'

export default function PostPage() {
  const params = useParams()
  const postId = params.id as string

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsAPI.getById(postId).then((r) => r.data.post),
    enabled: !!postId,
  })

  const derivedId = post?.derivedFromPaper ?? post?.derivedFromPaperId
  const { data: derivedPaper } = usePaper(derivedId || '')

  const { data: comments = [], refetch: refetchComments } = useComments(postId)

  const { data: discussionSummary } = useQuery({
    queryKey: ['discussion-summary', postId],
    queryFn: () => aiAPI.summariseDiscussion(postId).then((r) => r.data.result),
    enabled: !!post && (post.commentCount ?? 0) >= 10,
    retry: false,
  })

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !post) {
    notFound()
  }

  if (post.type === 'paper' && post.paperId) {
    redirect(`/paper/${post.paperId}`)
  }

  const author = post.author
  if (!author) {
    notFound()
  }

  const paper = derivedPaper

  return (
    <PageWrapper>
      <div className="w-full max-w-[680px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="mb-[16px]">
          {post.type === 'insight' && (
            <div className="[&_.line-clamp-4]:line-clamp-none">
              <InsightPostCard post={post} author={author} />
            </div>
          )}
          {post.type === 'question' && (
            <div className="[&_.line-clamp-4]:line-clamp-none">
              <QuestionPostCard post={post} author={author} />
            </div>
          )}
          {post.type === 'project' && (
            <div className="[&_.line-clamp-3]:line-clamp-none">
              <ProjectPostCard post={post} author={author} paper={paper} />
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-[8px] mt-[16px] overflow-hidden">
          <h2 className="text-[18px] font-bold px-[20px] py-[20px] pb-4">
            Discussion ({post.commentCount})
          </h2>

          <div className="px-[20px] pb-[20px]">
            <CommentInput postId={postId} onCommentAdded={() => refetchComments()} />

            {post.commentCount >= 10 && (
              <div className="mt-[20px]">
                <DiscussionSummary commentCount={post.commentCount} summary={discussionSummary} />
              </div>
            )}

            <div className="mt-[24px]">
              <CommentThread comments={comments} postId={postId} />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
