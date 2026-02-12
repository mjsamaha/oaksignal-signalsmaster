"use client"

/**
 * Answer Feedback Component
 * Displays correct/incorrect feedback with explanation
 * Slides in from bottom with Framer Motion animation
 */

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnswerFeedbackProps {
  isVisible: boolean
  isCorrect: boolean
  flagName: string
  flagMeaning: string
  streak?: number
  className?: string
}

export function AnswerFeedback({
  isVisible,
  isCorrect,
  flagName,
  flagMeaning,
  streak = 0,
  className,
}: AnswerFeedbackProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4", className)}
        >
          <Card
            className={cn(
              "border-2 shadow-2xl",
              isCorrect 
                ? "border-green-500 bg-green-50 dark:bg-green-950/30" 
                : "border-red-500 bg-red-50 dark:bg-red-950/30"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0">
                  {isCorrect ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                      <CheckCircle2 className="h-7 w-7 text-white" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                      <XCircle className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "text-2xl font-bold",
                        isCorrect 
                          ? "text-green-700 dark:text-green-300" 
                          : "text-red-700 dark:text-red-300"
                      )}
                    >
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </h3>
                    
                    {/* Streak indicator */}
                    {isCorrect && streak > 0 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white"
                      >
                        <Sparkles className="h-3 w-3" />
                        {streak} streak
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-base">
                      <span className="font-semibold text-foreground">
                        {flagName}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {flagMeaning}
                    </p>
                  </div>

                  {isCorrect && (
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium pt-1">
                      Great job! Moving to next question...
                    </p>
                  )}

                  {!isCorrect && (
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium pt-1">
                      Keep practicing! Moving to next question...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
