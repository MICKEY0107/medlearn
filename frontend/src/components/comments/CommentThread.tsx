import { CommentCard } from './CommentCard'

export function CommentThread({
  comments,
  postId,
}: {
  comments: any[]
  postId: string
}) {
  const topLevelComments = comments.filter((c) => !c.parentCommentId)

  const sortedTopLevel = [...topLevelComments].sort((a, b) => {
    if (a.isBestAnswer) return -1
    if (b.isBestAnswer) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="flex flex-col">
      {sortedTopLevel.map((comment) => {
        const replies = comments.filter((c) => c.parentCommentId === comment.id)
        const sortedReplies = [...replies].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        return (
          <CommentCard key={comment.id} comment={comment} replies={sortedReplies} postId={postId} />
        )
      })}
    </div>
  )
}
