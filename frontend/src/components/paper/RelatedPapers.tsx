import Link from 'next/link'

export function RelatedPapers({
  papers,
  paperId: _paperId,
  tags: _tags,
}: {
  papers: any[]
  paperId?: string
  tags?: string[]
}) {
  if (!papers?.length) {
    return (
      <div className="text-[14px] text-muted-foreground px-2">
        No similar papers found yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[16px] font-bold text-foreground">Related papers</h3>
      <ul className="flex flex-col gap-2">
        {papers.map((p) => (
          <li key={p.id}>
            <Link
              href={`/paper/${p.id}`}
              className="text-[14px] text-brand hover:underline font-medium line-clamp-2"
            >
              {p.title}
            </Link>
            {p.year != null && (
              <span className="text-[12px] text-muted-foreground ml-2">{p.year}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
