import { VariantKey, ABTestFormData, VariantData } from '../types';

interface WinningVariantResult {
  winningKey: VariantKey | null;
  confidenceLevel: number;
}

/**
 * Determines the overall winning variant by comparing conversion rates
 * and calculating a confidence level based on statistical significance
 * against all other variants.
 * 
 * @param testData The A/B test form data with variants
 * @param baseConfidenceLevel The base confidence level from test settings
 * @returns The winning variant key and overall confidence level
 */
export const determineWinningVariant = (
  testData: ABTestFormData,
  baseConfidenceLevel: number
): WinningVariantResult => {
  const { variants } = testData;
  const activeVariantKeys = Object.keys(variants)
    .filter(key => variants[key as VariantKey].visitors > 0) as VariantKey[];
  
  if (activeVariantKeys.length < 2) {
    return {
      winningKey: activeVariantKeys.length > 0 ? activeVariantKeys[0] : null,
      confidenceLevel: 0
    };
  }

  // Find the variant with the highest conversion rate
  let highestRate = -1;
  let winningKey: VariantKey | null = null;

  activeVariantKeys.forEach(key => {
    const variant = variants[key];
    if (variant.conversionRate > highestRate) {
      highestRate = variant.conversionRate;
      winningKey = key;
    }
  });

  if (!winningKey) {
    return {
      winningKey: null,
      confidenceLevel: 0
    };
  }

  // Calculate average p-value against all other variants to determine confidence
  let totalPValues = 0;
  let comparisonCount = 0;

  for (const key of activeVariantKeys) {
    if (key === winningKey) continue;

    const winner: VariantData = variants[winningKey];
    const challenger: VariantData = variants[key];

    // Skip if either variant has 0 visitors
    if (winner.visitors === 0 || challenger.visitors === 0) continue;

    // Calculate pooled standard error
    const winnerRate = winner.conversions / winner.visitors;
    const challengerRate = challenger.conversions / challenger.visitors;
    const pooledRate = (winner.conversions + challenger.conversions) / 
                      (winner.visitors + challenger.visitors);
    
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * 
      (1 / winner.visitors + 1 / challenger.visitors)
    );
    
    // Calculate z-score
    const zScore = (winnerRate - challengerRate) / standardError;
    
    // Simplified p-value calculation (assuming z-score normal distribution)
    // Using one-sided test since we're checking if winner > challenger
    const pValue = 1 - normalCDF(zScore);
    
    totalPValues += pValue;
    comparisonCount++;
  }

  // Average p-value across all comparisons
  const avgPValue = comparisonCount > 0 ? totalPValues / comparisonCount : 1;
  
  // Adjust confidence level based on the average p-value
  // The more significant the comparisons, the higher the confidence
  const adjustedConfidence = (1 - avgPValue) * 100;
  
  // Weight the adjusted confidence with the base confidence level
  const finalConfidence = Math.min(
    Math.round((adjustedConfidence + baseConfidenceLevel) / 2),
    baseConfidenceLevel
  );

  return {
    winningKey,
    confidenceLevel: finalConfidence
  };
};

/**
 * Approximation of the normal cumulative distribution function
 */
const normalCDF = (z: number): number => {
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