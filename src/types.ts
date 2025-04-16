// Type definitions for the A/B Testing Calculator

export type VariantKey = 'variantA' | 'variantB' | 'variantC' | 'variantD';
export type VariantType = 'A' | 'B' | 'C' | 'D';

export interface VariantData {
  type: VariantType;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

export interface ABTestFormData {
  variants: Record<VariantKey, VariantData>;
  settings: {
    confidenceLevel: number;
    hypothesisType: 'one-sided' | 'two-sided';
  };
}

export interface VariantComparison {
  controlKey: VariantKey;
  testKey: VariantKey;
  controlType: VariantType;
  testType: VariantType;
  controlRate: number;
  testRate: number;
  relativeUplift: number;
  zScore: number;
  pValue: number;
  power: number;
  isSignificant: boolean;
  betterVariant: VariantKey | null;
  standardError: number;
}

export interface StatisticalSettings {
  confidenceLevel: number;
  hypothesisType: 'one-sided' | 'two-sided';
} 