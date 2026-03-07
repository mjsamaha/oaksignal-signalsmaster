"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExamQuestionMode, ExamQuestionOption } from "@/lib/exam-types"

interface ExamOptionGridProps {
  options: ExamQuestionOption[]
  mode: ExamQuestionMode
  selectedAnswer: string | null
  disabled?: boolean
  onSelect: (optionId: string) => void
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

export function ExamOptionGrid({
  options,
  mode,
  selectedAnswer,
  disabled = false,
  onSelect,
}: ExamOptionGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2"
      role="radiogroup"
      aria-label="Exam answer options"
    >
      {options.map((option, index) => {
        const selected = option.id === selectedAnswer
        const letter = getOptionLabel(index)

        return (
          <Button
            key={option.id}
            type="button"
            variant="outline"
            disabled={disabled}
            role="radio"
            aria-checked={selected}
            aria-label={`Option ${letter}`}
            onClick={() => onSelect(option.id)}
            className={cn(
              "h-auto min-h-20 justify-start p-4 text-left",
              selected && "border-primary bg-primary/5"
            )}
          >
            <div className="flex w-full items-center gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-semibold">
                {letter}
              </span>

              {mode === "match" && option.imagePath ? (
                <div className="relative h-20 w-full">
                  <Image
                    src={option.imagePath}
                    alt={`Flag option ${letter}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-sm font-medium">{option.label}</span>
              )}
            </div>
          </Button>
        )
      })}
    </div>
  )
}

