import Link from "next/link"
import { Bell, Search, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CURRENT_USER } from "@/lib/mock-data"
import { ModeToggle } from "@/components/mode-toggle"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          S
        </span>
        Signals Master
      </div>
      <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-medium">
        <Link href="/dashboard" className="text-foreground transition-colors hover:text-primary">
          Dashboard
        </Link>
        <Link href="/dashboard/practice" className="text-muted-foreground transition-colors hover:text-primary">
          Practice
        </Link>
        <Link href="/dashboard/exam" className="text-muted-foreground transition-colors hover:text-primary">
          Exam
        </Link>
        <Link href="/dashboard/reference" className="text-muted-foreground transition-colors hover:text-primary">
          Reference
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full border bg-muted">
              <span className="font-semibold text-xs">{CURRENT_USER.avatarUrl}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{CURRENT_USER.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{CURRENT_USER.rankTitle}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
