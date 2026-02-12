"use client"

/**
 * Submit Button Component
 * Answer submission button with disabled, loading, and success states
 */

import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmitButtonProps {
  disabled: boolean
  isLoading: boolean
  isSuccess?: boolean
  onClick: () => void
  className?: string
}

export function SubmitButton({
  disabled,
  isLoading,
  isSuccess = false,
  onClick,
  className,
}: SubmitButtonProps) {
  return (
    <Button
      size="lg"
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "min-w-48 transition-all duration-200",
        isSuccess && "bg-green-600 hover:bg-green-700",
        className
      )}
      aria-label={
        disabled 
          ? "Select an answer to submit" 
          : isLoading 
          ? "Submitting answer..." 
          : "Submit answer"
      }
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Submitting...
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Submitted
        </>
      ) : (
        "Submit Answer"
      )}
    </Button>
  )
}
