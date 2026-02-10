"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badgeLabel: string;
}

export function FeatureCard({ icon: Icon, title, description, badgeLabel }: FeatureCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} className="h-full">
      <Card className="h-full border-border bg-card transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary" className="font-medium">
              {badgeLabel}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
