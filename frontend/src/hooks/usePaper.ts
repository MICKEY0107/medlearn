import { useQuery } from '@tanstack/react-query'
import { papersAPI } from '@/lib/api-client'

export function usePaper(id: string) {
  return useQuery({
    queryKey: ['paper', id],
    queryFn: () => papersAPI.getById(id).then((r) => r.data.paper),
    enabled: !!id,
  })
}

export function useSimilarPapers(id: string) {
  return useQuery({
    queryKey: ['similar-papers', id],
    queryFn: () => papersAPI.getSimilar(id).then((r) => r.data.papers),
    enabled: !!id,
  })
}
