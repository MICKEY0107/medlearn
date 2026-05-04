import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsAPI } from '@/lib/api-client'

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsAPI.getByPost(postId).then((r) => r.data.comments),
    enabled: !!postId,
  })
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string; parentCommentId?: string }) =>
      commentsAPI.create(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}

export function useMarkBestAnswer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => commentsAPI.markBestAnswer(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}
