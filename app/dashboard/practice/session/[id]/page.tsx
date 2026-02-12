"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Construction, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PracticeSessionPage() {
  const params = useParams()
  const sessionId = params.id as Id<"practiceSessions">

  // Fetch session data
  const session = useQuery(api.practice_sessions.getSessionById, { sessionId })

  if (session === undefined) {
    return (
      <div className="container mx-auto max-w-4xl py-12 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>
              The practice session you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/practice">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Practice Selection
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/practice">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Practice Session</h1>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="h-8 w-8 text-amber-500" />
            <div>
              <CardTitle>Practice Interface Coming Soon</CardTitle>
              <CardDescription>
                The interactive practice session interface will be implemented in the next phase
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h3 className="font-semibold">Session Details:</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <span className="font-medium capitalize">{session.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Flags:</span>
                <span className="font-medium">{session.flagIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">
                  {session.currentIndex} / {session.flagIds.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{session.status}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This page will contain the quiz interface, flag display, answer options, 
            progress tracking, and scoring logic in a future user story implementation.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/practice">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Practice Selection
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
