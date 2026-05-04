'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { useFeed } from '@/hooks/useFeed'
import { Hash, FileText } from 'lucide-react'
import { PaperPostCard } from '@/components/feed/PaperPostCard'
import { InsightPostCard } from '@/components/feed/InsightPostCard'
import { QuestionPostCard } from '@/components/feed/QuestionPostCard'
import { ProjectPostCard } from '@/components/feed/ProjectPostCard'

export default function TopicFeedPage() {
  const params = useParams()
  const decodedTag = decodeURIComponent(params.tag as string)
  const [isFollowing, setIsFollowing] = useState(false)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed({
    tag: decodedTag,
  })

  const topicPosts = data?.pages.flatMap((p) => p.posts) ?? []

  return (
    <PageWrapper>
      <div className="flex flex-col w-full pb-16 md:pb-0">
        <div className="bg-white border border-border rounded-[8px] p-[20px] mb-[16px]">
          <div className="text-[13px] text-muted-foreground font-semibold mb-[8px] flex items-center gap-1.5 uppercase tracking-wide">
            <Link href="/topics" className="hover:text-brand transition-colors">
              Topics
            </Link>
            <span>·</span>
            <span className="text-foreground">{decodedTag}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] rounded-[8px] bg-brand/10 border border-brand/20 flex flex-col items-center justify-center shrink-0">
                <Hash size={24} className="text-brand" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-[24px] font-bold text-foreground leading-tight capitalize">
                  {decodedTag}
                </h1>
                <p className="text-[14px] text-muted-foreground font-medium mt-[2px]">
                  {isLoading ? '…' : `${topicPosts.length} post${topicPosts.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-[16px] py-[8px] text-[14px] font-bold rounded-[16px] transition-all duration-200 border-[1.5px] whitespace-nowrap ${
                isFollowing
                  ? 'bg-brand border-brand text-white hover:bg-[#0a5a47] hover:border-[#0a5a47]'
                  : 'bg-transparent border-border text-foreground/80 hover:bg-[#F3F2EE]'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow this topic'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[8px] pb-16 md:pb-0">
          {isLoading && <p className="text-muted-foreground px-2">Loading…</p>}
          {!isLoading && topicPosts.length > 0 ? (
            <>
              {topicPosts.map((post) => {
                const author = post.author
                const paper = post.paper
                if (!author) return null

                switch (post.type) {
                  case 'paper':
                    return <PaperPostCard key={post.id} post={post} paper={paper} author={author} />
                  case 'insight':
                    return <InsightPostCard key={post.id} post={post} author={author} />
                  case 'question':
                    return <QuestionPostCard key={post.id} post={post} author={author} />
                  case 'project':
                    return <ProjectPostCard key={post.id} post={post} author={author} paper={paper} />
                  default:
                    return null
                }
              })}
              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          ) : !isLoading ? (
            <div className="bg-white border border-border rounded-[8px]">
              <EmptyState
                icon={<FileText size={48} />}
                title="No trending discussions yet"
                description={`There are currently no active discussions involving ${decodedTag}. Be the first to start one!`}
              />
            </div>
          ) : null}
        </div>
      </div>
    </PageWrapper>
  )
}
