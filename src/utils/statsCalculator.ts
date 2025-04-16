// Statistical calculation utilities for A/B Testing
import { useMemo } from 'react';
import { ABTestFormData, VariantComparison, VariantKey } from '../types';
import { memoize, LRUCache } from './cacheUtils';

// Use LRUCache for more efficient caching with automatic memory management
const calculationCache = {
  normCDF: new LRUCache<number>(200),
  pValue: new LRUCache<number>(150),
  power: new LRUCache<number>(100),
  zAlpha: new LRUCache<number>(50)
};

/**
 * Generate a cache key for calculation results
 */
const getCacheKey = (fn: string, ...args: any[]): string => {
  return `${fn}_${args.join('_')}`;
};

/**
 * Clear the calculation cache
 */
export const clearCalculationCache = (): void => {
  Object.values(calculationCache).forEach(cache => {
    cache.clear();
  });
};

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
  // Handle case where control variant has 0% conversion rate
  if (rateA === 0) {
    // If both rates are 0, there's no uplift
    if (rateB === 0) return 0;
    // If control is 0 but test is not, it's an infinite uplift
    // Return a large but finite number instead
    return rateB > 0 ? 999999 : -999999;
  }
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
 * Normal cumulative distribution function with caching for performance
 */
export const normCDF = (z: number): number => {
  // Round z to 4 decimal places for cache lookup
  const roundedZ = Math.round(z * 10000) / 10000;
  const cacheKey = String(roundedZ);
  
  if (calculationCache.normCDF.has(cacheKey)) {
    return calculationCache.normCDF.get(cacheKey)!;
  }
  
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
  
  const result = 0.5 + sum * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  calculationCache.normCDF.set(cacheKey, result);
  
  return result;
};

/**
 * Calculate p-value with caching for performance
 */
export const calculatePValue = (zScore: number, isTwoSided: boolean): number => {
  const cacheKey = `${zScore.toFixed(4)}_${isTwoSided}`;
  
  if (calculationCache.pValue.has(cacheKey)) {
    return calculationCache.pValue.get(cacheKey)!;
  }
  
  let result: number;
  
  // For one-sided test, we only care about improvement (positive z-score)
  // For negative z-scores in one-sided tests, p-value should be 1
  if (!isTwoSided && zScore < 0) {
    result = 1;
  } else if (isTwoSided) {
    result = 2 * (1 - normCDF(Math.abs(zScore)));
  } else {
    result = 1 - normCDF(zScore);
  }
  
  calculationCache.pValue.set(cacheKey, result);
  return result;
};

/**
 * Calculate statistical power with caching for performance
 * Simplified calculation - in practice may want to use more sophisticated methods
 */
export const calculatePower = (
  visitorsA: number,
  visitorsB: number,
  rateA: number,
  rateB: number,
  alpha: number
): number => {
  const cacheKey = `${visitorsA}_${visitorsB}_${rateA.toFixed(2)}_${rateB.toFixed(2)}_${alpha}`;
  
  if (calculationCache.power.has(cacheKey)) {
    return calculationCache.power.get(cacheKey)!;
  }
  
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
  
  const result = normCDF(zPower) * 100;
  calculationCache.power.set(cacheKey, result);
  
  return result;
};

/**
 * Calculate Z-alpha based on confidence level with caching for performance
 */
export const calculateZAlpha = (alpha: number, isTwoSided: boolean): number => {
  const cacheKey = `${alpha}_${isTwoSided}`;
  
  if (calculationCache.zAlpha.has(cacheKey)) {
    return calculationCache.zAlpha.get(cacheKey)!;
  }
  
  let calcAlpha = alpha;
  if (isTwoSided) {
    calcAlpha = alpha / 2;
  }
  
  // Approximation of the inverse of the normal CDF
  const p = 1 - calcAlpha;
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
  
  calculationCache.zAlpha.set(cacheKey, zAlpha);
  return zAlpha;
};

/**
 * Determine if test is statistically significant
 */
export const isSignificant = (pValue: number, confidenceLevel: number): boolean => {
  const alpha = (100 - confidenceLevel) / 100;
  return pValue < alpha;
};

/**
 * React hook for memoizing variant comparison calculations
 */
export const useVariantComparisons = (data: ABTestFormData): VariantComparison[] => {
  return useMemo(() => {
    const { variants, settings } = data;
    const comparisons: VariantComparison[] = [];
    
    // Get active variants (those with visitors > 0)
    const activeVariantKeys = Object.keys(variants).filter(
      key => variants[key as VariantKey].visitors > 0
    ) as VariantKey[];
    
    if (activeVariantKeys.length < 2) {
      return comparisons;
    }
    
    // Use first variant as control and compare against others
    const controlKey = activeVariantKeys[0];
    const controlType = variants[controlKey].type;
    
    for (let i = 1; i < activeVariantKeys.length; i++) {
      const testKey = activeVariantKeys[i];
      const testType = variants[testKey].type;
      
      const controlVariant = variants[controlKey];
      const testVariant = variants[testKey];
      
      // Calculate relative uplift
      const relativeUplift = calculateRelativeUplift(
        controlVariant.conversionRate,
        testVariant.conversionRate
      );
      
      // Calculate standard errors
      const seA = calculateStandardError(controlVariant.conversionRate, controlVariant.visitors);
      const seB = calculateStandardError(testVariant.conversionRate, testVariant.visitors);
      const seDiff = calculateStandardErrorDiff(seA, seB);
      
      // Calculate Z-score
      const zScore = calculateZScore(
        controlVariant.conversionRate,
        testVariant.conversionRate,
        seDiff
      );
      
      // Calculate p-value
      const pValue = calculatePValue(zScore, settings.hypothesisType === 'two-sided');
      
      // Calculate power
      const alpha = (100 - settings.confidenceLevel) / 100;
      const power = calculatePower(
        controlVariant.visitors,
        testVariant.visitors,
        controlVariant.conversionRate,
        testVariant.conversionRate,
        alpha
      );
      
      // Determine if the result is significant
      const isSignificantResult = isSignificant(pValue, settings.confidenceLevel);
      
      // Determine which variant is better
      let betterVariant: VariantKey | null = null;
      if (testVariant.conversionRate > controlVariant.conversionRate) {
        betterVariant = testKey;
      } else if (controlVariant.conversionRate > testVariant.conversionRate) {
        betterVariant = controlKey;
      }
      
      comparisons.push({
        controlKey,
        testKey,
        controlType,
        testType,
        controlRate: controlVariant.conversionRate,
        testRate: testVariant.conversionRate,
        relativeUplift,
        zScore,
        pValue,
        power,
        isSignificant: isSignificantResult,
        betterVariant,
        standardError: seDiff
      });
    }
    
    return comparisons;
  }, [data]);
}; 