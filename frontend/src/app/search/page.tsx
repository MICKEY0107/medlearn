'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, SearchX, Loader2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { EmptyState } from '@/components/shared/EmptyState'
import { useSearch } from '@/hooks/useSearch'

type FilterTab = 'all' | 'people' | 'papers' | 'posts'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const queryParam = searchParams.get('q') || ''
  const [query, setQuery] = useState(queryParam)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const { results, loading } = useSearch(query)

  // Keep input in sync if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    if (newQuery.trim()) {
      router.replace(`/search?q=${encodeURIComponent(newQuery)}`)
    } else {
      router.replace('/search')
    }
  }

  const peopleResults = results.users || []
  const paperResults = results.papers || []
  const postResults = results.posts || []

  const hasResults = peopleResults.length > 0 || paperResults.length > 0 || postResults.length > 0
  const isQuerying = query.trim().length >= 2

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'

  return (
    <PageWrapper>
      <div className="w-full max-w-[752px] mx-auto py-6 sm:py-8 px-4 sm:px-0 mb-20">
        
        {/* Search Input Bar */}
        <div className="relative mb-[24px]">
          <Search size={20} className="absolute left-[20px] top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search for researchers, papers, and discussions..."
            className="w-full bg-[#F3F2EE] border border-transparent focus:border-brand focus:bg-white rounded-[24px] px-[20px] py-[12px] pl-[52px] text-[15px] outline-none transition-colors shadow-sm"
          />
          {loading && (
            <Loader2 size={20} className="absolute right-[20px] top-1/2 -translate-y-1/2 animate-spin text-brand/60" />
          )}
        </div>

        {/* Filters */}
        {isQuerying && hasResults && (
           <div className="flex items-center border-b border-border overflow-x-auto scrollbar-hide mb-[24px] px-2 shadow-sm bg-white rounded-t-[8px]">
             {[
               { id: 'all', label: 'All' },
               { id: 'people', label: `People (${peopleResults.length})` },
               { id: 'papers', label: `Papers (${paperResults.length})` },
               { id: 'posts', label: `Posts (${postResults.length})` }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveFilter(tab.id as FilterTab)}
                 className={`px-[16px] py-[12px] text-[14px] font-bold whitespace-nowrap border-b-[2px] transition-colors ${
                   activeFilter === tab.id 
                     ? 'border-brand text-brand' 
                     : 'border-transparent text-muted-foreground hover:text-foreground/80 hover:border-black/20'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
           </div>
        )}

        {/* Content Renderers */}
        <div className="flex flex-col gap-[32px]">
          
          {/* Empty States */}
          {!isQuerying && !loading && (
            <div className="bg-white border border-border rounded-[8px] mt-8">
               <EmptyState 
                 icon={<Search size={48} className="opacity-20" />}
                 title="Search MedLearn"
                 description="Find researchers, read latest papers, and explore active discussions."
               />
            </div>
          )}

          {isQuerying && !hasResults && !loading && (
             <div className="bg-white border border-border rounded-[8px]">
               <EmptyState 
                 icon={<SearchX size={48} className="opacity-40" />}
                 title={`No results for "${query}"`}
                 description="Try using different keywords, checking for typos, or removing filters."
                 actionText="Back to feed"
                 actionHref="/feed"
               />
             </div>
          )}

          {/* People Results */}
          {isQuerying && (activeFilter === 'all' || activeFilter === 'people') && peopleResults.length > 0 && (
             <section>
               <h2 className="text-[16px] font-bold mb-[12px]">People ({peopleResults.length})</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
                 {peopleResults.map((user: any) => (
                   <Link href={`/profile/${user.id}`} key={user.id} className="bg-white border border-border rounded-[8px] p-[16px] hover:shadow-md transition-shadow group flex flex-col justify-between">
                     <div>
                       <div className="w-[48px] h-[48px] rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-[18px] mb-[12px]">
                         {getInitials(user.name)}
                       </div>
                       <h3 className="text-[14px] font-bold group-hover:text-brand transition-colors truncate">{user.name}</h3>
                       <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{user.headline}</p>
                     </div>
                     <button className="w-full mt-[16px] border border-brand text-brand font-semibold text-[13px] py-[6px] rounded-[16px] hover:bg-brand/5 transition-colors">
                       Connect
                     </button>
                   </Link>
                 ))}
               </div>
             </section>
          )}

          {/* Papers Results */}
          {isQuerying && (activeFilter === 'all' || activeFilter === 'papers') && paperResults.length > 0 && (
             <section>
               <h2 className="text-[16px] font-bold mb-[12px]">Papers ({paperResults.length})</h2>
               <div className="flex flex-col gap-[12px]">
                 {paperResults.map((paper: any) => (
                   <Link href={`/paper/${paper.id}`} key={paper.id} className="bg-white border border-border rounded-[8px] p-[16px] hover:bg-[#F8F9FA] transition-colors group">
                     <h3 className="text-[15px] font-bold leading-snug mb-1 group-hover:text-brand line-clamp-2">{paper.title}</h3>
                     <p className="text-[13px] text-muted-foreground truncate mb-1">{(paper.authors || []).join(', ')}</p>
                     
                     <div className="text-[12px] text-muted-foreground mb-3 flex items-center gap-1">
                       <span>{paper.year}</span>
                       {paper.journal && (
                         <>
                           <span>·</span>
                           <span className="italic truncate">{paper.journal}</span>
                         </>
                       )}
                     </div>
                   </Link>
                 ))}
               </div>
             </section>
          )}

          {/* Posts Results */}
          {isQuerying && (activeFilter === 'all' || activeFilter === 'posts') && postResults.length > 0 && (
             <section>
               <h2 className="text-[16px] font-bold mb-[12px]">Posts ({postResults.length})</h2>
               <div className="flex flex-col gap-[12px]">
                 {postResults.map((post: any) => (
                    <Link href={`/post/${post.id}`} key={post.id} className="bg-white border border-border rounded-[8px] p-[14px] hover:bg-[#F8F9FA] transition-colors group">
                      <span className="inline-block px-[8px] py-[2px] rounded-[4px] bg-black/5 text-muted-foreground text-[11px] font-bold uppercase tracking-wide mb-2">
                        {post.type}
                      </span>
                      <p className="text-[13px] text-foreground/90 font-medium leading-snug line-clamp-2 mb-2 group-hover:text-brand">
                        {post.title || post.content}
                      </p>
                      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <span className="font-semibold">{post.author?.name || 'Researcher'}</span>
                        <span>·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
               </div>
             </section>
          )}

        </div>
      </div>
    </PageWrapper>
  )
}
