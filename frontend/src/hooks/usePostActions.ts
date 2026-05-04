import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postsAPI } from '@/lib/api-client'

export function usePostActions(postId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] })
    queryClient.invalidateQueries({ queryKey: ['post', postId] })
    queryClient.invalidateQueries({ queryKey: ['user-posts'] })
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  }

  return {
    like: useMutation({
      mutationFn: () => postsAPI.like(postId),
      onSuccess: invalidate,
    }),
    unlike: useMutation({
      mutationFn: () => postsAPI.unlike(postId),
      onSuccess: invalidate,
    }),
    bookmark: useMutation({
      mutationFn: () => postsAPI.bookmark(postId),
      onSuccess: invalidate,
    }),
    unbookmark: useMutation({
      mutationFn: () => postsAPI.unbookmark(postId),
      onSuccess: invalidate,
    }),
    repost: useMutation({
      mutationFn: () => postsAPI.repost(postId),
      onSuccess: invalidate,
    }),
  }
}
