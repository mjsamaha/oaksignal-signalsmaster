/**
 * Core randomization utilities for practice session generation.
 * Implements Fisher-Yates shuffle and answer position distribution.
 */

/**
 * Fisher-Yates shuffle algorithm - unbiased random array shuffling.
 * Time complexity: O(n), Space complexity: O(1) in-place.
 * 
 * @param array - Array to shuffle (will be modified in place)
 * @returns The shuffled array (same reference)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]; // Create a copy to avoid mutating the input
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

/**
 * Seeded random number generator for deterministic testing.
 * Uses a simple Linear congruential generator (LCG).
 * 
 * @param seed - Integer seed for reproducible randomness
 * @returns Function that generates random numbers in [0, 1)
 */
export function seededRandom(seed: number): () => number {
  let state = seed;
  
  return function() {
    // LCG parameters from Numerical Recipes
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Shuffle array with seeded random for reproducible results.
 * 
 * @param array - Array to shuffle
 * @param seed - Seed for deterministic shuffling
 * @returns Shuffled array
 */
export function shuffleArraySeeded<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const random = seededRandom(seed);
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

/**
 * Ensures correct answer is distributed evenly across all position indices.
 * This prevents patterns where correct answer is always in position 0 or 3.
 * 
 * For a set of questions, this distributes correct answers across positions [0, 1, 2, 3]
 * as evenly as possible.
 * 
 * @param questionCount - Total number of questions in the session
 * @returns Array of position indices (0-3) for each question's correct answer
 * 
 * @example
 * distributeAnswerPositions(5) // might return [2, 0, 3, 1, 2]
 * distributeAnswerPositions(4) // might return [1, 3, 0, 2]
 */
export function distributeAnswerPositions(questionCount: number): number[] {
  const positions: number[] = [];
  const optionCount = 4; // Standard multiple-choice has 4 options
  
  // Fill with even distribution first
  for (let i = 0; i < questionCount; i++) {
    positions.push(i % optionCount);
  }
  
  // Shuffle to avoid predictable pattern (e.g., A, B, C, D, A, B, C, D...)
  return shuffleArray(positions);
}

/**
 * Shuffle with seed-based answer position distribution.
 * Used when randomSeed parameter is provided for reproducible question sets.
 * 
 * @param questionCount - Number of questions
 * @param seed - Random seed
 * @returns Array of position indices
 */
export function distributeAnswerPositionsSeeded(
  questionCount: number,
  seed: number
): number[] {
  const positions: number[] = [];
  const optionCount = 4;
  
  for (let i = 0; i < questionCount; i++) {
    positions.push(i % optionCount);
  }
  
  return shuffleArraySeeded(positions, seed);
}

/**
 * Select N random items from an array without replacement.
 * 
 * @param array - Source array
 * @param count - Number of items to select
 * @returns Array of randomly selected items
 * @throws Error if count > array.length
 */
export function selectRandomItems<T>(array: T[], count: number): T[] {
  if (count > array.length) {
    throw new Error(
      `Cannot select ${count} items from array of length ${array.length}`
    );
  }
  
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}
