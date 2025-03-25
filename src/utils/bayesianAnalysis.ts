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
 * @param visitorsA - Number of visitors for variant A
 * @param conversionsA - Number of conversions for variant A
 * @param visitorsB - Number of visitors for variant B
 * @param conversionsB - Number of conversions for variant B
 * @param simulationCount - Number of Monte Carlo simulations to run (default: 100000)
 * @returns Bayesian analysis results
 */
export const runBayesianTest = (
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number,
  simulationCount: number = 100000
): BayesianTestResult => {
  // For Bayesian analysis, we use Beta distribution
  // Beta(α, β) where α = conversions + 1, β = visitors - conversions + 1
  // This implements an uninformative prior of Beta(1, 1)
  
  // Alpha (α) and Beta (β) parameters for the two variants
  const alphaA = conversionsA + 1;
  const betaA = visitorsA - conversionsA + 1;
  const alphaB = conversionsB + 1;
  const betaB = visitorsB - conversionsB + 1;
  
  // Monte Carlo simulation to calculate probability distributions
  const samplesA: number[] = [];
  const samplesB: number[] = [];
  const liftSamples: number[] = [];
  
  // Generate samples from Beta distributions
  for (let i = 0; i < simulationCount; i++) {
    const rateA = jStat.beta.sample(alphaA, betaA);
    const rateB = jStat.beta.sample(alphaB, betaB);
    
    samplesA.push(rateA * 100); // Convert to percentage
    samplesB.push(rateB * 100); // Convert to percentage
    
    // Calculate relative uplift
    const lift = ((rateB - rateA) / rateA) * 100;
    liftSamples.push(lift);
  }
  
  // Calculate probability of improvement (P(B > A))
  let countBGreaterThanA = 0;
  let countBeatThresholds: number[] = [0, 0, 0, 0, 0]; // [0%, 1%, 2%, 5%, 10%]
  const thresholds = [0, 0.01, 0.02, 0.05, 0.1];
  
  for (let i = 0; i < simulationCount; i++) {
    const rawRateA = samplesA[i] / 100;
    const rawRateB = samplesB[i] / 100;
    
    if (rawRateB > rawRateA) {
      countBGreaterThanA++;
    }
    
    // Check different thresholds
    for (let t = 0; t < thresholds.length; t++) {
      if (rawRateB >= rawRateA * (1 + thresholds[t])) {
        countBeatThresholds[t]++;
      }
    }
  }
  
  // Calculate probabilities of improvement
  const probabilityOfImprovement = countBGreaterThanA / simulationCount;
  const probabilityOfBeatBaseline = countBeatThresholds.map(count => count / simulationCount);
  
  // Calculate expected lift (mean of lift samples)
  const expectedLift = liftSamples.reduce((sum, val) => sum + val, 0) / simulationCount;
  
  // Calculate 95% credible interval for lift
  liftSamples.sort((a, b) => a - b);
  const ci95Low = liftSamples[Math.floor(simulationCount * 0.025)];
  const ci95High = liftSamples[Math.floor(simulationCount * 0.975)];
  
  return {
    probabilityOfImprovement,
    expectedLift,
    ci95Low,
    ci95High,
    probabilityOfBeatingBaseline: probabilityOfBeatBaseline
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
  
  // If B already appears better than A, return 0 loss
  if (rateB > rateA) {
    return 0;
  }
  
  const alphaA = conversionsA + 1;
  const betaA = visitorsA - conversionsA + 1;
  const alphaB = conversionsB + 1;
  const betaB = visitorsB - conversionsB + 1;
  
  // Calculate expected loss using analytical formula
  // E[max(0, θA - θB)] where θ is conversion rate
  
  // Estimate using Monte Carlo simulation
  const simulationCount = 10000;
  let totalLoss = 0;
  
  for (let i = 0; i < simulationCount; i++) {
    const sampleA = jStat.beta.sample(alphaA, betaA);
    const sampleB = jStat.beta.sample(alphaB, betaB);
    const loss = Math.max(0, sampleA - sampleB);
    totalLoss += loss;
  }
  
  return (totalLoss / simulationCount) * 100; // Return as percentage
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
      treatmentConversions,
      10000 // Smaller simulation for performance
    );
    
    probability = result.probabilityOfImprovement;
    
    if (probability < desiredProbability) {
      sampleSize = Math.ceil(sampleSize * 1.5);
    }
  }
  
  return sampleSize;
}; 