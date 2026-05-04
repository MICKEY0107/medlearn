import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: () => apiClient.get('/api/search/trending').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}
