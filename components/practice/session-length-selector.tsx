"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock } from "lucide-react"
import { SessionLength } from "@/lib/practice-constants"
import { cn } from "@/lib/utils"

interface SessionLengthSelectorProps {
  value: SessionLength | null
  onChange: (length: SessionLength) => void
  disabled?: boolean
}

const SESSION_OPTIONS = [
  { value: 5, label: "5 Flags", time: "~3 min" },
  { value: 10, label: "10 Flags", time: "~5 min" },
  { value: 15, label: "15 Flags", time: "~8 min" },
  { value: 30, label: "30 Flags", time: "~15 min" },
  { value: "all" as const, label: "All Flags", time: "~20 min" },
] as const

export function SessionLengthSelector({
  value,
  onChange,
  disabled = false,
}: SessionLengthSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Session Length</h3>
      </div>
      
      <Tabs
        value={value?.toString() || ""}
        onValueChange={(val) => {
          const parsedValue = val === "all" ? "all" : parseInt(val, 10)
          onChange(parsedValue as SessionLength)
        }}
        className="w-full"
      >
        <TabsList variant="default" className="grid w-full grid-cols-5 h-auto">
          {SESSION_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value.toString()}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "min-w-0" // Allow shrinking on mobile
              )}
              aria-label={`${option.label}, estimated time ${option.time}`}
            >
              <span className="text-xs font-semibold leading-none">{option.label}</span>
              <span className="text-[10px] leading-none opacity-70">{option.time}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <p className="text-xs text-muted-foreground text-center">
        Choose how many flags you&apos;d like to practice
      </p>
    </div>
  )
}
