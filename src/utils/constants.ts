/**
 * Application constants for standardized values
 */

// Decimal precision constants for consistent display across UI
export const DECIMAL_PRECISION = {
  CONVERSION_RATE: 2,
  P_VALUE: 4,
  RELATIVE_UPLIFT: 2,
  POWER: 1,
  Z_SCORE: 2,
  CONFIDENCE_INTERVAL: 2,
};

// Formatting utility functions
export const formatPercent = (value: number, precision: number = DECIMAL_PRECISION.CONVERSION_RATE): string => {
  return `${value.toFixed(precision)}%`;
};

export const formatNumber = (value: number, precision: number = 2): string => {
  return value.toFixed(precision);
};

export const formatPValue = (value: number): string => {
  // For very small p-values, show as <0.0001 instead of 0.0000
  if (value < 0.0001) return '<0.0001';
  return value.toFixed(DECIMAL_PRECISION.P_VALUE);
}; 