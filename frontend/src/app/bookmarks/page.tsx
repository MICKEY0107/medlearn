'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBookmarks } from '@/hooks/useBookmarks'
import { postsAPI } from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Trash2, ExternalLink } from 'lucide-react'

type FilterTab = 'all' | 'papers' | 'posts' | 'projects'

export default function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const { data: bookmarkPosts = [], isLoading, error } = useBookmarks()
  const queryClient = useQueryClient()

  const unbookmark = useMutation({
    mutationFn: (postId: string) => postsAPI.unbookmark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  const savedItems = useMemo(() => {
    let items = [...bookmarkPosts]
    if (activeTab === 'papers') items = items.filter((p) => p.type === 'paper')
    else if (activeTab === 'posts')
      items = items.filter((p) => p.type === 'insight' || p.type === 'question')
    else if (activeTab === 'projects') items = items.filter((p) => p.type === 'project')
    return items
  }, [bookmarkPosts, activeTab])

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    unbookmark.mutate(id)
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="w-full max-w-[900px] mx-auto py-8 px-4 sm:px-0">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="w-full max-w-[900px] mx-auto py-8 text-center text-red-500">
          Failed to load. Please refresh.
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-[900px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="mb-[24px]">
          <h1 className="text-[28px] font-bold text-foreground leading-tight flex items-center gap-3">
            <Bookmark size={28} className="text-brand" fill="currentColor" />
            Saved items
          </h1>
        </div>

        {bookmarkPosts.length > 0 && (
          <div className="flex items-center border-b border-border overflow-x-auto scrollbar-hide mb-[24px] px-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'papers', label: 'Papers' },
              { id: 'posts', label: 'Posts' },
              { id: 'projects', label: 'Projects' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-[16px] py-[14px] text-[14px] font-bold whitespace-nowrap border-b-[2px] transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-black/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {bookmarkPosts.length === 0 ? (
          <div className="bg-white border border-border rounded-[8px] mt-8">
            <EmptyState
              icon={<Bookmark size={48} className="opacity-20" />}
              title="Nothing saved yet"
              description="Save papers, articles, and discussions to find them easily here."
              actionText="Browse feed"
              actionHref="/feed"
            />
          </div>
        ) : savedItems.length === 0 ? (
          <div className="bg-white border border-border rounded-[8px] mt-8 py-10 text-center">
            <p className="text-[15px] text-muted-foreground font-medium">No {activeTab} saved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {savedItems.map((post: any) => {
              const author = post.author
              return (
                <Link
                  href={post.type === 'paper' && (post.paperId || post.paper?.id) ? `/paper/${post.paperId || post.paper?.id}` : `/post/${post.id}`}
                  key={post.id}
                  className="bg-white border border-border rounded-[8px] p-[20px] hover:shadow-sm transition-shadow group relative flex flex-col justify-between min-h-[160px]"
                >
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, post.id)}
                    className="absolute top-[16px] right-[16px] p-[6px] rounded-full bg-transparent hover:bg-amber-50 text-transparent group-hover:text-muted-foreground hover:!text-[#D97706] transition-all"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div>
                    <span className="inline-block px-[8px] py-[2px] rounded-[4px] bg-black/5 text-muted-foreground text-[11px] font-bold uppercase tracking-wide mb-3">
                      {post.type}
                    </span>
                    <h2 className="text-[16px] font-bold leading-snug line-clamp-3 mb-3 group-hover:text-brand transition-colors pr-6">
                      {post.title || post.content}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-muted-foreground font-medium pt-3 border-t border-border mt-auto">
                    <span>{author?.name || 'Unknown'}</span>
                    <span className="flex items-center gap-1 group-hover:text-brand transition-colors">
                      View details
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
