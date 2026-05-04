import { useQuery } from '@tanstack/react-query'
import { usersAPI } from '@/lib/api-client'

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => usersAPI.getBookmarks().then((r) => r.data.bookmarks),
  })
}
