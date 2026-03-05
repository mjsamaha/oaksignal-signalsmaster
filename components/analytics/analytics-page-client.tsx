"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DateRange } from "@/lib/results-types";
import { DateRangeFilter } from "@/components/analytics/date-range-filter";
import { AnalyticsOverviewCards } from "@/components/analytics/analytics-overview-cards";
import { PerformanceTrendChart } from "@/components/analytics/performance-trend-chart";
import { CategoryBreakdownChart } from "@/components/analytics/category-breakdown-chart";
import { ModeBreakdownChart } from "@/components/analytics/mode-breakdown-chart";
import { PracticeFrequencyChart } from "@/components/analytics/practice-frequency-chart";
import { ChallengingFlagsList } from "@/components/analytics/challenging-flags-list";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsPageClient() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const summary = useQuery(api.analytics.getAnalyticsSummary, { dateRange });
  const trend = useQuery(api.analytics.getPerformanceTrend, { dateRange });
  const missedFlags = useQuery(api.analytics.getMostMissedFlags, { dateRange, limit: 5 });

  const isLoading = summary === undefined || trend === undefined || missedFlags === undefined;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review your practice history and identify areas for improvement.</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-80 w-full" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : (
        <>
          <AnalyticsOverviewCards summary={summary} />
          
          <div className="grid gap-4">
            <PerformanceTrendChart data={trend} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CategoryBreakdownChart data={summary?.categoryBreakdown} />
            </div>
            <div>
              <ModeBreakdownChart 
                learnCount={summary?.modeBreakdown.learn ?? 0} 
                matchCount={summary?.modeBreakdown.match ?? 0} 
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PracticeFrequencyChart data={summary?.weeklyFrequency} />
            </div>
            <div>
              <ChallengingFlagsList flags={missedFlags} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
