// Statistical calculation utilities for A/B Testing

/**
 * Calculate conversion rate
 */
export const calculateConversionRate = (visitors: number, conversions: number): number => {
  if (visitors === 0) return 0;
  return (conversions / visitors) * 100;
};

/**
 * Calculate relative uplift between two conversion rates
 */
export const calculateRelativeUplift = (rateA: number, rateB: number): number => {
  if (rateA === 0) return 0;
  return ((rateB - rateA) / rateA) * 100;
};

/**
 * Calculate standard error for a conversion rate
 */
export const calculateStandardError = (rate: number, visitors: number): number => {
  if (visitors === 0) return 0;
  const proportion = rate / 100;
  return Math.sqrt((proportion * (1 - proportion)) / visitors);
};

/**
 * Calculate standard error of difference between two conversion rates
 */
export const calculateStandardErrorDiff = (seA: number, seB: number): number => {
  return Math.sqrt(seA * seA + seB * seB);
};

/**
 * Calculate Z-score for difference between two conversion rates
 */
export const calculateZScore = (rateA: number, rateB: number, seDiff: number): number => {
  if (seDiff === 0) return 0;
  return (rateB - rateA) / seDiff;
};

/**
 * Normal cumulative distribution function
 */
export const normCDF = (z: number): number => {
  // Approximation of the normal CDF
  if (z < -6) return 0;
  if (z > 6) return 1;

  let sum = 0;
  let term = z;
  let i = 3;
  
  while (Math.abs(term) > 1e-10) {
    sum += term;
    term = term * z * z / i;
    i += 2;
  }
  
  return 0.5 + sum * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
};

/**
 * Calculate p-value
 */
export const calculatePValue = (zScore: number, isTwoSided: boolean): number => {
  // For one-sided test, we only care about improvement (positive z-score)
  // For negative z-scores in one-sided tests, p-value should be 1
  if (!isTwoSided && zScore < 0) {
    return 1;
  }

  if (isTwoSided) {
    return 2 * (1 - normCDF(Math.abs(zScore)));
  } else {
    return 1 - normCDF(zScore);
  }
};

/**
 * Calculate statistical power
 * Simplified calculation - in practice may want to use more sophisticated methods
 */
export const calculatePower = (
  visitorsA: number,
  visitorsB: number,
  rateA: number,
  rateB: number,
  alpha: number
): number => {
  if (visitorsA === 0 || visitorsB === 0) return 0;
  
  const proportionA = rateA / 100;
  const proportionB = rateB / 100;
  
  const standardError = Math.sqrt(
    (proportionA * (1 - proportionA)) / visitorsA + 
    (proportionB * (1 - proportionB)) / visitorsB
  );
  
  const effectSize = Math.abs(proportionB - proportionA);
  const zAlpha = calculateZAlpha(alpha, false);
  const zPower = effectSize / standardError - zAlpha;
  
  return normCDF(zPower) * 100;
};

/**
 * Calculate Z-alpha based on confidence level
 */
export const calculateZAlpha = (alpha: number, isTwoSided: boolean): number => {
  if (isTwoSided) {
    alpha = alpha / 2;
  }
  
  // Approximation of the inverse of the normal CDF
  const p = 1 - alpha;
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  
  if (p <= 0 || p >= 1) {
    return 0;
  }
  
  let t;
  if (p > 0.5) {
    t = Math.sqrt(-2 * Math.log(1 - p));
  } else {
    t = Math.sqrt(-2 * Math.log(p));
  }
  
  let zAlpha = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
  
  if (p <= 0.5) {
    zAlpha = -zAlpha;
  }
  
  return zAlpha;
};

/**
 * Determine if test is statistically significant
 */
export const isSignificant = (pValue: number, confidenceLevel: number): boolean => {
  const alpha = (100 - confidenceLevel) / 100;
  return pValue < alpha;
}; 