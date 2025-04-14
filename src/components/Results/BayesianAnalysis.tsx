import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { runBayesianTest, calculateExpectedLoss } from '../../utils/bayesianAnalysis';
import { ABTestFormData, VariantKey } from '../../types';
import { checkSampleSizeWarning } from '../../utils/statistics';

interface BayesianAnalysisProps {
  testData: ABTestFormData;
  controlKey: VariantKey;
  testKey: VariantKey;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const BayesianContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: ${fadeIn} 0.5s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const BayesianTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const WarningBanner = styled.div<{ severity: 'low' | 'medium' | 'high' }>`
  background-color: ${({ theme, severity }) => 
    severity === 'high' ? `${theme.colors.error}15` : 
    severity === 'medium' ? `${theme.colors.warning}15` : 
    `${theme.colors.info}15`};
  border-left: 4px solid ${({ theme, severity }) => 
    severity === 'high' ? theme.colors.error : 
    severity === 'medium' ? theme.colors.warning : 
    theme.colors.info};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProbabilityContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProbabilityMeter = styled.div`
  width: 100%;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.md} 0;
  position: relative;
`;

const ProbabilityFill = styled.div<{ probability: number }>`
  height: 100%;
  width: ${({ probability }) => `${probability * 100}%`};
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.info} 0%, 
    ${({ theme }) => theme.colors.primary} 50%, 
    ${({ theme }) => theme.colors.success} 100%
  );
  transition: width 1s ease-out;
`;

const ProbabilityScale = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProbabilityValue = styled.div<{ probability: number }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-align: center;
  margin: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme, probability }) => {
    if (probability >= 0.95) return theme.colors.success;
    if (probability >= 0.8) return theme.colors.primary;
    return theme.colors.text.primary;
  }};
`;

const ProbabilityCaption = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MetricTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const MetricSubValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ThresholdTable = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ThresholdTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  th {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  
  td {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const CredibleIntervalBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  margin-top: ${({ theme }) => theme.spacing.sm};
  position: relative;
`;

const CredibleIntervalFill = styled.div<{ low: number; high: number; base: number }>`
  position: absolute;
  height: 100%;
  left: ${({ low, base }) => `${50 + (low / base) * 50}%`};
  right: ${({ high, base }) => `${50 - (high / base) * 50}%`};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
`;

const CredibleIntervalMarker = styled.div<{ position: number; base: number }>`
  position: absolute;
  height: 12px;
  width: 2px;
  bottom: -2px;
  left: ${({ position, base }) => `${50 + (position / base) * 50}%`};
  background-color: ${({ theme }) => theme.colors.text.secondary};
  
  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.text.primary};
    top: -10px;
    left: -3px;
  }
`;

const BayesianAnalysis: React.FC<BayesianAnalysisProps> = ({
  testData,
  controlKey,
  testKey,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  
  const control = testData.variants[controlKey];
  const test = testData.variants[testKey];
  
  // Check sample size warnings
  const controlWarning = checkSampleSizeWarning(control.visitors, control.conversions);
  const testWarning = checkSampleSizeWarning(test.visitors, test.conversions);
  
  useEffect(() => {
    // Run Bayesian analysis in a non-blocking way
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      const bayesianResults = runBayesianTest(
        control.visitors,
        control.conversions,
        test.visitors,
        test.conversions
      );
      
      const expectedLoss = calculateExpectedLoss(
        control.visitors,
        control.conversions,
        test.visitors,
        test.conversions
      );
      
      setResults({
        ...bayesianResults,
        expectedLoss
      });
      
      setIsLoading(false);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [control.visitors, control.conversions, test.visitors, test.conversions]);
  
  const getThresholdLabel = (threshold: number, index: number) => {
    if (index === 0) return 'Any improvement';
    return `≥ ${threshold * 100}%`;
  };
  
  if (isLoading) {
    return (
      <BayesianContainer>
        <BayesianTitle>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 20L19 20L19 4L9 4L9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 20L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 16L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 8L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Bayesian Analysis
        </BayesianTitle>
        <LoadingContainer>
          Calculating Bayesian probabilities...
        </LoadingContainer>
      </BayesianContainer>
    );
  }
  
  // Calculate the max absolute value for scaling the credible interval bar
  const maxAbsValue = Math.max(Math.abs(results.ci95Low), Math.abs(results.ci95High));
  const scaleBase = Math.max(50, Math.ceil(maxAbsValue / 10) * 10); // Round up to nearest 10
  
  return (
    <BayesianContainer>
      <BayesianTitle>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 20L19 20L19 4L9 4L9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 20L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 16L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 12L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 8L5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Bayesian Analysis
      </BayesianTitle>
      
      {controlWarning.hasWarning && (
        <WarningBanner severity={controlWarning.severity}>
          Control group: {controlWarning.message} Bayesian results may be less reliable.
        </WarningBanner>
      )}
      
      {testWarning.hasWarning && (
        <WarningBanner severity={testWarning.severity}>
          Test group: {testWarning.message} Bayesian results may be less reliable.
        </WarningBanner>
      )}
      
      <ProbabilityContainer>
        <ProbabilityValue probability={results.probabilityOfImprovement}>
          {(results.probabilityOfImprovement * 100).toFixed(1)}%
        </ProbabilityValue>
        <ProbabilityCaption>
          Probability that Variant {test.type} outperforms Variant {control.type}
        </ProbabilityCaption>
        
        <ProbabilityMeter>
          <ProbabilityFill probability={results.probabilityOfImprovement} />
        </ProbabilityMeter>
        
        <ProbabilityScale>
          <span>50% (Coin flip)</span>
          <span>90% (Strong evidence)</span>
          <span>99% (Very strong)</span>
        </ProbabilityScale>
      </ProbabilityContainer>
      
      <GridContainer>
        <MetricCard>
          <MetricTitle>Expected Uplift</MetricTitle>
          <MetricValue>{results.expectedLift.toFixed(2)}%</MetricValue>
          <MetricSubValue>
            The average expected improvement based on posterior distribution
          </MetricSubValue>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>95% Credible Interval</MetricTitle>
          <MetricValue>{results.ci95Low.toFixed(2)}% to {results.ci95High.toFixed(2)}%</MetricValue>
          <CredibleIntervalBar>
            <CredibleIntervalFill 
              low={results.ci95Low} 
              high={results.ci95High} 
              base={scaleBase} 
            />
            <CredibleIntervalMarker position={0} base={scaleBase} />
            <CredibleIntervalMarker position={results.expectedLift} base={scaleBase} />
          </CredibleIntervalBar>
          <MetricSubValue>
            95% probability that the true uplift lies in this range
          </MetricSubValue>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Expected Loss</MetricTitle>
          <MetricValue>{results.expectedLoss.toFixed(4)}%</MetricValue>
          <MetricSubValue>
            Expected conversion loss if choosing variant {test.type} when {control.type} is better
          </MetricSubValue>
        </MetricCard>
      </GridContainer>
      
      <ThresholdTable>
        <ThresholdTitle>Probability of Improvement by Threshold</ThresholdTitle>
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>Threshold</th>
                <th>Probability</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {results.probabilityOfBeatingBaseline.map((probability: number, index: number) => (
                <tr key={index}>
                  <td>{getThresholdLabel(index === 0 ? 0 : [0.01, 0.02, 0.05, 0.1][index-1], index)}</td>
                  <td>{(probability * 100).toFixed(1)}%</td>
                  <td>
                    {probability >= 0.95 ? 'Very strong evidence' : 
                     probability >= 0.9 ? 'Strong evidence' : 
                     probability >= 0.8 ? 'Moderate evidence' : 
                     probability >= 0.7 ? 'Weak evidence' : 'Inconclusive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      </ThresholdTable>
    </BayesianContainer>
  );
};

export default BayesianAnalysis; 