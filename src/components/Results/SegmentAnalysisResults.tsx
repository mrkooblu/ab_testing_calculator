import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ABTestFormData, VariantKey } from '../../types';
import { Segment } from '../Form/SegmentationPanel';
import { 
  calculatePValueFromCounts, 
  calculateZScore, 
  checkSampleSizeWarning,
  calculateConfidenceInterval
} from '../../utils/statistics';

interface SegmentAnalysisResultsProps {
  testData: ABTestFormData;
  segments: Segment[];
  controlKey: VariantKey;
  testKey: VariantKey;
}

// Animation for fade-in effect
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease forwards;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.5;
`;

const SegmentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SegmentCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

const SegmentHeader = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SegmentName = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const SegmentDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SignificanceBadge = styled.span<{ isSignificant: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: white;
  background-color: ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.info};
`;

const UpliftValue = styled.span<{ isPositive: boolean }>`
  color: ${({ theme, isPositive }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
`;

const NoSegmentsMessage = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
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
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ConfidenceInterval = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: block;
  margin-top: 2px;
`;

const MultipleComparisonNote = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

/**
 * Component to display segmentation analysis results
 */
export const SegmentAnalysisResults: React.FC<SegmentAnalysisResultsProps> = ({
  testData,
  segments,
  controlKey,
  testKey,
}) => {
  // Determine total number of comparisons for Bonferroni correction
  // Add 1 for the overall comparison
  const numComparisons = segments.filter(segment => {
    const controlData = segment.variants[controlKey];
    const testData = segment.variants[testKey];
    return (controlData && testData && controlData.visitors > 0 && testData.visitors > 0);
  }).length + 1;
  
  // Bonferroni corrected significance level
  const correctedAlpha = 0.05 / numComparisons;
  
  // Calculate conversion rates and p-values for each segment
  const segmentResults = segments.map(segment => {
    const controlData = segment.variants[controlKey];
    const testData = segment.variants[testKey];
    
    // Skip if no data
    if (!controlData || !testData || controlData.visitors === 0 || testData.visitors === 0) {
      return {
        segment,
        controlRate: 0,
        testRate: 0,
        pValue: 1,
        uplift: 0,
        isSignificant: false,
        isSignificantWithCorrection: false,
        controlWarning: { hasWarning: false, message: '', severity: 'low' as const },
        testWarning: { hasWarning: false, message: '', severity: 'low' as const },
        controlConfidenceInterval: { lower: 0, upper: 0 },
        testConfidenceInterval: { lower: 0, upper: 0 },
        deltaConfidenceInterval: { lower: 0, upper: 0 }
      };
    }
    
    // Calculate rates
    const controlRate = (controlData.conversions / controlData.visitors) * 100;
    const testRate = (testData.conversions / testData.visitors) * 100;
    
    // Calculate p-value
    const pValue = calculatePValueFromCounts(
      controlData.visitors,
      controlData.conversions,
      testData.visitors,
      testData.conversions
    );
    
    // Calculate relative uplift
    const uplift = ((testRate - controlRate) / controlRate) * 100;
    
    // Check if significant with standard and corrected alpha levels
    const isSignificant = pValue < 0.05;
    const isSignificantWithCorrection = pValue < correctedAlpha;
    
    // Check for sample size warnings
    const controlWarning = checkSampleSizeWarning(controlData.visitors, controlData.conversions);
    const testWarning = checkSampleSizeWarning(testData.visitors, testData.conversions);
    
    // Calculate confidence intervals (95%)
    const controlConfidenceInterval = calculateConfidenceInterval(
      controlData.visitors, 
      controlData.conversions
    );
    
    const testConfidenceInterval = calculateConfidenceInterval(
      testData.visitors, 
      testData.conversions
    );
    
    // Calculate confidence interval for the difference (approximate method)
    // Using the normal approximation for the difference of proportions
    const p1 = controlData.conversions / controlData.visitors;
    const p2 = testData.conversions / testData.visitors;
    const se = Math.sqrt(p1 * (1-p1) / controlData.visitors + p2 * (1-p2) / testData.visitors);
    const z = 1.96; // 95% confidence
    const deltaLower = ((p2 - p1) - z * se) * 100;
    const deltaUpper = ((p2 - p1) + z * se) * 100;
    
    const deltaConfidenceInterval = {
      lower: deltaLower,
      upper: deltaUpper
    };
    
    return {
      segment,
      controlRate,
      testRate,
      pValue,
      uplift,
      isSignificant,
      isSignificantWithCorrection,
      controlWarning,
      testWarning,
      controlConfidenceInterval,
      testConfidenceInterval,
      deltaConfidenceInterval
    };
  });
  
  // Overall test data for comparison
  const overallControlVariant = testData.variants[controlKey];
  const overallTestVariant = testData.variants[testKey];
  const overallControlRate = overallControlVariant.conversionRate;
  const overallTestRate = overallTestVariant.conversionRate;
  
  const overallPValue = calculatePValueFromCounts(
    overallControlVariant.visitors,
    overallControlVariant.conversions,
    overallTestVariant.visitors,
    overallTestVariant.conversions
  );
  
  const overallUplift = ((overallTestRate - overallControlRate) / overallControlRate) * 100;
  const overallIsSignificant = overallPValue < 0.05;
  const overallIsSignificantWithCorrection = overallPValue < correctedAlpha;
  
  // Check for sample size warnings
  const overallControlWarning = checkSampleSizeWarning(
    overallControlVariant.visitors, 
    overallControlVariant.conversions
  );
  
  const overallTestWarning = checkSampleSizeWarning(
    overallTestVariant.visitors, 
    overallTestVariant.conversions
  );
  
  // Calculate overall confidence intervals
  const overallControlCI = calculateConfidenceInterval(
    overallControlVariant.visitors, 
    overallControlVariant.conversions
  );
  
  const overallTestCI = calculateConfidenceInterval(
    overallTestVariant.visitors, 
    overallTestVariant.conversions
  );
  
  // Calculate confidence interval for overall difference
  const p1Overall = overallControlVariant.conversions / overallControlVariant.visitors;
  const p2Overall = overallTestVariant.conversions / overallTestVariant.visitors;
  const seOverall = Math.sqrt(
    p1Overall * (1-p1Overall) / overallControlVariant.visitors + 
    p2Overall * (1-p2Overall) / overallTestVariant.visitors
  );
  const deltaLowerOverall = ((p2Overall - p1Overall) - 1.96 * seOverall) * 100;
  const deltaUpperOverall = ((p2Overall - p1Overall) + 1.96 * seOverall) * 100;
  
  const overallDeltaCI = {
    lower: deltaLowerOverall,
    upper: deltaUpperOverall
  };
  
  return (
    <Container>
      <Title>Segment Analysis Results</Title>
      
      <Description>
        Comparing test results across different user segments can reveal hidden insights.
        Segments with different behavior patterns may respond differently to the same variation.
      </Description>
      
      {numComparisons > 1 && (
        <MultipleComparisonNote>
          Note: When analyzing multiple segments ({numComparisons} comparisons), a Bonferroni-corrected p-value threshold of {correctedAlpha.toFixed(5)} is used to determine statistical significance with correction.
        </MultipleComparisonNote>
      )}
      
      {segments.length === 0 ? (
        <NoSegmentsMessage>
          No segments have been defined. Add segments in the test form to see segment analysis results.
        </NoSegmentsMessage>
      ) : (
        <SegmentList>
          {/* Overall results first */}
          <SegmentCard>
            <SegmentHeader>
              <SegmentName>Overall Results (All Users)</SegmentName>
              <SegmentDescription>
                All users included in the test, regardless of segment
              </SegmentDescription>
            </SegmentHeader>
            
            {overallControlWarning.hasWarning && (
              <WarningBanner severity={overallControlWarning.severity}>
                Control: {overallControlWarning.message}
              </WarningBanner>
            )}
            
            {overallTestWarning.hasWarning && (
              <WarningBanner severity={overallTestWarning.severity}>
                Test: {overallTestWarning.message}
              </WarningBanner>
            )}
            
            <ResultsTable>
              <thead>
                <tr>
                  <TableHeader>Variant</TableHeader>
                  <TableHeader>Visitors</TableHeader>
                  <TableHeader>Conversions</TableHeader>
                  <TableHeader>Rate</TableHeader>
                  <TableHeader>Uplift</TableHeader>
                  <TableHeader>P-value</TableHeader>
                  <TableHeader>Result</TableHeader>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TableCell>Control ({controlKey})</TableCell>
                  <TableCell>{overallControlVariant.visitors}</TableCell>
                  <TableCell>{overallControlVariant.conversions}</TableCell>
                  <TableCell>
                    {overallControlRate.toFixed(2)}%
                    <ConfidenceInterval>
                      CI: [{overallControlCI.lower.toFixed(2)}%, {overallControlCI.upper.toFixed(2)}%]
                    </ConfidenceInterval>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Baseline</TableCell>
                </tr>
                <tr>
                  <TableCell>Test ({testKey})</TableCell>
                  <TableCell>{overallTestVariant.visitors}</TableCell>
                  <TableCell>{overallTestVariant.conversions}</TableCell>
                  <TableCell>
                    {overallTestRate.toFixed(2)}%
                    <ConfidenceInterval>
                      CI: [{overallTestCI.lower.toFixed(2)}%, {overallTestCI.upper.toFixed(2)}%]
                    </ConfidenceInterval>
                  </TableCell>
                  <TableCell>
                    <UpliftValue isPositive={overallUplift >= 0}>
                      {overallUplift >= 0 ? '↑' : '↓'}{Math.abs(overallUplift).toFixed(2)}%
                    </UpliftValue>
                    <ConfidenceInterval>
                      CI: [{overallDeltaCI.lower.toFixed(2)}%, {overallDeltaCI.upper.toFixed(2)}%]
                    </ConfidenceInterval>
                  </TableCell>
                  <TableCell>{overallPValue.toFixed(4)}</TableCell>
                  <TableCell>
                    <SignificanceBadge isSignificant={overallIsSignificantWithCorrection}>
                      {overallIsSignificantWithCorrection 
                        ? 'Significant*' 
                        : overallIsSignificant 
                          ? 'Significant (uncorrected)' 
                          : 'Not Significant'}
                    </SignificanceBadge>
                  </TableCell>
                </tr>
              </tbody>
            </ResultsTable>
          </SegmentCard>
          
          {/* Segment results */}
          {segmentResults.map(result => {
            // Skip segments with missing data
            if (result.controlRate === 0 && result.testRate === 0) {
              return null;
            }
            
            return (
              <SegmentCard key={result.segment.id}>
                <SegmentHeader>
                  <SegmentName>{result.segment.name}</SegmentName>
                  {result.segment.description && (
                    <SegmentDescription>{result.segment.description}</SegmentDescription>
                  )}
                </SegmentHeader>
                
                {result.controlWarning.hasWarning && (
                  <WarningBanner severity={result.controlWarning.severity}>
                    Control: {result.controlWarning.message}
                  </WarningBanner>
                )}
                
                {result.testWarning.hasWarning && (
                  <WarningBanner severity={result.testWarning.severity}>
                    Test: {result.testWarning.message}
                  </WarningBanner>
                )}
                
                <ResultsTable>
                  <thead>
                    <tr>
                      <TableHeader>Variant</TableHeader>
                      <TableHeader>Visitors</TableHeader>
                      <TableHeader>Conversions</TableHeader>
                      <TableHeader>Rate</TableHeader>
                      <TableHeader>Uplift</TableHeader>
                      <TableHeader>P-value</TableHeader>
                      <TableHeader>Result</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <TableCell>Control ({controlKey})</TableCell>
                      <TableCell>{result.segment.variants[controlKey]?.visitors || 0}</TableCell>
                      <TableCell>{result.segment.variants[controlKey]?.conversions || 0}</TableCell>
                      <TableCell>
                        {result.controlRate.toFixed(2)}%
                        <ConfidenceInterval>
                          CI: [{result.controlConfidenceInterval.lower.toFixed(2)}%, {result.controlConfidenceInterval.upper.toFixed(2)}%]
                        </ConfidenceInterval>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>Baseline</TableCell>
                    </tr>
                    <tr>
                      <TableCell>Test ({testKey})</TableCell>
                      <TableCell>{result.segment.variants[testKey]?.visitors || 0}</TableCell>
                      <TableCell>{result.segment.variants[testKey]?.conversions || 0}</TableCell>
                      <TableCell>
                        {result.testRate.toFixed(2)}%
                        <ConfidenceInterval>
                          CI: [{result.testConfidenceInterval.lower.toFixed(2)}%, {result.testConfidenceInterval.upper.toFixed(2)}%]
                        </ConfidenceInterval>
                      </TableCell>
                      <TableCell>
                        <UpliftValue isPositive={result.uplift >= 0}>
                          {result.uplift >= 0 ? '↑' : '↓'}{Math.abs(result.uplift).toFixed(2)}%
                        </UpliftValue>
                        <ConfidenceInterval>
                          CI: [{result.deltaConfidenceInterval.lower.toFixed(2)}%, {result.deltaConfidenceInterval.upper.toFixed(2)}%]
                        </ConfidenceInterval>
                      </TableCell>
                      <TableCell>{result.pValue.toFixed(4)}</TableCell>
                      <TableCell>
                        <SignificanceBadge isSignificant={result.isSignificantWithCorrection}>
                          {result.isSignificantWithCorrection 
                            ? 'Significant*' 
                            : result.isSignificant 
                              ? 'Significant (uncorrected)' 
                              : 'Not Significant'}
                        </SignificanceBadge>
                      </TableCell>
                    </tr>
                  </tbody>
                </ResultsTable>
              </SegmentCard>
            );
          })}
        </SegmentList>
      )}
      
      {numComparisons > 1 && (
        <MultipleComparisonNote>
          * Significant after Bonferroni correction for {numComparisons} comparisons (p &lt; {correctedAlpha.toFixed(5)})
        </MultipleComparisonNote>
      )}
    </Container>
  );
}; 