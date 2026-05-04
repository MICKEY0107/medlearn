'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useTrending } from '@/hooks/useTopics'

export function RightSidebar() {
  const { data, isLoading } = useTrending()
  const topTags = data?.topTags ?? []

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="glass-panel">
        <h3 className="text-[14px] font-bold text-foreground px-5 pt-4 pb-2">Trending topics</h3>
        <div className="flex flex-col px-2 pb-3">
          {isLoading && (
            <div className="px-3 py-2 text-[13px] text-muted-foreground">Loading…</div>
          )}
          {!isLoading &&
            topTags.slice(0, 5).map((t: { tag: string; postCount: number }) => (
              <Link
                key={t.tag}
                href={`/topics/${encodeURIComponent(t.tag.toLowerCase())}`}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-black/[0.04] transition-colors"
              >
                <span className="text-[13px] font-semibold text-foreground capitalize">{t.tag}</span>
                <span className="text-[12px] text-muted-foreground">{t.postCount} posts</span>
              </Link>
            ))}
          {!isLoading && topTags.length === 0 && (
            <p className="px-3 py-2 text-[13px] text-muted-foreground">No trending tags yet.</p>
          )}
        </div>
      </div>

      <div className="glass-panel">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-[14px] font-bold text-foreground">Add to your network</h3>
          <button
            type="button"
            className="text-brand hover:bg-brand/10 p-1 rounded-full transition-colors"
            aria-label="Add connection"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex flex-col px-2 pb-4">
          <p className="px-3 text-[13px] text-muted-foreground">
            Discover people in the feed and send connection requests.
          </p>
        </div>
      </div>
    </div>
  )
}
