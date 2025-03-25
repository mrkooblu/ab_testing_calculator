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
 * Calculates the p-value from a z-score for a two-sided test.
 * 
 * @param zScore - The z-score
 * @returns The p-value
 */
export function getPValueFromZScore(zScore: number): number {
  // Calculate absolute z-score
  const z = Math.abs(zScore);
  
  // Approximate normal CDF with a polynomial approximation
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  // For a two-sided test, multiply by 2
  return 2 * (1 - (0.5 - p));
}

/**
 * Calculates the p-value for an A/B test comparison.
 * 
 * @param visitorsControl - Number of visitors in control group
 * @param conversionsControl - Number of conversions in control group
 * @param visitorsTest - Number of visitors in test group
 * @param conversionsTest - Number of conversions in test group
 * @returns The p-value for the test
 */
export function calculatePValue(
  visitorsControl: number,
  conversionsControl: number,
  visitorsTest: number,
  conversionsTest: number
): number {
  const zScore = calculateZScore(
    visitorsControl,
    conversionsControl,
    visitorsTest,
    conversionsTest
  );
  
  return getPValueFromZScore(zScore);
}

/**
 * Calculates the statistical power for a given test.
 * 
 * @param visitorsControl - Number of visitors in control group
 * @param conversionRateControl - Conversion rate of control group (as decimal)
 * @param visitorsTest - Number of visitors in test group
 * @param conversionRateTest - Conversion rate of test group (as decimal)
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
  
  // Critical z value for the given alpha
  const criticalZ = 1.96; // For alpha = 0.05
  
  // Non-centrality parameter
  const ncp = effectSize / se;
  
  // Power calculation using normal approximation
  // 1 - Φ(z_α - ncp)
  const powerZ = criticalZ - ncp;
  
  // Approximate normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(powerZ));
  const d = 0.3989423 * Math.exp(-powerZ * powerZ / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  let power;
  if (powerZ < 0) {
    power = 1 - (0.5 - p);
  } else {
    power = 0.5 - p;
  }
  
  // Return as percentage
  return power * 100;
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