/**
 * Utility functions for statistical visualizations in the A/B test calculator
 */

/**
 * Calculates the Probability Density Function (PDF) value for a normal distribution
 * @param x The value at which to calculate the PDF
 * @param mean The mean of the normal distribution
 * @param stdDev The standard deviation of the normal distribution
 * @returns The PDF value at x
 */
export const normalPDF = (x: number, mean: number, stdDev: number): number => {
  const variance = stdDev * stdDev;
  const exponent = -Math.pow(x - mean, 2) / (2 * variance);
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
};

// Cache for storing previously calculated curve points to avoid redundant calculations
const curvePointsCache = new Map<string, [number, number][]>();

/**
 * Generates points for a normal distribution curve based on the specified mean and standard deviation
 * @param mean The mean of the normal distribution
 * @param stdDev The standard deviation of the normal distribution
 * @param min The minimum x value for the curve
 * @param max The maximum x value for the curve
 * @param steps The number of points to generate (default: 100)
 * @returns An array of [x, y] points representing the normal curve
 */
export const generateNormalCurvePoints = (
  mean: number, 
  stdDev: number, 
  min: number, 
  max: number, 
  steps: number = 100
): [number, number][] => {
  // Create a cache key based on the input parameters
  const cacheKey = `${mean.toFixed(3)}_${stdDev.toFixed(3)}_${min.toFixed(3)}_${max.toFixed(3)}_${steps}`;
  
  // Check if we have cached results for these parameters
  if (curvePointsCache.has(cacheKey)) {
    return curvePointsCache.get(cacheKey)!;
  }
  
  // Generate points with optimized loop
  const points: [number, number][] = [];
  const step = (max - min) / steps;
  
  // Pre-calculate constants outside the loop
  const sqrtTwoPi = Math.sqrt(2 * Math.PI);
  const variance = stdDev * stdDev;
  const denominator = stdDev * sqrtTwoPi;
  
  for (let i = 0; i <= steps; i++) {
    const x = min + i * step;
    // Optimized PDF calculation
    const exponent = -Math.pow(x - mean, 2) / (2 * variance);
    const y = Math.exp(exponent) / denominator;
    points.push([x, y]);
  }
  
  // Cache the results (limit cache size to prevent memory leaks)
  if (curvePointsCache.size > 50) {
    // Remove oldest entry if cache gets too large
    const keysIterator = curvePointsCache.keys();
    const firstKey = keysIterator.next().value;
    if (firstKey) {
      curvePointsCache.delete(firstKey);
    }
  }
  curvePointsCache.set(cacheKey, points);
  
  return points;
};

// Cache for critical Z values to avoid recalculating common confidence levels
const criticalZCache = new Map<string, number>();

/**
 * Calculates the critical Z-value for a given confidence level
 * For a two-sided test, this returns Z_(alpha/2)
 * For a one-sided test, this returns Z_(alpha)
 * 
 * Implementation of the approximation to the inverse normal CDF
 * based on Abramowitz and Stegun formula 26.2.23.
 * 
 * @param confidenceLevel The confidence level (e.g., 95 for 95%)
 * @param twoSided Whether the test is two-sided or one-sided
 * @returns The critical Z-value
 */
export const getCriticalZValue = (confidenceLevel: number, twoSided: boolean): number => {
  // Round confidence level to avoid floating point precision issues
  const roundedConfidence = Math.round(confidenceLevel * 10) / 10;
  const cacheKey = `${roundedConfidence}_${twoSided}`;
  
  // Check cache first
  if (criticalZCache.has(cacheKey)) {
    return criticalZCache.get(cacheKey)!;
  }
  
  // Convert confidence level to alpha
  let alpha = 1 - (roundedConfidence / 100);
  
  // For two-sided tests, we need alpha/2
  if (twoSided) {
    alpha /= 2;
  }
  
  // Implementation of inverse error function
  const erfInv = (x: number): number => {
    // Coefficients for the approximation
    const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
    const p = 0.3275911;
    
    // Save the sign of x
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    // Approximation formula
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-x * x));
    
    return sign * y;
  };
  
  // Calculation using the error function inverse
  // For standard normal, Phi^(-1)(p) = sqrt(2) * erfInv(2p - 1)
  const z = Math.sqrt(2) * erfInv(2 * (1 - alpha) - 1);
  
  // Cache the result (limit cache size)
  if (criticalZCache.size > 20) {
    const keysIterator = criticalZCache.keys();
    const firstKey = keysIterator.next().value;
    if (firstKey) {
      criticalZCache.delete(firstKey);
    }
  }
  criticalZCache.set(cacheKey, z);
  
  return z;
};

// Pre-calculated lookup table for common test strength p-values
// This avoids expensive calculations for frequently used values
const strengthLookupTable: [number, number][] = Array.from({ length: 20 }, (_, i) => {
  const pValue = 0.05 + (i * 0.05);
  const alpha = 0.05;
  const ratio = (1 - pValue) / (1 - alpha);
  const strength = Math.max(1, Math.min(100, 100 * ratio));
  return [pValue, strength];
});

/**
 * Calculates the test strength percentage based on the p-value and alpha
 * This is a measure of how close the test is to achieving significance
 * 
 * @param pValue The p-value of the test
 * @param alpha The significance level threshold (e.g., 0.05 for 95% confidence)
 * @returns A percentage (0-100) indicating the test strength
 */
export const calculateTestStrength = (pValue: number, alpha: number = 0.05): number => {
  // Cap p-value at 0.9999 to avoid division by zero or extremely small values
  const safePValue = Math.min(pValue, 0.9999);
  
  // If the test is already significant, return 100%
  if (safePValue <= alpha) {
    return 100;
  }
  
  // Check if we can use the lookup table for common alpha=0.05 case
  if (Math.abs(alpha - 0.05) < 0.001) {
    // Find closest p-value in lookup table
    for (const [tablePValue, tableStrength] of strengthLookupTable) {
      if (Math.abs(safePValue - tablePValue) < 0.025) {
        return tableStrength;
      }
    }
  }
  
  // If the p-value is close to 1, the strength is close to 0
  // If the p-value is close to alpha, the strength is close to 100
  const ratio = (1 - safePValue) / (1 - alpha);
  
  // Scale to 0-100% range, with diminishing returns for very weak tests
  // Ensure a minimum strength of 1% for visibility in the UI
  const strength = Math.max(1, Math.min(100, 100 * ratio));
  
  return strength;
}; 