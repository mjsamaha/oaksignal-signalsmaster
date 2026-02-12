"use client"

import { useParams } from "next/navigation"
import { Id } from "@/convex/_generated/dataModel"
import { QuizInterface } from "@/components/practice/quiz-interface"

export default function PracticeSessionPage() {
  const params = useParams()
  const sessionId = params.id as Id<"practiceSessions">

  return <QuizInterface sessionId={sessionId} />
}
