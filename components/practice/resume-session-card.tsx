"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, X, Flag } from "lucide-react"
import { PracticeSession } from "@/lib/practice-types"
import { PRACTICE_MODE_CONFIG } from "@/lib/practice-constants"

interface ResumeSessionCardProps {
  session: PracticeSession
  onResume: () => void
  onAbandon: () => void
  isAbandoning?: boolean
}

export function ResumeSessionCard({
  session,
  onResume,
  onAbandon,
  isAbandoning = false,
}: ResumeSessionCardProps) {
  const progress = (session.currentIndex / session.flagIds.length) * 100
  const modeConfig = PRACTICE_MODE_CONFIG[session.mode]
  const remainingFlags = session.flagIds.length - session.currentIndex

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Resume Practice Session
            </CardTitle>
            <CardDescription>
              You have an incomplete session in progress
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
            In Progress
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-medium">{modeConfig.label}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {session.currentIndex} of {session.flagIds.length} flags
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            <span>{remainingFlags} flag{remainingFlags !== 1 ? "s" : ""} remaining</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {session.score > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">Current Score</p>
            <p className="text-2xl font-bold text-primary">{session.score}%</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={onResume}
          className="flex-1 gap-2"
          size="default"
        >
          <PlayCircle className="h-4 w-4" />
          Resume Session
        </Button>
        <Button
          onClick={onAbandon}
          variant="outline"
          className="flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={isAbandoning}
        >
          <X className="h-4 w-4" />
          {isAbandoning ? "Abandoning..." : "Abandon Session"}
        </Button>
      </CardFooter>
    </Card>
  )
}
