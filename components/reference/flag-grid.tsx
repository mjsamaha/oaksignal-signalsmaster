import { Doc } from "@/convex/_generated/dataModel"
import { FlagCard } from "./flag-card"
import { Skeleton } from "@/components/ui/skeleton"

interface FlagGridProps {
  flags: Doc<"flags">[]
  isLoading: boolean
}

export function FlagGrid({ flags, isLoading }: FlagGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
             <Skeleton className="h-[200px] w-full rounded-xl" />
             <div className="space-y-2">
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-3 w-1/2" />
             </div>
          </div>
        ))}
      </div>
    )
  }

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed animate-in fade-in-50">
        <p className="text-lg font-medium">No flags found</p>
        <p className="text-sm">Try adjusting your search or category filter.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in-50">
      {flags.map((flag) => (
        <FlagCard key={flag._id} flag={flag} />
      ))}
    </div>
  )
}
