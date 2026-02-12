"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ModeSelectionCardProps {
  title: string
  description: string
  longDescription: string
  icon: LucideIcon
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}

export function ModeSelectionCard({
  title,
  description,
  longDescription,
  icon: Icon,
  isSelected,
  onSelect,
  disabled = false,
}: ModeSelectionCardProps) {
  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={`${title} practice mode`}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected && "border-primary shadow-md bg-primary/5",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={cn(
            "mb-2 flex h-12 w-12 items-center justify-center rounded-lg border transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "bg-background text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {isSelected && (
            <Badge variant="default" className="mt-1">
              Selected
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{longDescription}</p>
      </CardContent>
    </Card>
  )
}
