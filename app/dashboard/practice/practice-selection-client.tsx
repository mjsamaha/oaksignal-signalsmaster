"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BookOpen, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeSelectionCard } from "@/components/practice/mode-selection-card"
import { SessionLengthSelector } from "@/components/practice/session-length-selector"
import { PracticeStats } from "@/components/practice/practice-stats"
import { ResumeSessionCard } from "@/components/practice/resume-session-card"
import { PRACTICE_MODES, PracticeMode, SessionLength } from "@/lib/practice-constants"
import { validateSessionConfig } from "@/lib/practice-utils"
import { useToast } from "@/hooks/use-toast"

export function PracticeSelectionClient() {
  const router = useRouter()
  const { toast } = useToast()

  // State management
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null)
  const [selectedLength, setSelectedLength] = useState<SessionLength | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Convex queries
  const incompleteSession = useQuery(api.practice_sessions.getIncompleteSession)
  const userStats = useQuery(api.practice_sessions.getUserPracticeStats)

  // Convex mutations
  const createSession = useMutation(api.practice_sessions.createPracticeSession)
  const abandonSession = useMutation(api.practice_sessions.abandonSession)
  const [isAbandoning, setIsAbandoning] = useState(false)

  // Validation
  const validation = validateSessionConfig({
    mode: selectedMode ?? undefined,
    sessionLength: selectedLength ?? undefined,
  })

  const canStart = validation.isValid && !incompleteSession

  // Handlers
  const handleStartPractice = async () => {
    if (!selectedMode || !selectedLength || !canStart) return

    setIsCreating(true)
    try {
      // Show loading toast for generation process
      toast({
        title: "Generating questions...",
        description: "Creating your personalized practice session with randomized questions.",
      })

      const sessionId = await createSession({
        mode: selectedMode,
        sessionLength: selectedLength,
      })

      toast({
        title: "Practice session created!",
        description: "Questions generated successfully. Starting your session...",
      })

      // Navigate to session page
      router.push(`/dashboard/practice/session/${sessionId}`)
    } catch (error) {
      console.error("Failed to create session:", error)
      
      // Enhanced error handling with specific messages
      const errorMessage = error instanceof Error ? error.message : "Please try again"
      const isInsufficientFlags = errorMessage.includes("Insufficient flags")
      const isGenerationError = errorMessage.includes("Failed to generate")
      
      toast({
        title: isInsufficientFlags 
          ? "Not enough flags available" 
          : isGenerationError
          ? "Question generation failed"
          : "Failed to create session",
        description: errorMessage,
        variant: "destructive",
      })
      setIsCreating(false)
    }
  }

  const handleResumeSession = () => {
    if (!incompleteSession) return
    router.push(`/dashboard/practice/session/${incompleteSession._id}`)
  }

  const handleAbandonSession = async () => {
    if (!incompleteSession) return

    setIsAbandoning(true)
    try {
      await abandonSession({ sessionId: incompleteSession._id })
      toast({
        title: "Session abandoned",
        description: "You can now start a new practice session",
      })
    } catch (error) {
      console.error("Failed to abandon session:", error)
      toast({
        title: "Failed to abandon session",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsAbandoning(false)
    }
  }

  // Loading state
  const isLoading = incompleteSession === undefined || userStats === undefined

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Mode</h1>
        <p className="text-muted-foreground">
          Choose your learning style and configure your practice session to master signal flags at your own pace.
        </p>
      </div>

      {/* Statistics */}
      <PracticeStats stats={userStats} isLoading={isLoading} />

      {/* Resume Session Card */}
      {incompleteSession && (
        <ResumeSessionCard
          session={incompleteSession}
          onResume={handleResumeSession}
          onAbandon={handleAbandonSession}
          isAbandoning={isAbandoning}
        />
      )}

      {/* Mode Selection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Practice Mode</h2>
          <p className="text-sm text-muted-foreground">
            Choose how you want to practice your flag recognition skills
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ModeSelectionCard
            title="Learn the Flag"
            description="Study mode with detailed information"
            longDescription="Focus on memorization. Each flag is presented with its name, meaning, and visual details. Take your time to learn at your own pace."
            icon={BookOpen}
            isSelected={selectedMode === PRACTICE_MODES.LEARN}
            onSelect={() => setSelectedMode(PRACTICE_MODES.LEARN)}
            disabled={!!incompleteSession}
          />

          <ModeSelectionCard
            title="Match Meaning to Flag"
            description="Test your knowledge with quizzes"
            longDescription="Quiz-style practice where you identify the correct meaning or name for each flag. Perfect for testing recall and reinforcing memory."
            icon={Brain}
            isSelected={selectedMode === PRACTICE_MODES.MATCH}
            onSelect={() => setSelectedMode(PRACTICE_MODES.MATCH)}
            disabled={!!incompleteSession}
          />
        </div>
      </div>

      {/* Session Length Selection */}
      {selectedMode && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Configure Session</h2>
            <p className="text-sm text-muted-foreground">
              Select how many flags you want to practice
            </p>
          </div>

          <SessionLengthSelector
            value={selectedLength}
            onChange={setSelectedLength}
            disabled={!!incompleteSession}
          />
        </div>
      )}

      {/* Start Button */}
      <div className="flex flex-col items-center gap-4 pt-4 border-t">
        <Button
          onClick={handleStartPractice}
          disabled={!canStart || isCreating}
          size="lg"
          className="w-full md:w-auto min-w-50"
        >
          {isCreating ? "Generating Questions..." : "Start Practice"}
        </Button>

        {!validation.isValid && selectedMode && selectedLength && (
          <p className="text-sm text-muted-foreground text-center">
            {validation.errors[0]}
          </p>
        )}

        {incompleteSession && (
          <p className="text-sm text-muted-foreground text-center">
            Please resume or abandon your current session to start a new one
          </p>
        )}
      </div>
    </div>
  )
}
