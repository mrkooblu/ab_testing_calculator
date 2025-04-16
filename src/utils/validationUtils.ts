import { ABTestFormData, VariantKey } from '../types';

/**
 * Error codes used for standardizing error messages
 */
export enum ValidationErrorCode {
  REQUIRED = 'required',
  NEGATIVE = 'negative',
  FRACTIONAL = 'fractional',
  CONVERSIONS_EXCEED_VISITORS = 'conversions_exceed',
  MINIMUM_VARIANTS = 'min_variants',
  SAMPLE_SIZE_SMALL = 'sample_small',
  CONVERSION_RATE_EXTREME = 'conversion_extreme',
  INVALID_FORMAT = 'invalid_format'
}

/**
 * Warning codes used for non-blocking validation issues
 */
export enum ValidationWarningCode {
  SAMPLE_SIZE_SMALL = 'sample_small_warning',
  LOW_CONVERSIONS = 'low_conversions_warning',
  IMBALANCED_TRAFFIC = 'imbalanced_traffic_warning',
  EXTREME_BASELINE = 'extreme_baseline_warning',
  HIGH_SIGNIFICANCE = 'high_significance_warning'
}

/**
 * Interface for validation error objects
 */
export interface ValidationError {
  code: ValidationErrorCode;
  message: string;
  field: string;
}

/**
 * Interface for validation warning objects
 */
export interface ValidationWarning {
  code: ValidationWarningCode;
  message: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

/**
 * Interface for validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, Record<string, ValidationError>>;
  warnings: ValidationWarning[];
}

/**
 * Minimum recommended sample sizes for statistical significance
 */
const RECOMMENDED_SAMPLE_SIZES = {
  MIN_VISITORS: 100,
  MIN_CONVERSIONS: 25,
  IDEAL_VISITORS: 1000
};

/**
 * Check if a value is an integer
 */
export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

/**
 * Check if visitors count meets minimum recommended sample size
 */
export const hasAdequateSampleSize = (visitors: number): boolean => {
  return visitors >= RECOMMENDED_SAMPLE_SIZES.MIN_VISITORS;
};

/**
 * Check if conversions count is adequate for reliable statistics
 */
export const hasAdequateConversions = (conversions: number): boolean => {
  return conversions >= RECOMMENDED_SAMPLE_SIZES.MIN_CONVERSIONS;
};

/**
 * Check if traffic allocation is balanced between variants
 */
export const hasBalancedTraffic = (variants: ABTestFormData['variants']): boolean => {
  const activeVariants = Object.values(variants).filter(v => v.visitors > 0);
  if (activeVariants.length < 2) return true;
  
  const totalVisitors = activeVariants.reduce((sum, v) => sum + v.visitors, 0);
  const expectedPerVariant = totalVisitors / activeVariants.length;
  
  // Check if any variant has more than 20% deviation from expected
  return !activeVariants.some(v => {
    const deviation = Math.abs(v.visitors - expectedPerVariant) / expectedPerVariant;
    return deviation > 0.2; // 20% deviation threshold
  });
};

/**
 * Check if baseline conversion rate is extreme (very low or very high)
 */
export const hasExtremeBaseline = (conversionRate: number): boolean => {
  return conversionRate < 1 || conversionRate > 99;
};

/**
 * Comprehensive form validation function that checks for errors and warnings
 */
export const validateABTestForm = (formData: ABTestFormData): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
    warnings: []
  };
  
  // Helper to add an error
  const addError = (variantKey: string, field: string, code: ValidationErrorCode, message: string) => {
    if (!result.errors[variantKey]) {
      result.errors[variantKey] = {};
    }
    
    result.errors[variantKey][field] = {
      code,
      message,
      field
    };
    
    result.isValid = false;
  };
  
  // Helper to add a warning
  const addWarning = (code: ValidationWarningCode, message: string, severity: 'low' | 'medium' | 'high', recommendation: string) => {
    result.warnings.push({
      code,
      message,
      severity,
      recommendation
    });
  };
  
  // Get active variants (those with data)
  const activeVariantKeys = Object.keys(formData.variants).filter(
    key => formData.variants[key as VariantKey].visitors > 0
  ) as VariantKey[];
  
  // Check if we have enough active variants
  if (activeVariantKeys.length < 2) {
    addError('form', 'general', ValidationErrorCode.MINIMUM_VARIANTS, 
      'At least 2 variants with visitor data are required');
  }
  
  // Check individual variant data
  Object.keys(formData.variants).forEach(key => {
    const variantKey = key as VariantKey;
    const variant = formData.variants[variantKey];
    
    // Skip validation for inactive variants
    if (variant.visitors === 0) return;
    
    // Validate visitors
    if (variant.visitors < 0) {
      addError(variantKey, 'visitors', ValidationErrorCode.NEGATIVE, 
        'Visitor count cannot be negative');
    } else if (!isInteger(variant.visitors)) {
      addError(variantKey, 'visitors', ValidationErrorCode.FRACTIONAL, 
        'Visitor count must be a whole number');
    }
    
    // Validate conversions
    if (variant.conversions < 0) {
      addError(variantKey, 'conversions', ValidationErrorCode.NEGATIVE, 
        'Conversion count cannot be negative');
    } else if (!isInteger(variant.conversions)) {
      addError(variantKey, 'conversions', ValidationErrorCode.FRACTIONAL, 
        'Conversion count must be a whole number');
    } else if (variant.conversions > variant.visitors) {
      addError(variantKey, 'conversions', ValidationErrorCode.CONVERSIONS_EXCEED_VISITORS, 
        'Conversions cannot exceed visitor count');
    }
    
    // Add warnings (only if no errors)
    if (!result.errors[variantKey]) {
      // Check for small sample size
      if (!hasAdequateSampleSize(variant.visitors)) {
        addWarning(ValidationWarningCode.SAMPLE_SIZE_SMALL, 
          `Variant ${variant.type} has a small sample size (${variant.visitors} visitors)`,
          'medium',
          `For reliable results, aim for at least ${RECOMMENDED_SAMPLE_SIZES.MIN_VISITORS} visitors per variant`);
      }
      
      // Check for low conversion count
      if (!hasAdequateConversions(variant.conversions)) {
        addWarning(ValidationWarningCode.LOW_CONVERSIONS, 
          `Variant ${variant.type} has few conversions (${variant.conversions})`,
          variant.conversions < 10 ? 'high' : 'medium',
          `For reliable results, aim for at least ${RECOMMENDED_SAMPLE_SIZES.MIN_CONVERSIONS} conversions per variant`);
      }
      
      // Check for extreme conversion rates
      if (hasExtremeBaseline(variant.conversionRate)) {
        addWarning(ValidationWarningCode.EXTREME_BASELINE, 
          `Variant ${variant.type} has an extreme conversion rate (${variant.conversionRate.toFixed(2)}%)`,
          'medium',
          'Extreme conversion rates may require larger sample sizes for reliable results');
      }
    }
  });
  
  // Check for traffic imbalance (whole form warning)
  if (!hasBalancedTraffic(formData.variants) && activeVariantKeys.length >= 2) {
    addWarning(ValidationWarningCode.IMBALANCED_TRAFFIC, 
      'Traffic is not evenly distributed between variants',
      'medium',
      'For optimal results, aim for similar visitor counts across variants');
  }
  
  return result;
}; 