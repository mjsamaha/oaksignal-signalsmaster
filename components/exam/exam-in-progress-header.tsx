import { Badge } from "@/components/ui/badge"

interface ExamInProgressHeaderProps {
  attemptNumber: number
}

export function ExamInProgressHeader({ attemptNumber }: ExamInProgressHeaderProps) {
  return (
    <div className="space-y-2">
      <Badge variant="destructive" className="uppercase tracking-wide">
        Official Examination
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight">Official Examination - In Progress</h1>
      <p className="text-sm text-muted-foreground">
        Attempt #{attemptNumber}. Answer each question once and continue forward.
      </p>
    </div>
  )
}
