/**
 * Calculates the z-score for an A/B test comparison.
 * 
 * @param visitorsControl - Number of visitors in control group
 * @param conversionsControl - Number of conversions in control group
 * @param visitorsTest - Number of visitors in test group
 * @param conversionsTest - Number of conversions in test group
 * @returns The z-score for the test
 */
export function calculateZScore(
  visitorsControl: number,
  conversionsControl: number,
  visitorsTest: number,
  conversionsTest: number
): number {
  // Convert to rates
  const rateControl = conversionsControl / visitorsControl;
  const rateTest = conversionsTest / visitorsTest;
  
  // Calculate pooled conversion rate
  const totalConversions = conversionsControl + conversionsTest;
  const totalVisitors = visitorsControl + visitorsTest;
  const pooledRate = totalConversions / totalVisitors;
  
  // Calculate standard error
  const standardError = Math.sqrt(
    pooledRate * (1 - pooledRate) * (1 / visitorsControl + 1 / visitorsTest)
  );
  
  // Return z-score (difference of proportions / standard error)
  return (rateTest - rateControl) / standardError;
}

/**
 * Calculates the p-value from a z-score.
 * Uses a highly accurate approximation of the standard normal CDF.
 * 
 * @param zScore - The z-score
 * @param isTwoSided - Whether to calculate a two-sided p-value (default: true)
 * @returns The p-value
 */
export function getPValueFromZScore(zScore: number, isTwoSided: boolean = true): number {
  // Calculate absolute z-score for two-sided test
  const z = Math.abs(zScore);
  
  // Use a more accurate approximation for the normal CDF
  // Abramowitz and Stegun formula 26.2.17
  const p = 0.5 * (1 + Math.tanh(
    (z * Math.sqrt(2/Math.PI)) * 
    (1 + 0.044715 * Math.pow(z, 2)) * 
    (1 - Math.pow(Math.E, -0.5 * Math.pow(z, 2)))
  ));
  
  // One-sided p-value: probability of observing a more extreme value 
  // in the direction of the alternative hypothesis
  const oneSidedP = 1 - p;
  
  // For a two-sided test, multiply by 2 (but cap at 1.0)
  return isTwoSided ? Math.min(2 * oneSidedP, 1) : oneSidedP;
}

/**
 * Calculates the p-value for an A/B test comparison.
 * 
 * @param visitorsControl - Number of visitors in control group
 * @param conversionsControl - Number of conversions in control group
 * @param visitorsTest - Number of visitors in test group
 * @param conversionsTest - Number of conversions in test group
 * @param isTwoSided - Whether to calculate a two-sided p-value (default: true)
 * @returns The p-value for the test
 */
export function calculatePValueFromCounts(
  visitorsControl: number,
  conversionsControl: number,
  visitorsTest: number,
  conversionsTest: number,
  isTwoSided: boolean = true
): number {
  const zScore = calculateZScore(
    visitorsControl,
    conversionsControl,
    visitorsTest,
    conversionsTest
  );
  
  return getPValueFromZScore(zScore, isTwoSided);
}

/**
 * Calculates the p-value for an A/B test comparison based on a z-score.
 * 
 * @param zScore - The z-score
 * @param isTwoSided - Whether to calculate a two-sided p-value (default: true)
 * @returns The p-value for the test
 */
export function calculatePValue(
  zScore: number,
  isTwoSided: boolean = true
): number {
  return getPValueFromZScore(zScore, isTwoSided);
}

/**
 * Calculates the statistical power for a given test.
 * 
 * @param visitorsControl - Number of visitors in control group
 * @param conversionRateControl - Conversion rate of control group (as decimal or percentage)
 * @param visitorsTest - Number of visitors in test group
 * @param conversionRateTest - Conversion rate of test group (as decimal or percentage)
 * @param alpha - Significance level (default: 0.05)
 * @returns The statistical power as a percentage (0-100)
 */
export function calculateStatisticalPower(
  visitorsControl: number,
  conversionRateControl: number,
  visitorsTest: number,
  conversionRateTest: number,
  alpha: number = 0.05
): number {
  // Convert percentages to proportions if needed
  const p1 = conversionRateControl > 1 ? conversionRateControl / 100 : conversionRateControl;
  const p2 = conversionRateTest > 1 ? conversionRateTest / 100 : conversionRateTest;
  
  // Effect size (difference in proportions)
  const effectSize = Math.abs(p2 - p1);
  
  // Pooled standard error
  const se = Math.sqrt(
    p1 * (1 - p1) / visitorsControl + p2 * (1 - p2) / visitorsTest
  );
  
  // If there's no effect size or standard error can't be calculated, return 0 power
  if (effectSize === 0 || !isFinite(se) || se === 0) {
    return 0;
  }
  
  // Critical z value for the given alpha (two-sided test)
  // For common alpha values: 0.05 -> 1.96, 0.01 -> 2.576, etc.
  let criticalZ = 1.96; // Default for alpha = 0.05
  if (alpha === 0.1) criticalZ = 1.645;
  if (alpha === 0.01) criticalZ = 2.576;
  if (alpha === 0.001) criticalZ = 3.291;
  
  // Non-centrality parameter (standardized effect size)
  const ncp = effectSize / se;
  
  // Power calculation
  // 1 - Φ(z_α/2 - |δ/σ|) for a two-sided test
  // where δ is the effect size and σ is the standard error
  const z = criticalZ - ncp;
  
  // Use the same normal CDF approximation as in getPValueFromZScore
  const normalCDF = (x: number): number => {
    // If x is very negative, return close to 0
    if (x < -6) return 0;
    // If x is very positive, return close to 1
    if (x > 6) return 1;
    
    const absx = Math.abs(x);
    const p = 0.5 * (1 + Math.tanh(
      (absx * Math.sqrt(2/Math.PI)) * 
      (1 + 0.044715 * Math.pow(absx, 2)) * 
      (1 - Math.pow(Math.E, -0.5 * Math.pow(absx, 2)))
    ));
    
    return x >= 0 ? p : 1 - p;
  };
  
  const power = 1 - normalCDF(z);
  
  // Return as percentage, clamped between 0 and 100
  return Math.min(Math.max(power * 100, 0), 100);
}

/**
 * Calculates the minimum sample size needed per variant for an A/B test
 * 
 * @param baseConversionRate - Base conversion rate (control expected rate)
 * @param mde - Minimum detectable effect (relative lift, e.g. 0.1 for 10%)
 * @param alpha - Significance level (default: 0.05)
 * @param power - Desired power (default: 0.8 for 80%)
 * @returns The required sample size per variant
 */
export function calculateRequiredSampleSize(
  baseConversionRate: number,
  mde: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  // Convert percentages to proportions if needed
  const baseRate = baseConversionRate > 1 ? baseConversionRate / 100 : baseConversionRate;
  
  // Expected test conversion rate
  const testRate = baseRate * (1 + mde);
  
  // Standard error for both groups
  const p1Var = baseRate * (1 - baseRate);
  const p2Var = testRate * (1 - testRate);
  
  // Z critical values
  const zAlpha = 1.96; // For alpha = 0.05
  const zBeta = 0.84;  // For power = 0.8
  
  // Calculate fixed sample size
  const sampleSize = 
    Math.pow(zAlpha + zBeta, 2) * (p1Var + p2Var) / Math.pow(baseRate - testRate, 2);
  
  return Math.ceil(sampleSize);
}

/**
 * Checks if sample size is sufficient for reliable statistical inference
 * 
 * @param visitors - Number of visitors
 * @param conversions - Number of conversions
 * @returns Object with warning status and message
 */
export function checkSampleSizeWarning(
  visitors: number,
  conversions: number
): { hasWarning: boolean; message: string; severity: 'low' | 'medium' | 'high' } {
  const conversionRate = conversions / visitors;
  
  // Rule 1: Minimum 100 visitors per variant
  if (visitors < 100) {
    return {
      hasWarning: true,
      message: "Sample size is very small. Results may not be reliable.",
      severity: 'high'
    };
  }
  
  // Rule 2: Minimum 30 conversions per variant for reliable inference
  if (conversions < 30) {
    return {
      hasWarning: true,
      message: "Too few conversions. Consider running the test longer.",
      severity: 'medium'
    };
  }
  
  // Rule 3: For very low conversion rates, need larger sample
  if (conversionRate < 0.01 && visitors < 1000) {
    return {
      hasWarning: true,
      message: "Low conversion rate requires larger sample size.",
      severity: 'medium'
    };
  }
  
  // Rule 4: Check if sample size is sufficient based on rule of thumb for binomial proportion
  // For 95% confidence with margin of error 0.05
  const requiredSample = 1.96 * 1.96 * conversionRate * (1 - conversionRate) / (0.05 * 0.05);
  if (visitors < requiredSample) {
    return {
      hasWarning: true,
      message: "Sample size may be insufficient for the observed conversion rate.",
      severity: 'low'
    };
  }
  
  return { hasWarning: false, message: "", severity: 'low' };
}

/**
 * Calculates confidence interval for a proportion
 * 
 * @param visitors - Number of visitors
 * @param conversions - Number of conversions
 * @param confidenceLevel - Confidence level (default: 0.95)
 * @returns Object with lower and upper confidence bounds
 */
export function calculateConfidenceInterval(
  visitors: number,
  conversions: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  const p = conversions / visitors;
  
  // Use Wilson score interval for better accuracy with small samples
  const z = confidenceLevel === 0.99 ? 2.576 :
           confidenceLevel === 0.95 ? 1.96 :
           confidenceLevel === 0.90 ? 1.645 : 1.96;
  
  const denominator = 1 + (z * z / visitors);
  const center = (p + (z * z) / (2 * visitors)) / denominator;
  const radius = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * visitors)) / visitors) / denominator;
  
  return {
    lower: Math.max(0, (center - radius) * 100), // Convert to percentage
    upper: Math.min(100, (center + radius) * 100)  // Convert to percentage
  };
} 