"use client"

/**
 * Multiple Choice Options Component
 * Displays 4 selectable answer options with visual feedback
 * Supports keyboard navigation, touch interaction, and answer reveal
 * - "learn" mode: Displays text labels (flag names)
 * - "match" mode: Displays flag images
 */

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuestionOption, QuestionType } from "@/lib/practice-types"
import { getOptionLetter } from "@/lib/quiz-utils"
import Image from "next/image"

interface MultipleChoiceOptionsProps {
  options: QuestionOption[]
  selectedAnswer: string | null
  correctAnswer?: string // Only provided after submission for reveal
  isDisabled?: boolean
  onSelect: (optionId: string) => void
  mode?: QuestionType // "learn" or "match" - determines if showing text or images
  className?: string
}

export function MultipleChoiceOptions({
  options,
  selectedAnswer,
  correctAnswer,
  isDisabled = false,
  onSelect,
  mode = "learn",
  className,
}: MultipleChoiceOptionsProps) {
  const isAnswered = correctAnswer !== undefined

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-3",
        className
      )}
      role="radiogroup"
      aria-label="Answer options"
    >
      {options.map((option, index) => {
        const isSelected = option.id === selectedAnswer
        const isCorrect = option.id === correctAnswer
        const isIncorrect = isAnswered && isSelected && !isCorrect

        return (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${getOptionLetter(index)}${mode === "learn" && option.label ? ": " + option.label : ""}`}
              tabIndex={isDisabled ? -1 : 0}
              onClick={() => !isDisabled && onSelect(option.id)}
              onKeyDown={(e) => {
                if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  onSelect(option.id)
                }
              }}
              className={cn(
                "cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                // Minimum touch target size (WCAG)
                mode === "match" ? "min-h-32" : "min-h-18",
                // Selected state
                isSelected && !isAnswered && "border-primary border-2 shadow-md bg-primary/5",
                // Correct state
                isCorrect && "border-green-500 border-2 bg-green-50 dark:bg-green-950/20",
                // Incorrect state
                isIncorrect && "border-red-500 border-2 bg-red-50 dark:bg-red-950/20",
                // Disabled state
                isDisabled && "cursor-not-allowed opacity-60",
                // Neutral unselected after answer
                isAnswered && !isCorrect && !isIncorrect && "opacity-50"
              )}
            >
              <CardContent className="flex items-center gap-3 p-4">
                {/* Option Letter Badge */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 font-bold transition-colors",
                    isSelected && !isAnswered && "border-primary bg-primary text-primary-foreground",
                    isCorrect && "border-green-600 bg-green-600 text-white",
                    isIncorrect && "border-red-600 bg-red-600 text-white",
                    !isSelected && !isAnswered && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCorrect ? (
                    <Check className="h-5 w-5" />
                  ) : isIncorrect ? (
                    <X className="h-5 w-5" />
                  ) : (
                    getOptionLetter(index)
                  )}
                </div>

                {/* Option Content - Text for learn mode, Image for match mode */}
                {mode === "match" && option.imagePath ? (
                  // MATCH MODE: Display flag image
                  <div className="flex-1 flex items-center justify-center min-h-24">
                    <div className="relative w-full h-24">
                      <Image
                        src={option.imagePath}
                        alt={`Flag option ${getOptionLetter(index)}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                ) : (
                  // LEARN MODE: Display text label
                  <div className="flex-1 text-left">
                    <p
                      className={cn(
                        "text-base font-medium leading-snug",
                        isCorrect && "text-green-700 dark:text-green-300 font-semibold",
                        isIncorrect && "text-red-700 dark:text-red-300"
                      )}
                    >
                      {option.label}
                    </p>
                  </div>
                )}

                {/* Correct Answer Indicator */}
                {isCorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                      <Check className="h-5 w-5" />
                    </div>
                  </motion.div>
                )}

                {/* Incorrect Answer Indicator */}
                {isIncorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                      <X className="h-5 w-5" />
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
