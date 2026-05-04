import { useQuery } from '@tanstack/react-query'
import { usersAPI } from '@/lib/api-client'
import { useUserPosts } from '@/hooks/useUserPosts'

export function useProfile(userId: string) {
  const profileQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersAPI.getProfile(userId).then((r) => r.data.user),
    enabled: !!userId,
  })

  const postsQuery = useUserPosts(userId)

  return {
    profile: profileQuery.data ?? null,
    posts: postsQuery.data?.posts ?? [],
    loading: profileQuery.isLoading || postsQuery.isLoading,
    error:
      profileQuery.error || postsQuery.error
        ? String(profileQuery.error ?? postsQuery.error)
        : null,
  }
}
