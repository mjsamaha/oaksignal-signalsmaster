"use client"

import { useEffect } from "react"

interface UseExamImagePreloadInput {
  currentQuestionImages?: string[]
  nextQuestionImages?: string[]
}

export function useExamImagePreload(input: UseExamImagePreloadInput) {
  useEffect(() => {
    const urls = new Set<string>([
      ...(input.currentQuestionImages ?? []),
      ...(input.nextQuestionImages ?? []),
    ]);

    urls.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [input.currentQuestionImages, input.nextQuestionImages]);
}

