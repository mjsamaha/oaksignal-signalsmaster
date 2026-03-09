import Link from "next/link"
import { ShieldX, ArrowLeft, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ForbiddenPageProps = {
  searchParams?: {
    reason?: string
  }
}

export default function ForbiddenPage({ searchParams }: ForbiddenPageProps) {
  const isDomainRejected = searchParams?.reason === "domain"

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl border-border/70 shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
            <ShieldX className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl tracking-tight">403 Forbidden</CardTitle>
          <CardDescription className="text-base">
            {isDomainRejected
              ? "Your domain is not accepted."
              : "You are authenticated, but your account does not have permission to access this admin resource."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return To Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
