import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserjotWidget } from "@/components/userjot-widget"
import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <UserjotWidget />
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
