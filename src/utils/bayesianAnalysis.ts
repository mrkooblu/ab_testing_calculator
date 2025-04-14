import { jStat } from 'jstat';

interface BayesianTestResult {
  probabilityOfImprovement: number;  // Probability that B > A
  expectedLift: number;              // Expected relative uplift
  ci95Low: number;                   // 95% credible interval (low)
  ci95High: number;                  // 95% credible interval (high)
  probabilityOfBeatingBaseline: number[]; // Probability of beating baseline by at least X%
}

/**
 * Perform Bayesian analysis on A/B test results
 * 
 * This function uses a Beta distribution with a uniform Beta(1,1) prior 
 * to model the conversion rates, then uses Monte Carlo simulation to
 * calculate the probability that variant B outperforms variant A.
 * 
 * @param visitorsA - Number of visitors for variant A
 * @param conversionsA - Number of conversions for variant A
 * @param visitorsB - Number of visitors for variant B
 * @param conversionsB - Number of conversions for variant B
 * @returns Bayesian analysis results including probability of improvement and credible intervals
 */
export const runBayesianTest = (
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number
): BayesianTestResult => {
  // Ensure we have valid numbers
  if (
    !Number.isFinite(visitorsA) ||
    !Number.isFinite(conversionsA) ||
    !Number.isFinite(visitorsB) ||
    !Number.isFinite(conversionsB) ||
    visitorsA <= 0 ||
    visitorsB <= 0
  ) {
    return {
      probabilityOfImprovement: 0,
      expectedLift: 0,
      ci95Low: 0,
      ci95High: 0,
      probabilityOfBeatingBaseline: [0, 0, 0, 0, 0]
    };
  }

  // Set up beta distributions (using Beta(1,1) prior)
  const alphaA = conversionsA + 1;
  const betaA = visitorsA - conversionsA + 1;
  const alphaB = conversionsB + 1;
  const betaB = visitorsB - conversionsB + 1;

  // Calculate probability that B is better than A
  // Method 1: Monte Carlo simulation (more accurate for extreme cases)
  const simulationCount = 100000;
  let countBGreaterThanA = 0;
  const sampleLiftValues: number[] = [];

  for (let i = 0; i < simulationCount; i++) {
    const sampleA = jStat.beta.sample(alphaA, betaA);
    const sampleB = jStat.beta.sample(alphaB, betaB);
    
    if (sampleB > sampleA) {
      countBGreaterThanA++;
    }
    
    // Calculate relative lift for credible interval
    if (sampleA > 0) {
      const relativeLift = ((sampleB - sampleA) / sampleA) * 100;
      sampleLiftValues.push(relativeLift);
    }
  }
  
  // Use a minimum value to avoid exactly 0% probability
  // This prevents misleading display in the UI when probability is extremely small but not truly zero
  const epsilon = 1e-5; // 0.001%
  let probabilityBGreaterThanA = countBGreaterThanA / simulationCount;
  probabilityBGreaterThanA = Math.max(epsilon, probabilityBGreaterThanA);
  
  // Expected lift calculation (mean of posterior distribution)
  const rateA = alphaA / (alphaA + betaA);
  const rateB = alphaB / (alphaB + betaB);
  const expectedLift = ((rateB - rateA) / rateA) * 100;

  // Calculate 95% credible interval for the lift
  sampleLiftValues.sort((a, b) => a - b);
  
  // Manual percentile calculation since jStat.percentile isn't available
  const getPercentile = (arr: number[], percentile: number): number => {
    if (arr.length === 0) return 0;
    const index = Math.floor(arr.length * percentile);
    return arr[Math.min(Math.max(index, 0), arr.length - 1)]; // Ensure index is within bounds
  };
  
  const credibleIntervalLow = getPercentile(sampleLiftValues, 0.025);
  const credibleIntervalHigh = getPercentile(sampleLiftValues, 0.975);

  // Calculate probability of improvement (P(B > A))
  let countBeatThresholds: number[] = [0, 0, 0, 0, 0]; // [0%, 1%, 2%, 5%, 10%]
  const thresholds = [0, 0.01, 0.02, 0.05, 0.1];
  
  // Run simulation for threshold probabilities
  for (let i = 0; i < simulationCount; i++) {
    const sampleA = jStat.beta.sample(alphaA, betaA);
    const sampleB = jStat.beta.sample(alphaB, betaB);
    
    // Check different thresholds
    for (let t = 0; t < thresholds.length; t++) {
      // thresholds[t] represents minimum relative improvement:
      // 0: any improvement, 0.01: 1% or more, 0.02: 2% or more, 0.05: 5% or more, 0.1: 10% or more
      if (sampleB >= sampleA * (1 + thresholds[t])) {
        countBeatThresholds[t]++;
      }
    }
  }
  
  // Calculate probabilities of improvement
  const probabilityOfImprovement = probabilityBGreaterThanA;
  const probabilityOfBeatingBaseline = countBeatThresholds.map(count => count / simulationCount);
  
  return {
    probabilityOfImprovement,
    expectedLift,
    ci95Low: credibleIntervalLow,
    ci95High: credibleIntervalHigh,
    probabilityOfBeatingBaseline: probabilityOfBeatingBaseline
  };
};

/**
 * Calculate the Bayesian expected loss from implementing B over A
 * Lower values mean B is more likely better than A
 * @param visitorsA - Number of visitors for variant A
 * @param conversionsA - Number of conversions for variant A
 * @param visitorsB - Number of visitors for variant B
 * @param conversionsB - Number of conversions for variant B
 * @returns Expected loss value
 */
export const calculateExpectedLoss = (
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number
): number => {
  const rateA = conversionsA / visitorsA;
  const rateB = conversionsB / visitorsB;
  
  const alphaA = conversionsA + 1;
  const betaA = visitorsA - conversionsA + 1;
  const alphaB = conversionsB + 1;
  const betaB = visitorsB - conversionsB + 1;
  
  // Calculate expected loss using Monte Carlo simulation
  const simulationCount = 100000; // Increase simulation count for better precision
  let totalLoss = 0;
  
  for (let i = 0; i < simulationCount; i++) {
    const sampleA = jStat.beta.sample(alphaA, betaA);
    const sampleB = jStat.beta.sample(alphaB, betaB);
    const loss = Math.max(0, sampleA - sampleB);
    totalLoss += loss;
  }
  
  // Use a small epsilon to avoid returning exactly 0
  // This prevents misleading display of 0.0% in the UI when
  // the actual probability is just extremely small
  const epsilon = 1e-10;
  const result = (totalLoss / simulationCount) * 100; // Return as percentage
  
  return result < epsilon ? epsilon * 100 : result;
};

/**
 * Calculate sample size recommendation using Bayesian approach
 * @param baselineConversionRate - Baseline conversion rate (percentage)
 * @param expectedEffect - Expected effect size (percentage lift)
 * @param desiredProbability - Desired probability of detecting the effect (default: 0.95)
 * @returns Recommended sample size per variant
 */
export const calculateBayesianSampleSize = (
  baselineConversionRate: number,
  expectedEffect: number,
  desiredProbability: number = 0.95
): number => {
  const baselineRate = baselineConversionRate / 100;
  const effectSize = expectedEffect / 100;
  const targetRate = baselineRate * (1 + effectSize);
  
  // Start with a low sample size and increase until we reach desired probability
  let sampleSize = 100;
  let probability = 0;
  
  while (probability < desiredProbability && sampleSize < 1000000) {
    // Simulate test results using expected conversion rates
    const controlConversions = Math.round(baselineRate * sampleSize);
    const treatmentConversions = Math.round(targetRate * sampleSize);
    
    // Run Bayesian test on simulated data
    const result = runBayesianTest(
      sampleSize, 
      controlConversions, 
      sampleSize, 
      treatmentConversions
    );
    
    probability = result.probabilityOfImprovement;
    
    if (probability < desiredProbability) {
      sampleSize = Math.ceil(sampleSize * 1.5);
    }
  }
  
  return sampleSize;
}; 