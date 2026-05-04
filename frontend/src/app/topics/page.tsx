'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useTrending } from '@/hooks/useTopics'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function TopicsPage() {
  const { data, isLoading, isError } = useTrending()
  const topTags = data?.topTags ?? []
  const maxPostCount = Math.max(1, ...topTags.map((t: { postCount: number }) => t.postCount))

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="w-full max-w-[900px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (isError) {
    return (
      <PageWrapper>
        <div className="text-center text-red-500 py-8 max-w-[900px] mx-auto">
          Failed to load. Please refresh.
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-[900px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        <div className="mb-[32px]">
          <h1 className="text-[28px] font-bold text-foreground leading-tight">
            Trending in healthcare research
          </h1>
          <p className="text-[15px] text-muted-foreground mt-2 font-medium">
            What the community is discussing this week.
          </p>
        </div>

        {topTags.length === 0 && (
          <p className="text-muted-foreground">No tagged posts in the last 7 days yet.</p>
        )}

        <div className="flex flex-col gap-[8px]">
          {topTags.map((topic: { tag: string; postCount: number; weeklyGrowth: number }, index: number) => {
            const widthPercentage = Math.round((topic.postCount / maxPostCount) * 100)
            return (
              <Link
                href={`/topics/${encodeURIComponent(topic.tag.toLowerCase())}`}
                key={topic.tag}
                className="bg-white border border-border rounded-[8px] p-[16px] hover:shadow-sm transition-shadow group flex items-start gap-[16px]"
              >
                <div className="w-[40px] shrink-0 text-center font-bold text-[18px] text-brand self-center">
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[16px] font-bold text-foreground group-hover:text-brand transition-colors truncate pr-2">
                      {topic.tag}
                    </h2>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[13px] text-muted-foreground font-medium">
                        {topic.postCount} posts
                      </span>
                      <span
                        className={`text-[12px] font-bold flex items-center gap-0.5 ${topic.weeklyGrowth >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}
                      >
                        {topic.weeklyGrowth >= 0 ? (
                          <TrendingUp size={12} strokeWidth={3} />
                        ) : (
                          <TrendingDown size={12} strokeWidth={3} />
                        )}
                        {Math.abs(topic.weeklyGrowth)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-[6px] bg-[#F3F2EE] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: index * 0.05,
                      }}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </PageWrapper>
  )
}
