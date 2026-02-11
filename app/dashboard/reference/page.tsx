import { ReferenceClient } from "@/components/reference/reference-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Flag Reference Guide | Signals Master",
  description: "Browse and study naval signal flags, numbers, and pennants.",
}

export default function ReferencePage() {
  return (
    <div className="container mx-auto max-w-7xl py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Signal Flag Reference</h1>
        <p className="text-muted-foreground">
          Complete guide to International Code of Signals flags, pennants, and special markers.
        </p>
      </div>
      
      <ReferenceClient />
    </div>
  )
}
