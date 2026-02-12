"use client"

/**
 * Feedback Flag Display Component
 * Displays flag image prominently in feedback modal
 * Optimized for modal context with larger size and enhanced styling
 */

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface FeedbackFlagDisplayProps {
  flagImage: string
  flagName: string
  flagKey: string
  isCorrect?: boolean
  className?: string
}

export function FeedbackFlagDisplay({
  flagImage,
  flagName,
  flagKey,
  isCorrect,
  className,
}: FeedbackFlagDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn("w-full", className)}
    >
      <Card
        className={cn(
          "overflow-hidden border-2",
          isCorrect
            ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
            : "border-muted bg-background"
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {/* Flag Image Container */}
            <div className="relative w-full max-w-md aspect-[3/2] bg-muted/30 rounded-lg overflow-hidden shadow-lg">
              {flagImage ? (
                <Image
                  src={flagImage}
                  alt={`${flagName} signal flag`}
                  fill
                  className="object-contain p-4"
                  priority
                  sizes="(max-width: 768px) 100vw, 448px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Flag Name */}
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">
                {flagName}
              </h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {flagKey}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
