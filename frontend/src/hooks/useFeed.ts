import { useInfiniteQuery } from '@tanstack/react-query'
import { postsAPI } from '@/lib/api-client'

export type FeedPage = {
  posts: any[]
  nextCursor: string | null
  hasMore: boolean
}

export function useFeed(filters: { type?: string; tag?: string; following?: boolean } = {}) {
  return useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: async ({ pageParam }) => {
      const { data } = await postsAPI.getFeed(
        pageParam as string | undefined,
        filters.type,
        filters.tag,
        filters.following
      )
      return data as FeedPage
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  })
}
