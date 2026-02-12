/**
 * Validation utilities for practice question structure integrity.
 * Ensures generated questions meet quality and format requirements.
 */

import { Question } from "./practice-types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates structure of a single question object.
 * 
 * @param question - Question to validate
 * @returns Validation result with errors if any
 */
export function validateQuestionStructure(question: Question): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!question.flagId) {
    errors.push("Question missing flagId");
  }
  
  if (!question.questionType) {
    errors.push("Question missing questionType");
  }
  
  if (!Array.isArray(question.options)) {
    errors.push("Question missing options array");
  } else {
    // Validate options array
    if (question.options.length !== 4) {
      errors.push(`Question must have exactly 4 options, got ${question.options.length}`);
    }
    
    // Validate each option
    question.options.forEach((option, index) => {
      if (!option.id) {
        errors.push(`Option ${index} missing id`);
      }
      if (!option.label) {
        errors.push(`Option ${index} missing label`);
      }
      if (option.value === undefined || option.value === null) {
        errors.push(`Option ${index} missing value`);
      }
    });
    
    // Check for duplicate option values
    const values = question.options.map(o => o.value);
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
      errors.push("Question has duplicate option values");
    }
  }
  
  // Validate correctAnswer
  if (typeof question.correctAnswer !== "string") {
    errors.push("Question missing correctAnswer");
  } else {
    // Ensure correctAnswer matches one of the option IDs
    const optionIds = question.options.map(o => o.id);
    if (!optionIds.includes(question.correctAnswer)) {
      errors.push(`correctAnswer "${question.correctAnswer}" does not match any option id`);
    }
  }
  
  // userAnswer should be null initially
  if (question.userAnswer !== null && question.userAnswer !== undefined) {
    // Allow undefined for backward compatibility, but null is preferred
    if (typeof question.userAnswer !== "string") {
      errors.push("userAnswer must be null initially or a string option id");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all questions in a practice session.
 * 
 * @param questions - Array of questions to validate
 * @returns Validation result with all errors
 */
export function validateSessionQuestions(questions: Question[]): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(questions)) {
    return {
      isValid: false,
      errors: ["Questions must be an array"],
    };
  }
  
  if (questions.length === 0) {
    return {
      isValid: false,
      errors: ["Session must have at least one question"],
    };
  }
  
  // Validate each question
  questions.forEach((question, index) => {
    const result = validateQuestionStructure(question);
    if (!result.isValid) {
      errors.push(`Question ${index}: ${result.errors.join(", ")}`);
    }
  });
  
  // Check for duplicate flags in same session
  const flagIds = questions.map(q => q.flagId);
  const uniqueFlagIds = new Set(flagIds);
  if (flagIds.length !== uniqueFlagIds.size) {
    errors.push("Session contains duplicate flags");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates that options are properly shuffled (not in predictable order).
 * This is a heuristic check, not a guarantee of true randomness.
 * 
 * @param questions - Array of questions to check
 * @returns True if correct answers appear distributed across positions
 */
export function validateAnswerDistribution(questions: Question[]): boolean {
  if (questions.length < 4) {
    // Not enough questions to validate distribution
    return true;
  }
  
  // Get the position (index) of correct answer in each question
  const correctPositions = questions.map(q => {
    const correctIndex = q.options.findIndex(opt => opt.id === q.correctAnswer);
    return correctIndex;
  });
  
  // Count occurrences of each position
  const positionCounts = [0, 0, 0, 0];
  correctPositions.forEach(pos => {
    if (pos >= 0 && pos < 4) {
      positionCounts[pos]++;
    }
  });
  
  // Check if all positions are used (for sessions with 4+ questions)
  const usedPositions = positionCounts.filter(count => count > 0).length;
  
  // For sessions with 4+ questions, we expect at least 3 different positions used
  // This prevents patterns like "all answers in position 0"
  return usedPositions >= Math.min(3, questions.length);
}
