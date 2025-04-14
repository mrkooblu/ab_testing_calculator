import { calculatePValue, calculateStatisticalPower, calculateZScore } from './statistics';

/**
 * Interface for monitoring boundary options used in sequential testing
 */
interface MonitoringBoundaryOptions {
  /** Alpha spending function type (such as 'pocock', 'obrien-fleming') */
  alphaBoundaryType: 'pocock' | 'obrien-fleming';
  /** Beta spending function type for power analysis */
  betaBoundaryType: 'pocock' | 'obrien-fleming';
  /** Total number of planned interim analyses including final analysis */
  numInterimAnalyses: number;
  /** Overall desired significance level (default: 0.05) */
  alpha?: number;
  /** Desired power (default: 0.8 or 80%) */
  beta?: number;
}

/**
 * Interface representing sequential test status
 */
interface SequentialTestStatus {
  /** Current p-value */
  pValue: number;
  /** Current statistical power */
  power: number;
  /** Alpha boundary at current look */
  alphaBoundary: number;
  /** Beta boundary at current look (for futility) */
  betaBoundary: number;
  /** Can we stop for efficacy? */
  canStopForEfficacy: boolean;
  /** Can we stop for futility? */
  canStopForFutility: boolean;
  /** Whether interim analysis has reached a conclusive result */
  isConclusive: boolean;
  /** Current look number (1-indexed) */
  currentLook: number;
}

/**
 * Calculates the alpha spending boundary for a given look
 * 
 * @param type - Type of alpha spending function
 * @param t - Information fraction (current look / total looks)
 * @param alpha - Overall alpha level (typically 0.05)
 * @returns The alpha boundary at this look
 */
export function calculateAlphaBoundary(
  type: 'pocock' | 'obrien-fleming',
  t: number,
  alpha: number = 0.05
): number {
  if (t < 0 || t > 1) {
    throw new Error('Information fraction t must be between 0 and 1');
  }
  
  // Implementation of common alpha spending functions
  switch (type) {
    case 'pocock':
      // Pocock bounds are constant across looks
      return alpha * Math.log(1 + (Math.E - 1) * t);
    
    case 'obrien-fleming':
      // O'Brien-Fleming bounds are more conservative early and less conservative later
      return alpha * (2 - 2 * Math.cos(Math.PI * t / 2));
    
    default:
      throw new Error(`Unsupported alpha boundary type: ${type}`);
  }
}

/**
 * Calculates the beta spending boundary for futility
 * 
 * @param type - Type of beta spending function
 * @param t - Information fraction (current look / total looks)
 * @param beta - Overall beta level (typically 0.2 for 80% power)
 * @returns The beta boundary at this look
 */
export function calculateBetaBoundary(
  type: 'pocock' | 'obrien-fleming',
  t: number,
  beta: number = 0.2
): number {
  if (t < 0 || t > 1) {
    throw new Error('Information fraction t must be between 0 and 1');
  }
  
  // Implementation of beta spending functions (for futility)
  switch (type) {
    case 'pocock':
      // Pocock bounds are constant
      return 1 - beta * Math.log(1 + (Math.E - 1) * t);
    
    case 'obrien-fleming':
      // O'Brien-Fleming bounds - tighter early, looser later
      return 1 - beta * (2 - 2 * Math.cos(Math.PI * t / 2));
    
    default:
      throw new Error(`Unsupported beta boundary type: ${type}`);
  }
}

/**
 * Calculates the sequential testing boundaries and determines if a test can stop early
 * 
 * @param visitorsControl - Number of visitors in control group
 * @param conversionsControl - Number of conversions in control group
 * @param visitorsTest - Number of visitors in test group
 * @param conversionsTest - Number of conversions in test group
 * @param currentLook - Current look number (1-indexed)
 * @param options - Options for sequential testing boundaries
 * @returns Sequential test status information
 */
export function analyzeSequentialTest(
  visitorsControl: number,
  conversionsControl: number,
  visitorsTest: number,
  conversionsTest: number,
  currentLook: number,
  options: MonitoringBoundaryOptions
): SequentialTestStatus {
  const {
    alphaBoundaryType,
    betaBoundaryType,
    numInterimAnalyses,
    alpha = 0.05,
    beta = 0.2,
  } = options;
  
  // Calculate information fraction (how far along we are)
  const informationFraction = currentLook / numInterimAnalyses;
  
  // Calculate current p-value and power
  const pValue = calculatePValue(
    calculateZScore(
      visitorsControl,
      conversionsControl,
      visitorsTest,
      conversionsTest
    ),
    true  // two-sided test
  );
  
  const conversionRateControl = conversionsControl / visitorsControl;
  const conversionRateTest = conversionsTest / visitorsTest;
  const absoluteDifference = Math.abs(conversionRateTest - conversionRateControl);
  
  const power = calculateStatisticalPower(
    visitorsControl,
    conversionRateControl,
    visitorsTest,
    conversionRateTest,
    alpha
  );
  
  // Calculate boundaries for this look
  const alphaBoundary = calculateAlphaBoundary(alphaBoundaryType, informationFraction, alpha);
  const betaBoundary = calculateBetaBoundary(betaBoundaryType, informationFraction, beta);
  
  // Determine if we can stop for efficacy or futility
  const canStopForEfficacy = pValue <= alphaBoundary;
  const canStopForFutility = pValue > betaBoundary;
  
  return {
    pValue,
    power,
    alphaBoundary,
    betaBoundary,
    canStopForEfficacy,
    canStopForFutility,
    isConclusive: canStopForEfficacy || canStopForFutility,
    currentLook,
  };
}

/**
 * Calculates required sample size per look for a sequential design
 * 
 * @param baseConversionRate - Base conversion rate (control expected rate)
 * @param mde - Minimum detectable effect (relative lift, e.g. 0.1 for 10%)
 * @param numInterimAnalyses - Number of planned analyses (including final)
 * @param alpha - Significance level (default: 0.05)
 * @param power - Desired power (default: 0.8 for 80%)
 * @param alphaBoundaryType - Type of boundary to use (default: 'obrien-fleming')
 * @returns The required sample size per group per look
 */
export function calculateSequentialSampleSize(
  baseConversionRate: number,
  mde: number,
  numInterimAnalyses: number,
  alpha: number = 0.05,
  power: number = 0.8,
  alphaBoundaryType: 'pocock' | 'obrien-fleming' = 'obrien-fleming'
): number {
  // Convert percentages to proportions if needed
  const baseRate = baseConversionRate > 1 ? baseConversionRate / 100 : baseConversionRate;
  
  // Expected test conversion rate
  const testRate = baseRate * (1 + mde);
  
  // Standard error for both groups
  const p1Var = baseRate * (1 - baseRate);
  const p2Var = testRate * (1 - testRate);
  
  // Z critical values for fixed design
  const zAlpha = 1.96; // For alpha = 0.05
  const zBeta = 0.84;  // For power = 0.8
  
  // Adjustment factor for multiple looks based on boundary type
  let adjustmentFactor: number;
  
  if (alphaBoundaryType === 'pocock') {
    // Pocock boundaries require a larger adjustment
    // Approximation based on number of looks
    adjustmentFactor = 1 + (numInterimAnalyses * 0.15);
  } else { // 'obrien-fleming'
    // O'Brien-Fleming boundaries are more efficient
    // Less penalty for additional looks
    adjustmentFactor = 1 + Math.sqrt(numInterimAnalyses) * 0.05;
  }
  
  // Calculate standard fixed sample size
  const fixedSampleSize = 
    Math.pow(zAlpha + zBeta, 2) * (p1Var + p2Var) / Math.pow(baseRate - testRate, 2);
  
  // Apply sequential adjustment and divide by number of looks
  // This gives the sample size needed per look
  return Math.ceil(fixedSampleSize * adjustmentFactor / numInterimAnalyses);
} 