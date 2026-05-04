'use client'

import { useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PaperHeader } from '@/components/paper/PaperHeader'
import { RelatedPapers } from '@/components/paper/RelatedPapers'
import { AIBottomSheet } from '@/components/ai-panel/AIBottomSheet'
import { CommentInput } from '@/components/comments/CommentInput'
import { DiscussionSummary } from '@/components/comments/DiscussionSummary'
import { CommentThread } from '@/components/comments/CommentThread'
import { usePaper, useSimilarPapers } from '@/hooks/usePaper'
import { useComments } from '@/hooks/useComments'
import { postsAPI, aiAPI } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'

export default function PaperPostPage() {
  const params = useParams()
  const paperId = params.id as string
  const [isAIOpen, setIsAIOpen] = useState(false)

  const { data: paper, isLoading: paperLoading, error: paperError } = usePaper(paperId)
  const { data: similarPapers = [] } = useSimilarPapers(paperId)

  const primaryPost = paper?.posts?.[0]

  const { data: postFull } = useQuery({
    queryKey: ['post', primaryPost?.id],
    queryFn: () => postsAPI.getById(primaryPost!.id).then((r) => r.data.post),
    enabled: !!primaryPost?.id,
  })

  const displayPost = postFull ?? primaryPost
  const postId = displayPost?.id ?? ''
  const { data: comments = [], refetch: refetchComments } = useComments(postId)

  const { data: discussionSummary } = useQuery({
    queryKey: ['discussion-summary', postId],
    queryFn: () => aiAPI.summariseDiscussion(postId).then((r) => r.data.result),
    enabled: !!postId && (displayPost?.commentCount ?? 0) >= 10,
    retry: false,
  })

  if (paperLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      </PageWrapper>
    )
  }

  if (paperError || !paper) {
    notFound()
  }

  if (!displayPost || !displayPost.author) {
    return (
      <PageWrapper>
        <div className="w-full max-w-[752px] mx-auto py-6 sm:py-8 px-4 sm:px-0 relative mb-20">
          <div className="bg-white border border-border rounded-[8px] p-[24px]">
            <h1 className="text-[22px] font-bold mb-4">{paper.title}</h1>
            <p className="text-[14px] text-muted-foreground mb-6">{paper.authors?.join(', ')}</p>
            <p className="text-[15px] leading-relaxed whitespace-pre-line">{paper.abstract}</p>
            <p className="mt-6 text-[14px] text-muted-foreground">
              No discussion post is linked to this paper yet. Share it from the feed to start a thread.
            </p>
            <button
              type="button"
              onClick={() => setIsAIOpen(true)}
              className="mt-4 text-[14px] font-bold text-[#D97706]"
            >
              Open AI panel
            </button>
          </div>
          <div className="mt-[24px] mb-[40px]">
            <RelatedPapers papers={similarPapers} paperId={paper.id} tags={paper.tags} />
          </div>
          <AIBottomSheet
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            paperTitle={paper.title}
            paperId={paper.id}
          />
        </div>
      </PageWrapper>
    )
  }

  const author = displayPost.author

  return (
    <PageWrapper>
      <div className="w-full max-w-[752px] mx-auto py-6 sm:py-8 px-4 sm:px-0 relative mb-20">
        <PaperHeader
          paper={paper}
          post={displayPost}
          author={author}
          onAskAI={() => setIsAIOpen(true)}
        />

        <div className="bg-white border border-border rounded-[8px] p-[24px] mt-[16px]">
          <h2 className="text-[12px] uppercase text-muted-foreground tracking-[0.05em] font-bold mb-4">
            Abstract
          </h2>
          <p className="text-[15px] leading-[1.8] text-foreground/80 whitespace-pre-line">
            {paper.abstract}
          </p>
        </div>

        <div className="bg-white border border-border rounded-[8px] mt-[16px] overflow-hidden">
          <h2 className="text-[18px] font-bold px-[20px] py-[20px] pb-4">
            Discussion ({displayPost.commentCount})
          </h2>

          <div className="px-[20px] pb-[20px]">
            <CommentInput postId={postId} onCommentAdded={() => refetchComments()} />

            {displayPost.commentCount >= 10 && (
              <div className="mt-[20px]">
                <DiscussionSummary
                  commentCount={displayPost.commentCount}
                  summary={discussionSummary}
                />
              </div>
            )}

            <div className="mt-[24px]">
              <CommentThread comments={comments} postId={postId} />
            </div>
          </div>
        </div>

        <div className="mt-[24px] mb-[40px]">
          <RelatedPapers papers={similarPapers} paperId={paper.id} tags={paper.tags} />
        </div>
      </div>

      <AIBottomSheet
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        paperTitle={paper.title}
        paperId={paper.id}
      />
    </PageWrapper>
  )
}
