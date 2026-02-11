"use client"

import { use } from "react"
import { FlagDetailView } from "@/components/reference/flag-detail-view"

export default function FlagDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const resolvedParams = use(params)
  return <FlagDetailView flagKey={resolvedParams.key} />
}
