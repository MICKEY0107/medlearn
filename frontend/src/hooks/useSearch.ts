import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function useSearch(query: string) {
  const [results, setResults] = useState<{
    papers: any[]
    users: any[]
    posts: any[]
  }>({ papers: [], users: [], posts: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ papers: [], users: [], posts: [] })
      return
    }


    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults({
            users: data.users || [],
            papers: data.papers || [],
            posts: data.posts || [],
          })
        }
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  return { results, loading }
}
