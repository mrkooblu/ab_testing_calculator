import { ABTestFormData, VariantKey } from '../types';

interface TestInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
}

interface TestRecommendation {
  action: string;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

interface InsightsResult {
  insights: TestInsight[];
  recommendations: TestRecommendation[];
  summary: string;
}

/**
 * Analyze test data and generate human-readable insights and recommendations
 */
export const generateInsights = (
  testData: ABTestFormData,
  controlKey: VariantKey,
  testKey: VariantKey,
  pValue: number,
  relativeUplift: number,
  isSignificant: boolean,
  power: number
): InsightsResult => {
  const control = testData.variants[controlKey];
  const test = testData.variants[testKey];
  const confidenceLevel = testData.settings.confidenceLevel;
  const alpha = (100 - confidenceLevel) / 100;
  
  const insights: TestInsight[] = [];
  const recommendations: TestRecommendation[] = [];
  let summary = '';
  
  // Generate insights based on test results
  
  // Sample size insights
  if (control.visitors < 100 || test.visitors < 100) {
    insights.push({
      type: 'warning',
      title: 'Small Sample Size',
      description: 'Your sample size is quite small, which may lead to unreliable results. Consider running the test longer to gather more data.'
    });
  }
  
  // Conversion rate insights
  const conversionDiff = Math.abs(control.conversionRate - test.conversionRate);
  if (conversionDiff < 0.5) {
    insights.push({
      type: 'info',
      title: 'Small Conversion Difference',
      description: `The difference between conversion rates is only ${conversionDiff.toFixed(2)}%, which might be too small to have a meaningful business impact even if statistically significant.`
    });
  }
  
  // Power insights
  if (power < 80) {
    insights.push({
      type: 'warning',
      title: 'Low Statistical Power',
      description: `Your test has ${power.toFixed(0)}% power, which means it may not be able to reliably detect small but real differences. A target power of at least 80% is recommended.`
    });
  }
  
  // Significance insights
  if (isSignificant) {
    insights.push({
      type: 'success',
      title: 'Statistically Significant Result',
      description: `Your test shows a statistically significant difference at the ${confidenceLevel}% confidence level.`
    });
    
    if (test.conversionRate > control.conversionRate) {
      recommendations.push({
        action: `Implement variant ${test.type}`,
        reasoning: `Variant ${test.type} shows a ${Math.abs(relativeUplift).toFixed(1)}% higher conversion rate than variant ${control.type} with statistical significance.`,
        confidence: power >= 80 ? 'high' : 'medium'
      });
    } else {
      recommendations.push({
        action: `Keep variant ${control.type}`,
        reasoning: `Variant ${test.type} performs worse than the control (variant ${control.type}).`,
        confidence: power >= 80 ? 'high' : 'medium'
      });
    }
  } else {
    insights.push({
      type: 'info',
      title: 'No Significant Difference',
      description: `Your test does not show a statistically significant difference at the ${confidenceLevel}% confidence level.`
    });
    
    if (pValue < 0.2) {
      insights.push({
        type: 'info',
        title: 'Trending Toward Significance',
        description: `With a p-value of ${pValue.toFixed(3)}, your test is trending toward significance. Consider running the test longer.`
      });
      
      recommendations.push({
        action: 'Continue the test',
        reasoning: 'The results are trending toward significance but need more data to be conclusive.',
        confidence: 'medium'
      });
    } else {
      recommendations.push({
        action: 'Consider ending the test',
        reasoning: 'There appears to be little difference between variants, or the difference is too small to detect with your current traffic levels.',
        confidence: 'medium'
      });
    }
  }
  
  // Analyze the data for imbalances
  const visitorRatio = Math.max(control.visitors, test.visitors) / Math.min(control.visitors, test.visitors);
  if (visitorRatio > 1.1) {
    insights.push({
      type: 'warning',
      title: 'Visitor Imbalance',
      description: `Your variants have uneven visitor counts (ratio of ${visitorRatio.toFixed(2)}:1). This may introduce bias and affect the reliability of results.`
    });
  }
  
  // Create a summary
  if (isSignificant) {
    if (test.conversionRate > control.conversionRate) {
      summary = `Variant ${test.type} outperforms variant ${control.type} by ${Math.abs(relativeUplift).toFixed(1)}% (statistically significant at ${confidenceLevel}% confidence).`;
    } else {
      summary = `Variant ${control.type} outperforms variant ${test.type} by ${Math.abs(relativeUplift).toFixed(1)}% (statistically significant at ${confidenceLevel}% confidence).`;
    }
  } else {
    summary = `No statistically significant difference found between variants ${control.type} and ${test.type} at ${confidenceLevel}% confidence (p-value: ${pValue.toFixed(4)}).`;
  }
  
  return {
    insights,
    recommendations,
    summary
  };
};

/**
 * Get a sample size recommendation based on baseline conversion and minimum detectable effect
 */
export const getSampleSizeRecommendation = (
  baselineConversion: number,
  minimumDetectableEffect: number,
  confidenceLevel: number = 95,
  power: number = 80
): { sampleSizePerVariant: number, totalSampleSize: number, testDurationEstimate: string } => {
  // Convert percentages to proportions
  const baselineProportion = baselineConversion / 100;
  const mde = minimumDetectableEffect / 100;
  
  // Calculate expected conversion rate of the test variant
  const testProportion = baselineProportion * (1 + mde);
  
  // Z scores for alpha (confidence level) and beta (power)
  const zScore = {
    90: 1.645,
    95: 1.96,
    99: 2.576
  };
  
  const zAlpha = zScore[confidenceLevel as keyof typeof zScore] || 1.96;
  const zBeta = zScore[power as keyof typeof zScore] || 0.84;
  
  // Calculate standard deviations
  const sd1 = Math.sqrt(baselineProportion * (1 - baselineProportion));
  const sd2 = Math.sqrt(testProportion * (1 - testProportion));
  
  // Calculate sample size per variant
  const sampleSizePerVariant = Math.ceil(
    Math.pow(zAlpha * sd1 + zBeta * sd2, 2) / 
    Math.pow(baselineProportion - testProportion, 2)
  );
  
  // Total sample size for both variants
  const totalSampleSize = sampleSizePerVariant * 2;
  
  // Calculate test duration estimate based on sample size
  let testDurationEstimate = '';
  if (totalSampleSize < 1000) {
    testDurationEstimate = 'A few days to a week';
  } else if (totalSampleSize < 5000) {
    testDurationEstimate = '1-2 weeks';
  } else if (totalSampleSize < 20000) {
    testDurationEstimate = '2-4 weeks';
  } else if (totalSampleSize < 100000) {
    testDurationEstimate = '1-2 months';
  } else {
    testDurationEstimate = 'Over 2 months';
  }
  
  return {
    sampleSizePerVariant,
    totalSampleSize,
    testDurationEstimate
  };
}; 