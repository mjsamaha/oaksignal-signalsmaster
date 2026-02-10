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
import { RECENT_ACTIVITY } from "@/lib/mock-data"

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
        <div className="space-y-8">
          {RECENT_ACTIVITY.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <div className={`
                flex h-9 w-9 items-center justify-center rounded-full border
                ${activity.type === 'ranked' ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-500' : ''}
                ${activity.type === 'exam' ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-500' : ''}
                ${activity.type === 'practice' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' : ''}
              `}>
                {activity.type === 'ranked' && <Trophy className="h-5 w-5" />}
                {activity.type === 'exam' && <CheckCircle2 className="h-5 w-5" />}
                {activity.type === 'practice' && <Clock className="h-5 w-5" />}
              </div>
              
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none capitalize">
                  {activity.type} Session
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.date} • {activity.totalQuestions} Questions
                </p>
              </div>
              
              <div className="ml-auto font-medium">
                {activity.score ? (
                  <div className="flex flex-col items-end">
                    <span className={
                      (activity.score / activity.totalQuestions) > 0.8 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-orange-600 dark:text-orange-400"
                    }>
                      {Math.round((activity.score / activity.totalQuestions) * 100)}%
                    </span>
                    {activity.flagsReviewNeeded && (
                      <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        Needs review: {activity.flagsReviewNeeded.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
