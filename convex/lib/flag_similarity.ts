/**
 * Flag similarity algorithms for generating plausible distractor options.
 * Calculates visual and semantic similarity between flags.
 */

import { Doc } from "../_generated/dataModel";

/**
 * Calculate color similarity between two flags.
 * Returns a score from 0 (no common colors) to 1 (all colors match).
 * 
 * @param flag1 - First flag to compare
 * @param flag2 - Second flag to compare
 * @returns Similarity score 0-1
 */
export function calculateColorSimilarity(
  flag1: Doc<"flags">,
  flag2: Doc<"flags">
): number {
  if (flag1.colors.length === 0 && flag2.colors.length === 0) {
    return 1.0; // Both have no colors defined
  }
  
  if (flag1.colors.length === 0 || flag2.colors.length === 0) {
    return 0.0; // One has colors, one doesn't
  }
  
  // Convert to sets for intersection calculation
  const colors1 = new Set(flag1.colors.map(c => c.toLowerCase()));
  const colors2 = new Set(flag2.colors.map(c => c.toLowerCase()));
  
  // Calculate Jaccard similarity (intersection / union)
  const intersection = new Set([...colors1].filter(c => colors2.has(c)));
  const union = new Set([...colors1, ...colors2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate pattern similarity between two flags.
 * Returns 1.0 if patterns match exactly, 0.5 if both have patterns but different,
 * 0.0 if only one has a pattern defined.
 * 
 * @param flag1 - First flag to compare
 * @param flag2 - Second flag to compare
 * @returns Similarity score 0-1
 */
export function calculatePatternSimilarity(
  flag1: Doc<"flags">,
  flag2: Doc<"flags">
): number {
  const pattern1 = flag1.pattern?.toLowerCase();
  const pattern2 = flag2.pattern?.toLowerCase();
  
  // Both have no pattern - neutral similarity
  if (!pattern1 && !pattern2) {
    return 0.5;
  }
  
  // Only one has pattern - low similarity
  if (!pattern1 || !pattern2) {
    return 0.0;
  }
  
  // Both have patterns
  if (pattern1 === pattern2) {
    return 1.0; // Exact match
  }
  
  // Different patterns but both exist
  return 0.3;
}

/**
 * Calculate type/category similarity between two flags.
 * Flags of the same type are more similar.
 * 
 * @param flag1 - First flag to compare
 * @param flag2 - Second flag to compare
 * @returns Similarity score 0-1
 */
export function calculateTypeSimilarity(
  flag1: Doc<"flags">,
  flag2: Doc<"flags">
): number {
  if (flag1.type === flag2.type) {
    return 1.0;
  }
  
  // Same category but different type
  if (flag1.category === flag2.category) {
    return 0.5;
  }
  
  return 0.0;
}

/**
 * Calculate name similarity for "learn mode" distractors.
 * Flags with similar names (same starting letter, similar length) are more confusing.
 * 
 * @param flag1 - First flag to compare
 * @param flag2 - Second flag to compare
 * @returns Similarity score 0-1
 */
export function calculateNameSimilarity(
  flag1: Doc<"flags">,
  flag2: Doc<"flags">
): number {
  const name1 = flag1.name.toLowerCase();
  const name2 = flag2.name.toLowerCase();
  
  let score = 0;
  
  // Same first letter (common confusion)
  if (name1[0] === name2[0]) {
    score += 0.4;
  }
  
  // Similar length (within 2 characters)
  const lengthDiff = Math.abs(name1.length - name2.length);
  if (lengthDiff === 0) {
    score += 0.3;
  } else if (lengthDiff <= 2) {
    score += 0.15;
  }
  
  // Contains common substrings
  if (name1.includes(name2.slice(0, 3)) || name2.includes(name1.slice(0, 3))) {
    score += 0.3;
  }
  
  return Math.min(score, 1.0);
}

/**
 * Calculate overall visual similarity for "match mode" distractors.
 * Weighted combination of color, pattern, and type similarity.
 * Higher weights for features that make flags look more similar visually.
 * 
 * @param targetFlag - The flag being tested
 * @param candidateFlag - Potential distractor flag
 * @returns Overall similarity score 0-1
 */
export function calculateVisualSimilarity(
  targetFlag: Doc<"flags">,
  candidateFlag: Doc<"flags">
): number {
  // Same flag - return 0 (should not be used as distractor)
  if (targetFlag._id === candidateFlag._id) {
    return 0;
  }
  
  const colorScore = calculateColorSimilarity(targetFlag, candidateFlag);
  const patternScore = calculatePatternSimilarity(targetFlag, candidateFlag);
  const typeScore = calculateTypeSimilarity(targetFlag, candidateFlag);
  
  // Weighted average - colors and patterns matter most for visual similarity
  const weightedScore = 
    (colorScore * 0.5) +      // Color is most important visually
    (patternScore * 0.3) +    // Pattern is second most important
    (typeScore * 0.2);        // Type similarity is least important
  
  return weightedScore;
}

/**
 * Calculate overall semantic similarity for "learn mode" distractors.
 * Weighted combination of name and type similarity.
 * 
 * @param targetFlag - The flag being tested
 * @param candidateFlag - Potential distractor flag
 * @returns Overall similarity score 0-1
 */
export function calculateSemanticSimilarity(
  targetFlag: Doc<"flags">,
  candidateFlag: Doc<"flags">
): number {
  // Same flag - return 0 (should not be used as distractor)
  if (targetFlag._id === candidateFlag._id) {
    return 0;
  }
  
  const nameScore = calculateNameSimilarity(targetFlag, candidateFlag);
  const typeScore = calculateTypeSimilarity(targetFlag, candidateFlag);
  
  // Weighted average - name similarity matters most for learning
  const weightedScore = 
    (nameScore * 0.7) +       // Name confusion is primary challenge
    (typeScore * 0.3);        // Type helps narrow down category
  
  return weightedScore;
}

/**
 * Rank flags by similarity to target flag.
 * Returns array of [flag, score] tuples sorted by similarity (descending).
 * 
 * @param targetFlag - The flag to compare against
 * @param candidates - Pool of potential distractor flags
 * @param mode - "visual" for match mode, "semantic" for learn mode
 * @returns Array of [flag, score] sorted by similarity
 */
export function rankBySimilarity(
  targetFlag: Doc<"flags">,
  candidates: Doc<"flags">[],
  mode: "visual" | "semantic"
): Array<[Doc<"flags">, number]> {
  const scoredFlags = candidates
    .filter(flag => flag._id !== targetFlag._id) // Exclude target itself
    .map(flag => {
      const score = mode === "visual"
        ? calculateVisualSimilarity(targetFlag, flag)
        : calculateSemanticSimilarity(targetFlag, flag);
      return [flag, score] as [Doc<"flags">, number];
    });
  
  // Sort by similarity score (descending)
  scoredFlags.sort((a, b) => b[1] - a[1]);
  
  return scoredFlags;
}
