/**
 * Feedback Modal Components - Usage Examples
 * 
 * This file documents how to use the new feedback modal components together.
 * These components are designed to be composable and work seamlessly as a system.
 * 
 * @example Basic Usage
 * ```tsx
 * import { 
 *   FeedbackFlagDisplay, 
 *   EncouragementMessage, 
 *   SimilarFlagsSection 
 * } from "@/components/practice"
 * import { generateEncouragementMessage } from "@/lib/encouragement-utils"
 * 
 * function FeedbackModal() {
 *   const encouragement = generateEncouragementMessage({
 *     isCorrect: true,
 *     currentStreak: 5,
 *     currentQuestionIndex: 4,
 *     correctCount: 5,
 *     totalQuestions: 10,
 *     isLastQuestion: false,
 *   })
 * 
 *   return (
 *     <Dialog open={isOpen}>
 *       <DialogContent>
 *         <FeedbackFlagDisplay
 *           flagImage="/flags/alpha.svg"
 *           flagName="Alpha"
 *           flagKey="A"
 *           isCorrect={true}
 *         />
 *         
 *         <EncouragementMessage
 *           message={encouragement}
 *           isCorrect={true}
 *         />
 *         
 *         <div className="space-y-2">
 *           <h3>Flag Meaning</h3>
 *           <p>Diver Down; keep clear at slow speed</p>
 *         </div>
 *         
 *         <SimilarFlagsSection
 *           flags={similarFlags}
 *         />
 *       </DialogContent>
 *     </Dialog>
 *   )
 * }
 * ```
 * 
 * @example With Streak Celebration
 * ```tsx
 * import { getCelebrationForStreak } from "@/lib/streak-utils"
 * 
 * const celebration = getCelebrationForStreak(10)
 * if (celebration) {
 *   // Show confetti with celebration.particleCount
 *   // Display celebration.title and celebration.message
 * }
 * ```
 * 
 * @see FeedbackFlagDisplay - Displays flag image with name
 * @see EncouragementMessage - Shows contextual motivational message
 * @see SimilarFlagsSection - Displays confusable flags with links
 */

export {}
