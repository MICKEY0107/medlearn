import { prisma } from './prisma'

export async function attachPostInteractionFlags<T extends { id: string }>(posts: T[], userId: string) {
  if (posts.length === 0) return []
  const ids = posts.map((p) => p.id)
  const [likedRows, bmRows] = await Promise.all([
    prisma.like.findMany({
      where: { userId, targetType: 'post', targetId: { in: ids } },
      select: { targetId: true },
    }),
    prisma.bookmark.findMany({
      where: { userId, postId: { in: ids } },
      select: { postId: true },
    }),
  ])
  const liked = new Set(likedRows.map((l) => l.targetId))
  const bmed = new Set(bmRows.map((b) => b.postId))
  return posts.map((p) => ({
    ...p,
    isLiked: liked.has(p.id),
    isBookmarked: bmed.has(p.id),
  }))
}
