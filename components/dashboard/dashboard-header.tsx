"use client"

import Link from "next/link"
import Image from "next/image"
import { Bell, MessageSquarePlus, Shield } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  const user = useQuery(api.users.getCurrentUser)
  const openFeedbackWidget = () => {
    if (typeof window !== "undefined") {
      window.uj?.showWidget?.()
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
          <Image src="/flag.svg" alt="Signals Master logo" width={32} height={32} className="h-8 w-8" priority />
          <span className="hidden sm:inline">Signals Master</span>
        </div>

        <nav className="ml-4 hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/dashboard" className="text-foreground transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/dashboard/practice" className="text-muted-foreground transition-colors hover:text-primary">
            Practice
          </Link>
          <Link href="/dashboard/exam" className="text-muted-foreground transition-colors hover:text-primary">
            Exam
          </Link>
          <Link href="/dashboard/analytics" className="text-muted-foreground transition-colors hover:text-primary">
            Analytics
          </Link>
          <Link href="/dashboard/reference" className="text-muted-foreground transition-colors hover:text-primary">
            Reference
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user?.role === "admin" ? (
            <>
              <Button
                asChild
                size="sm"
                className="hidden border border-red-200/30 bg-linear-to-r from-red-600 via-red-500 to-rose-500 font-semibold text-white shadow-sm hover:from-red-500 hover:via-red-400 hover:to-rose-400 md:inline-flex"
              >
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Console
                </Link>
              </Button>
              <Button
                asChild
                size="icon"
                className="border border-red-200/30 bg-linear-to-r from-red-600 via-red-500 to-rose-500 text-white hover:from-red-500 hover:via-red-400 hover:to-rose-400 md:hidden"
              >
                <Link href="/admin">
                  <Shield className="h-4 w-4" />
                  <span className="sr-only">Admin Console</span>
                </Link>
              </Button>
            </>
          ) : null}

          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={openFeedbackWidget}>
            <MessageSquarePlus className="h-5 w-5" />
            <span className="sr-only">Open feedback</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="ml-1 flex items-center gap-3 border-l pl-3">
            {user ? (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            ) : null}
            {clerkEnabled ? <UserButton afterSignOutUrl="/logout" /> : null}
          </div>
        </div>
      </div>

      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard/practice">Practice</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard/exam">Exam</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard/analytics">Analytics</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/dashboard/reference">Reference</Link>
        </Button>
        {user?.role === "admin" ? (
          <Button asChild size="sm" className="shrink-0 bg-linear-to-r from-red-600 via-red-500 to-rose-500 text-white hover:from-red-500 hover:via-red-400 hover:to-rose-400">
            <Link href="/admin">Admin</Link>
          </Button>
        ) : null}
      </nav>
    </header>
  )
}
