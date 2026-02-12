"use client"

/**
 * Encouragement Message Component
 * Displays contextual motivational messages with icons
 * Visual styling adapts based on correctness/celebration type
 */

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  CheckCircle,
  ThumbsUp,
  Star,
  Award,
  Sparkles,
  Info,
  BookOpen,
  Target,
  Lightbulb,
  Eye,
  Flame,
  Zap,
  TrendingUp,
  Trophy,
  Compass,
  Rocket,
  Flag,
  Heart,
  ArrowUp,
  Crown,
  Medal,
  type LucideIcon,
} from "lucide-react"
import { EncouragementMessage as EncouragementMessageType } from "@/lib/feedback-types"

interface EncouragementMessageProps {
  message: EncouragementMessageType
  isCorrect: boolean
  className?: string
}

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  CheckCircle,
  ThumbsUp,
  Star,
  Award,
  Sparkles,
  Info,
  BookOpen,
  Target,
  Lightbulb,
  Eye,
  Flame,
  Zap,
  TrendingUp,
  Trophy,
  Compass,
  Rocket,
  Flag,
  Heart,
  ArrowUp,
  Crown,
  Medal,
}

export function EncouragementMessage({
  message,
  isCorrect,
  className,
}: EncouragementMessageProps) {
  const Icon = message.icon ? ICON_MAP[message.icon] : CheckCircle

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "rounded-lg p-4 border-2 transition-colors",
          isCorrect
            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "shrink-0 rounded-full p-2",
              isCorrect
                ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
            )}
            aria-hidden="true"
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h4
              className={cn(
                "font-semibold text-lg mb-1",
                isCorrect
                  ? "text-green-900 dark:text-green-100"
                  : "text-red-900 dark:text-red-100"
              )}
            >
              {message.title}
            </h4>
            <p
              className={cn(
                "text-sm",
                isCorrect
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              )}
            >
              {message.message}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
