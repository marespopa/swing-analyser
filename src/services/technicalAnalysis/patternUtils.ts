/**
 * Pattern utility functions for deduplication and prioritization
 */

export interface BasePattern {
  index: number
  pattern: string
  signal: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong'
  description: string
}

/**
 * Deduplicate and prioritize patterns
 */
export function deduplicateAndPrioritizePatterns<T extends BasePattern>(
  patterns: T[],
  maxPatterns: number = 5
): T[] {
  if (patterns.length === 0) return []

  // Group patterns by type
  const patternGroups = new Map<string, T[]>()
  
  patterns.forEach(pattern => {
    const key = pattern.pattern
    if (!patternGroups.has(key)) {
      patternGroups.set(key, [])
    }
    patternGroups.get(key)!.push(pattern)
  })

  // For each pattern type, keep only the most recent and strongest
  const deduplicatedPatterns: T[] = []
  
  patternGroups.forEach(groupPatterns => {
    // Sort by recency (most recent first) and then by strength
    const sorted = groupPatterns.sort((a, b) => {
      // First by recency (higher index = more recent)
      if (a.index !== b.index) {
        return b.index - a.index
      }
      // Then by strength
      const strengthOrder: { [key: string]: number } = { 'very-strong': 4, 'strong': 3, 'moderate': 2, 'weak': 1 }
      return (strengthOrder[b.strength] || 0) - (strengthOrder[a.strength] || 0)
    })
    
    // Take only the best one of each pattern type
    deduplicatedPatterns.push(sorted[0])
  })

  // Sort all patterns by priority score
  const prioritizedPatterns = deduplicatedPatterns.sort((a, b) => {
    return calculatePriorityScore(b) - calculatePriorityScore(a)
  })

  // Return only the top patterns
  return prioritizedPatterns.slice(0, maxPatterns)
}

/**
 * Calculate priority score for pattern ranking
 */
function calculatePriorityScore<T extends BasePattern>(pattern: T): number {
  let score = 0
  
  // Recency score (more recent = higher score)
  score += pattern.index * 10
  
  // Strength score
  const strengthScores: { [key: string]: number } = { 'very-strong': 150, 'strong': 100, 'moderate': 50, 'weak': 10 }
  score += strengthScores[pattern.strength] || 10
  
  // Confidence score
  score += pattern.confidence * 50
  
  // Signal type bonus (bullish/bearish patterns are more actionable than neutral)
  if (pattern.signal !== 'neutral') {
    score += 25
  }
  
  // Pattern type priority (some patterns are more reliable)
  const patternPriority: { [key: string]: number } = {
    'Head and Shoulders': 90,
    'Double Top': 85,
    'Double Bottom': 85,
    'Cup and Handle': 80,
    'Ascending Triangle': 75,
    'Descending Triangle': 75,
    'Rising Wedge': 70,
    'Falling Wedge': 70,
    'Bull Flag': 65,
    'Bear Flag': 65,
    'Symmetrical Triangle': 60
  }
  
  score += patternPriority[pattern.pattern] || 30
  
  return score
}

/**
 * Filter patterns to only include recent ones (within specified periods)
 * For daily data, 7-10 days means 7-10 data points
 */
export function filterRecentPatterns<T extends BasePattern>(
  patterns: T[],
  dataLength: number,
  maxPeriodsBack: number = 10 // Focus on last 10 days (10 data points for daily data)
): T[] {
  const cutoffIndex = dataLength - maxPeriodsBack
  return patterns.filter(pattern => pattern.index >= cutoffIndex)
}

/**
 * Group patterns by signal type for better organization
 */
export function groupPatternsBySignal<T extends BasePattern>(patterns: T[]): {
  bullish: T[]
  bearish: T[]
  neutral: T[]
} {
  return {
    bullish: patterns.filter(p => p.signal === 'bullish'),
    bearish: patterns.filter(p => p.signal === 'bearish'),
    neutral: patterns.filter(p => p.signal === 'neutral')
  }
}
