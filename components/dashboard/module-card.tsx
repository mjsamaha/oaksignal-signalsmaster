import Link from "next/link"
import { LucideIcon, ArrowRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ModuleCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  ctaText?: string
  variant?: "default" | "featured"
}

export function ModuleCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  ctaText = "Start",
  variant = "default" 
}: ModuleCardProps) {
  return (
    <Card className={`flex flex-col ${variant === "featured" ? "border-primary/50 bg-primary/5 shadow-md" : ""}`}>
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border bg-background text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Placeholder for optional stats or progress bars specific to module */}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full group" variant={variant === "featured" ? "default" : "outline"}>
          <Link href={href}>
            {ctaText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
