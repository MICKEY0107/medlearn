export function AISkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full animate-pulse">
      {/* Section header mock */}
      <div className="h-9 w-full bg-muted rounded-xl" />

      {/* Lines */}
      <div className="flex flex-col gap-2 px-1 pt-1">
        <div className="h-3 w-[88%] bg-muted rounded-full" />
        <div className="h-3 w-[72%] bg-muted rounded-full" />
        <div className="h-3 w-[95%] bg-muted rounded-full" />
        <div className="h-3 w-[60%] bg-muted rounded-full" />
      </div>

      <div className="h-9 w-full bg-muted rounded-xl mt-2" />

      <div className="flex flex-col gap-2 px-1 pt-1">
        <div className="h-3 w-[80%] bg-muted rounded-full" />
        <div className="h-3 w-[65%] bg-muted rounded-full" />
        <div className="h-3 w-[90%] bg-muted rounded-full" />
      </div>

      <div className="h-9 w-full bg-muted rounded-xl mt-2" />
    </div>
  )
}
