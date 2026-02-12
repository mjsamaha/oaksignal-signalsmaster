"use client"

/**
 * Keyboard Shortcuts Hook
 * Handles keyboard navigation for quiz interface
 * Supports: 1-4 for option selection, Enter for submit
 */

import { useEffect, useCallback } from "react"
import { KEYBOARD_SHORTCUTS } from "@/lib/practice-constants"
import { mapKeyToOptionIndex } from "@/lib/quiz-validation"

interface UseKeyboardShortcutsOptions {
  onSelectOption: (index: number) => void
  onSubmit: () => void
  enabled?: boolean
  hasSelection?: boolean
}

export function useKeyboardShortcuts({
  onSelectOption,
  onSubmit,
  enabled = true,
  hasSelection = false,
}: UseKeyboardShortcutsOptions) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const key = event.key

      // Handle option selection (1-4)
      const optionIndex = mapKeyToOptionIndex(key)
      if (optionIndex !== null) {
        event.preventDefault()
        onSelectOption(optionIndex)
        return
      }

      // Handle submit (Enter)
      if (key === KEYBOARD_SHORTCUTS.SUBMIT && hasSelection) {
        event.preventDefault()
        onSubmit()
        return
      }
    },
    [onSelectOption, onSubmit, hasSelection]
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [enabled, handleKeyPress])

  return {
    // Return keyboard shortcut info for display
    shortcuts: {
      selectOption: "1-4",
      submit: "Enter",
      help: "?",
    },
  }
}
