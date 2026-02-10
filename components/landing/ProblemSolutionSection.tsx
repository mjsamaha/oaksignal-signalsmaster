"use client";

import { FileText, Smartphone, Zap, BarChart3, Trophy } from "lucide-react";
import { ComparisonCard } from "./ComparisonCard";
import { motion } from "framer-motion";

const oldWayData = {
  icon: FileText,
  heading: "The Old Way",
  items: [
    { text: "Static pen-and-paper tests" },
    { text: "No instant feedback" },
    { text: "No progress tracking" },
    { text: "Limited engagement" },
  ],
  variant: "old" as const,
};

const newWayData = {
  icon: Smartphone,
  heading: "The Signals Master Way",
  items: [
    { text: "Interactive, friendly quizzes", icon: Smartphone },
    { text: "Instant answer feedback", icon: Zap },
    { text: "Track your progress", icon: BarChart3 },
    { text: "Compete on leaderboards", icon: Trophy },
  ],
  variant: "new" as const,
};

export function ProblemSolutionSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
            A Better Way to Learn
          </h2>
          <p className="max-w-175 text-muted-foreground dark:text-gray-300 text-lg sm:text-xl">
            Move beyond outdated methods and embrace interactive, engaging practice.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Old Way Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ComparisonCard {...oldWayData} />
          </motion.div>

          {/* New Way Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ComparisonCard {...newWayData} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
