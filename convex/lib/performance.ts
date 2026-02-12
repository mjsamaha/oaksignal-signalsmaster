/**
 * Performance monitoring utilities for Convex mutations.
 * Tracks execution time and logs warnings for operations exceeding thresholds.
 */

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  durationMs: number;
  operationName: string;
}

/**
 * Measures execution time of an async operation.
 * Returns both the result and performance metrics.
 * 
 * @param operation - Async function to measure
 * @param operationName - Human-readable name for logging
 * @returns Tuple of [result, metrics]
 * 
 * @example
 * const [questions, metrics] = await measureAsync(
 *   () => generateQuestions(flags),
 *   'generateQuestions'
 * );
 * if (metrics.durationMs > 2000) {
 *   console.warn('Generation took too long:', metrics);
 * }
 */
export async function measureAsync<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<[T, PerformanceMetrics]> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const endTime = Date.now();
    
    const metrics: PerformanceMetrics = {
      startTime,
      endTime,
      durationMs: endTime - startTime,
      operationName,
    };
    
    return [result, metrics];
  } catch (error) {
    const endTime = Date.now();
    
    // Log even on error for debugging
    console.error(`[Performance] ${operationName} failed after ${endTime - startTime}ms`, error);
    throw error;
  }
}

/**
 * Measures execution time and logs warning if threshold exceeded.
 * 
 * @param operation - Async function to measure
 * @param operationName - Human-readable name for logging
 * @param thresholdMs - Warning threshold in milliseconds (default: 2000ms)
 * @returns The operation result
 */
export async function measureAndWarn<T>(
  operation: () => Promise<T>,
  operationName: string,
  thresholdMs: number = 2000
): Promise<T> {
  const [result, metrics] = await measureAsync(operation, operationName);
  
  if (metrics.durationMs > thresholdMs) {
    console.warn(
      `[Performance Warning] ${operationName} took ${metrics.durationMs}ms (threshold: ${thresholdMs}ms)`
    );
  } else {
    console.log(
      `[Performance] ${operationName} completed in ${metrics.durationMs}ms`
    );
  }
  
  return result;
}

/**
 * Simple timer for tracking elapsed time within a function.
 * Useful for timing multiple sub-operations.
 * 
 * @example
 * const timer = startTimer();
 * await doSomething();
 * const elapsed = timer.elapsed();
 * console.log(`Operation took ${elapsed}ms`);
 */
export function startTimer() {
  const startTime = Date.now();
  
  return {
    elapsed: () => Date.now() - startTime,
    startTime,
  };
}
