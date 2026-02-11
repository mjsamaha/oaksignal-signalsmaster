import { Doc } from "@/convex/_generated/dataModel"

interface ReferenceStatsProps {
  flags: Doc<"flags">[]
  category: string
}

export function ReferenceStats({ flags, category }: ReferenceStatsProps) {
  const count = flags.length
  const label = category === "all" ? "Total flags" : `${category.charAt(0).toUpperCase() + category.slice(1)} flags`
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="h-4 w-1 bg-primary rounded-full" />
      <span className="font-medium text-foreground">{count}</span> 
      {label}
    </div>
  )
}
