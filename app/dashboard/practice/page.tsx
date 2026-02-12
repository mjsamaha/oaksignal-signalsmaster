import { PracticeSelectionClient } from "./practice-selection-client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Practice Mode | Signals Master",
  description: "Customize your practice session and master naval signal flags at your own pace.",
}

export default function PracticePage() {
  return <PracticeSelectionClient />
}
