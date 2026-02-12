import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  Trophy
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// TODO: Add Convex query for recent activities
// const recentActivities = useQuery(api.activities.getRecent)

export function RecentActivity() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest practice sessions and exam attempts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <div className="text-center space-y-2">
            <Clock className="h-12 w-12 mx-auto opacity-20" />
            <p className="text-sm">No recent activity to display</p>
            <p className="text-xs">Complete a practice session to see your progress here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
