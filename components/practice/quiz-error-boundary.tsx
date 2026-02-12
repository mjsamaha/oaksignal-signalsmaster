"use client"

/**
 * Quiz Error Boundary Component
 * Catches runtime errors in quiz interface and provides recovery options
 */

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface QuizErrorBoundaryProps {
  children: React.ReactNode
}

interface QuizErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class QuizErrorBoundary extends React.Component<
  QuizErrorBoundaryProps,
  QuizErrorBoundaryState
> {
  constructor(props: QuizErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(): Partial<QuizErrorBoundaryState> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error("Quiz Error Boundary caught an error:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // In production, you would send this to an error tracking service
    // Example: sendErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    
    // Reload the page to reset state completely
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-900 dark:text-red-100">
                    Something went wrong
                  </CardTitle>
                  <CardDescription>
                    An error occurred while loading the quiz
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Error details:
                </p>
                <p className="text-sm font-mono text-foreground">
                  {this.state.error?.message || "Unknown error"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Quiz
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Link href="/dashboard/practice">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Practice
                  </Link>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2">
                If this problem persists, please contact support
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
