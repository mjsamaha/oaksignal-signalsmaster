"use client"

/**
 * Similar Flags Section Component
 * Displays related/confusable flags to help users distinguish between similar signals
 * Shows why flags might be confused (same colors, patterns, etc.)
 */

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { SimilarFlagData } from "@/lib/feedback-types"

interface SimilarFlagsSectionProps {
  flags: SimilarFlagData[]
  className?: string
}

export function SimilarFlagsSection({
  flags,
  className,
}: SimilarFlagsSectionProps) {
  if (flags.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn("w-full", className)}
    >
      <div className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <h4 className="text-sm font-semibold">
            Flags that might be confused
          </h4>
          <Info className="h-3.5 w-3.5 ml-auto" />
        </div>

        {/* Similar Flags Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
          {flags.map((flag, index) => (
            <motion.div
              key={flag._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={`/dashboard/reference/flags/${flag.key}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
              >
                <Card className="overflow-hidden hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-md group">
                  {/* Flag Image */}
                  <div className="aspect-square relative bg-muted/30 border-b p-3 group-hover:bg-muted/50 transition-colors">
                    <div className="relative w-full h-full">
                      <Image
                        src={flag.imagePath}
                        alt={flag.name}
                        fill
                        className="object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                        unoptimized
                        sizes="(max-width: 640px) 33vw, 120px"
                      />
                    </div>
                  </div>

                  {/* Flag Name */}
                  <CardContent className="p-2">
                    <p className="text-xs font-medium text-center truncate group-hover:text-primary transition-colors">
                      {flag.name}
                    </p>
                    {flag.matchReason && (
                      <p className="text-[10px] text-muted-foreground text-center mt-0.5 line-clamp-1">
                        {flag.matchReason}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground text-center pt-1">
          Click any flag to view detailed information and comparisons
        </p>
      </div>
    </motion.div>
  )
}
