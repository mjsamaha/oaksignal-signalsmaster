/**
 * Streak Milestone Celebration - Usage Example
 * 
 * Demonstrates how to use the enhanced celebration system with streak milestones
 * 
 * @example Basic Streak Celebration
 * ```tsx
 * import { StreakMilestoneCelebration } from "@/components/practice"
 * import { getCelebrationForStreak } from "@/lib/streak-utils"
 * 
 * function QuizInterface() {
 *   const [streak, setStreak] = useState(0)
 *   const [showCelebration, setShowCelebration] = useState(false)
 *   
 *   // When user answers correctly and hits a milestone
 *   const handleCorrectAnswer = () => {
 *     const newStreak = streak + 1
 *     setStreak(newStreak)
 *     
 *     // Check if this is a milestone (5, 10, 15, 20)
 *     const celebration = getCelebrationForStreak(newStreak)
 *     if (celebration) {
 *       setShowCelebration(true)
 *     }
 *   }
 *   
 *   const celebration = getCelebrationForStreak(streak)
 *   
 *   return (
 *     <>
 *       <StreakMilestoneCelebration
 *         celebration={celebration}
 *         trigger={showCelebration}
 *         onComplete={() => setShowCelebration(false)}
 *       />
 *       
 *       {/* Your quiz UI */}
 *     </>
 *   )
 * }
 * ```
 * 
 * @example Celebration Types by Streak
 * ```
 * Streak 5:  Confetti (green, 50 particles, 2s)
 * Streak 10: Confetti (blue, 100 particles, 2.5s)
 * Streak 15: Fireworks (purple, 150 particles, 3s)
 * Streak 20: Mega (gold, 200 particles, 3.5s)
 * ```
 * 
 * @example Progressive Intensity
 * ```tsx
 * // 5 in a row - Standard confetti from sides
 * getCelebrationForStreak(5) // celebrationType: "confetti"
 * 
 * // 10 in a row - More intense confetti
 * getCelebrationForStreak(10) // celebrationType: "confetti", more particles
 * 
 * // 15 in a row - Explosive fireworks bursts
 * getCelebrationForStreak(15) // celebrationType: "fireworks"
 * 
 * // 20 in a row - Continuous mega celebration
 * getCelebrationForStreak(20) // celebrationType: "mega"
 * ```
 * 
 * @example Integration with Feedback Modal
 * ```tsx
 * <FeedbackModal open={showModal}>
 *   <FeedbackFlagDisplay {...flagProps} />
 *   <EncouragementMessage {...messageProps} />
 *   
 *   {/* Celebration fires above modal (z-index: 100) */}
 *   <StreakMilestoneCelebration
 *     celebration={celebration}
 *     trigger={isStreakMilestone}
 *   />
 * </FeedbackModal>
 * ```
 * 
 * @see StreakMilestoneCelebration - Main celebration component
 * @see getCelebrationForStreak - Get celebration config for streak value
 * @see isStreakMilestone - Check if streak is a milestone
 */

export {}
