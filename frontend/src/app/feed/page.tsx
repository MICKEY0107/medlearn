'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { FeedComposer } from '@/components/feed/FeedComposer'
import { PaperPostCard } from '@/components/feed/PaperPostCard'
import { InsightPostCard } from '@/components/feed/InsightPostCard'
import { QuestionPostCard } from '@/components/feed/QuestionPostCard'
import { ProjectPostCard } from '@/components/feed/ProjectPostCard'
import { useFeed } from '@/hooks/useFeed'

type FeedFilter = 'all' | 'paper' | 'insight' | 'question' | 'project'

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all')
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(activeFilter === 'all' ? {} : { type: activeFilter })

  const filterTabs: { id: FeedFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'paper', label: 'Papers' },
    { id: 'insight', label: 'Insights' },
    { id: 'question', label: 'Questions' },
    { id: 'project', label: 'Projects' },
  ]

  const emptyMessage =
    activeFilter === 'all'
      ? 'No posts yet. Be the first to share a research insight!'
      : `No ${filterTabs.find((tab) => tab.id === activeFilter)?.label.toLowerCase()} yet.`

  const handleFilterChange = (filter: FeedFilter) => {
    setActiveFilter(filter)
  }

  const renderFilterTabs = () => (
    <div className="mb-4 flex items-center border-b border-border overflow-x-auto scrollbar-hide px-2">
      {filterTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => handleFilterChange(tab.id)}
          className={`px-[16px] py-[12px] text-[14px] font-bold whitespace-nowrap border-b-[2px] transition-colors ${
            activeFilter === tab.id
              ? 'border-brand text-brand'
              : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-black/20'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  const renderFeedContent = () => (
    <div className="flex flex-col gap-0 pb-16 md:pb-0">
      {posts.map((post) => {
        const author = post.author
        const paper = post.paper

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

      {posts.length === 0 && (
        <div className="glass-panel p-12 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

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
    </div>
  )

  const posts = data?.pages.flatMap((p) => p.posts) ?? []

  if (isLoading) {
    return (
      <PageWrapper>
        <FeedComposer />
        {renderFilterTabs()}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel h-[200px] animate-pulse bg-muted/10" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  if (isError) {
    return (
      <PageWrapper>
        <FeedComposer />
        {renderFilterTabs()}
        <div className="glass-panel p-8 text-center text-muted-foreground">
          <p>Failed to load feed. Ensure the database is synchronized.</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <FeedComposer onSuccess={() => refetch()} />
      {renderFilterTabs()}
      {renderFeedContent()}
    </PageWrapper>
  )
}

