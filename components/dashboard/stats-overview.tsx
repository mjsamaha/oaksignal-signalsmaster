import { 
  Trophy, 
  Flag, 
  Target, 
  Flame 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CURRENT_USER, MOCK_STATS } from "@/lib/mock-data"

export function StatsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Current Rank
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{CURRENT_USER.rank}</div>
          <p className="text-xs text-muted-foreground">
            {CURRENT_USER.rankTitle}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Flags Mastered
          </CardTitle>
          <Flag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{CURRENT_USER.totalFlagsMastered}</div>
          <p className="text-xs text-muted-foreground">
            +2 since last week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Accuracy
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{CURRENT_USER.accuracy}%</div>
          <p className="text-xs text-muted-foreground">
            Top 15% of fleet
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{MOCK_STATS.currentStreak} Days</div>
          <p className="text-xs text-muted-foreground">
            Keep it up!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
