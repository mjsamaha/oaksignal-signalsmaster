/**
 * Distractor generation for multiple-choice practice questions.
 * Selects plausible wrong answers for both "learn" and "match" modes.
 */

import { Doc } from "../_generated/dataModel";
import { QuestionOption } from "./types";
import { selectRandomItems } from "./randomization";
import { rankBySimilarity } from "./flag_similarity";

/**
 * Generate 4 multiple-choice options for "Learn the Flag" mode.
 * Shows flag image, user selects correct name.
 * 
 * Strategy:
 * - Option pool: 3 plausible wrong names + 1 correct name
 * - Distractors selected based on name similarity (confusing names)
 * - Options shuffled randomly
 * 
 * @param targetFlag - The flag being tested (correct answer)
 * @param allFlags - Complete pool of available flags
 * @param correctAnswerPosition - Index where correct answer should be placed (0-3)
 * @returns Object with shuffled options array and correct answer ID
 */
export function generateLearnModeOptions(
  targetFlag: Doc<"flags">,
  allFlags: Doc<"flags">[],
  correctAnswerPosition: number
): { options: QuestionOption[]; correctAnswer: string } {
  if (allFlags.length < 4) {
    throw new Error(
      `Insufficient flags for question generation. Need at least 4, got ${allFlags.length}`
    );
  }
  
  // Rank other flags by semantic similarity (name confusion)
  const rankedDistractors = rankBySimilarity(targetFlag, allFlags, "semantic");
  
  // Select top 3 most similar flags as distractors (or random if similarity scores too low)
  let distractors: Doc<"flags">[];
  
  if (rankedDistractors.length >= 3) {
    // Use top 3 most similar if available
    distractors = rankedDistractors.slice(0, 3).map(([flag]) => flag);
  } else {
    // Fallback: use all available and fill with random if needed
    const available = allFlags.filter(f => f._id !== targetFlag._id);
    distractors = selectRandomItems(available, Math.min(3, available.length));
  }
  
  // Create option objects
  const options: Array<{ flag: Doc<"flags">; option: QuestionOption }> = [];
  
  // Add correct answer
  options.push({
    flag: targetFlag,
    option: {
      id: "correct",
      label: targetFlag.name,
      value: targetFlag.key,
    },
  });
  
  // Add distractors
  distractors.forEach((flag, index) => {
    options.push({
      flag: flag,
      option: {
        id: `distractor_${index}`,
        label: flag.name,
        value: flag.key,
      },
    });
  });
  
  // Create a properly ordered array based on correctAnswerPosition
  const orderedOptions: QuestionOption[] = new Array(4);
  
  // Place correct answer at specified position
  orderedOptions[correctAnswerPosition] = options[0].option;
  
  // Fill remaining positions with distractors
  let distractorIndex = 1;
  for (let i = 0; i < 4; i++) {
    if (i !== correctAnswerPosition) {
      orderedOptions[i] = options[distractorIndex].option;
      distractorIndex++;
    }
  }
  
  // Update IDs to reflect actual position (opt_0, opt_1, opt_2, opt_3)
  orderedOptions.forEach((opt, idx) => {
    opt.id = `opt_${idx}`;
  });
  
  const correctAnswerId = `opt_${correctAnswerPosition}`;
  
  return {
    options: orderedOptions,
    correctAnswer: correctAnswerId,
  };
}

/**
 * Generate 4 multiple-choice options for "Match Meaning to Flag" mode.
 * Shows flag meaning as text prompt, user selects correct flag image from options.
 * 
 * Strategy:
 * - Option pool: 3 visually similar flags + 1 correct flag
 * - Distractors selected based on visual similarity (colors, patterns)
 * - Options shuffled randomly
 * - Each option includes imagePath for rendering flag images
 * 
 * @param targetFlag - The flag being tested (correct answer)
 * @param allFlags - Complete pool of available flags
 * @param correctAnswerPosition - Index where correct answer should be placed (0-3)
 * @returns Object with shuffled options array and correct answer ID
 */
export function generateMatchModeOptions(
  targetFlag: Doc<"flags">,
  allFlags: Doc<"flags">[],
  correctAnswerPosition: number
): { options: QuestionOption[]; correctAnswer: string } {
  if (allFlags.length < 4) {
    throw new Error(
      `Insufficient flags for question generation. Need at least 4, got ${allFlags.length}`
    );
  }
  
  // Rank other flags by visual similarity (appearance confusion)
  const rankedDistractors = rankBySimilarity(targetFlag, allFlags, "visual");
  
  // Select top 3 most visually similar flags as distractors
  let distractors: Doc<"flags">[];
  
  if (rankedDistractors.length >= 3) {
    // Use top 3 most similar if available
    distractors = rankedDistractors.slice(0, 3).map(([flag]) => flag);
  } else {
    // Fallback: use all available and fill with random if needed
    const available = allFlags.filter(f => f._id !== targetFlag._id);
    distractors = selectRandomItems(available, Math.min(3, available.length));
  }
  
  // Create option objects
  const options: Array<{ flag: Doc<"flags">; option: QuestionOption }> = [];
  
  // Add correct answer
  options.push({
    flag: targetFlag,
    option: {
      id: "correct",
      label: "", // Empty for match mode - uses imagePath instead
      value: targetFlag.key,
      imagePath: targetFlag.imagePath,
    },
  });
  
  // Add distractors
  distractors.forEach((flag, index) => {
    options.push({
      flag: flag,
      option: {
        id: `distractor_${index}`,
        label: "", // Empty for match mode - uses imagePath instead
        value: flag.key,
        imagePath: flag.imagePath,
      },
    });
  });
  
  // Create a properly ordered array based on correctAnswerPosition
  const orderedOptions: QuestionOption[] = new Array(4);
  
  // Place correct answer at specified position
  orderedOptions[correctAnswerPosition] = options[0].option;
  
  // Fill remaining positions with distractors
  let distractorIndex = 1;
  for (let i = 0; i < 4; i++) {
    if (i !== correctAnswerPosition) {
      orderedOptions[i] = options[distractorIndex].option;
      distractorIndex++;
    }
  }
  
  // Update IDs to reflect actual position (opt_0, opt_1, opt_2, opt_3)
  orderedOptions.forEach((opt, idx) => {
    opt.id = `opt_${idx}`;
  });
  
  const correctAnswerId = `opt_${correctAnswerPosition}`;
  
  return {
    options: orderedOptions,
    correctAnswer: correctAnswerId,
  };
}

/**
 * Validate that generated options meet quality requirements.
 * Checks for duplicates, proper structure, and correct answer presence.
 * 
 * @param options - Generated options array
 * @param correctAnswer - ID of correct answer
 * @returns True if valid, throws error otherwise
 */
export function validateGeneratedOptions(
  options: QuestionOption[],
  correctAnswer: string
): boolean {
  // Check count
  if (options.length !== 4) {
    throw new Error(`Expected 4 options, got ${options.length}`);
  }
  
  // Check for duplicate values
  const values = options.map(opt => opt.value);
  const uniqueValues = new Set(values);
  if (values.length !== uniqueValues.size) {
    throw new Error("Generated options contain duplicate flag values");
  }
  
  // Check correct answer exists
  const hasCorrectAnswer = options.some(opt => opt.id === correctAnswer);
  if (!hasCorrectAnswer) {
    throw new Error(`Correct answer ID "${correctAnswer}" not found in options`);
  }
  
  // Check all options have required fields
  options.forEach((opt, idx) => {
    if (!opt.id || !opt.label || !opt.value) {
      throw new Error(`Option ${idx} missing required fields`);
    }
  });
  
  return true;
}
