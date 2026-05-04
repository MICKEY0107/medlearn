import { useQuery } from '@tanstack/react-query'
import { usersAPI } from '@/lib/api-client'

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => usersAPI.getPosts(userId).then((r) => r.data),
    enabled: !!userId,
  })
}
