"use client";

import { BookOpen, ClipboardCheck, Trophy } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    title: "Practice & Learn",
    description: "Choose 5 to 30+ flags and practice identifying them by name or meaning. Get instant feedback and track flags you need to review.",
    badgeLabel: "Customizable Sessions",
  },
  {
    icon: ClipboardCheck,
    title: "Formal Exams",
    description: "Test your knowledge with randomized exams covering all flags. Pass with 80%+ accuracy and build your official exam history.",
    badgeLabel: "Tracked Results",
  },
  {
    icon: Trophy,
    title: "Compete for Ranks",
    description: "Race against the clock to identify flags as fast as possible. Climb the leaderboard and earn your place as Signals Master.",
    badgeLabel: "Real-Time Leaderboard",
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background border-b border-border/40">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
            Three Ways to Master Signal Flags
          </h2>
          <p className="max-w-[900px] text-muted-foreground dark:text-gray-300 text-lg sm:text-xl">
            Choose your path: Learn at your pace, prove your knowledge, or compete for the top spot.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
