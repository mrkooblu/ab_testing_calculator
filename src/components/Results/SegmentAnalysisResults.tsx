import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ABTestFormData, VariantKey } from '../../types';
import { Segment } from '../Form/SegmentationPanel';
import { calculatePValue, calculateZScore } from '../../utils/statistics';

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

/**
 * Component to display segmentation analysis results
 */
export const SegmentAnalysisResults: React.FC<SegmentAnalysisResultsProps> = ({
  testData,
  segments,
  controlKey,
  testKey,
}) => {
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
      };
    }
    
    // Calculate rates
    const controlRate = (controlData.conversions / controlData.visitors) * 100;
    const testRate = (testData.conversions / testData.visitors) * 100;
    
    // Calculate p-value
    const pValue = calculatePValue(
      controlData.visitors,
      controlData.conversions,
      testData.visitors,
      testData.conversions
    );
    
    // Calculate relative uplift
    const uplift = ((testRate - controlRate) / controlRate) * 100;
    
    // Check if significant at 95% confidence
    const isSignificant = pValue < 0.05;
    
    return {
      segment,
      controlRate,
      testRate,
      pValue,
      uplift,
      isSignificant,
    };
  });
  
  // Overall test data for comparison
  const overallControlVariant = testData.variants[controlKey];
  const overallTestVariant = testData.variants[testKey];
  const overallControlRate = overallControlVariant.conversionRate;
  const overallTestRate = overallTestVariant.conversionRate;
  const overallPValue = calculatePValue(
    overallControlVariant.visitors,
    overallControlVariant.conversions,
    overallTestVariant.visitors,
    overallTestVariant.conversions
  );
  const overallUplift = ((overallTestRate - overallControlRate) / overallControlRate) * 100;
  const overallIsSignificant = overallPValue < 0.05;
  
  return (
    <Container>
      <Title>Segment Analysis Results</Title>
      
      <Description>
        Comparing test results across different user segments can reveal hidden insights.
        Segments with different behavior patterns may respond differently to the same variation.
      </Description>
      
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
                  <TableCell>{overallControlRate.toFixed(2)}%</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>Baseline</TableCell>
                </tr>
                <tr>
                  <TableCell>Test ({testKey})</TableCell>
                  <TableCell>{overallTestVariant.visitors}</TableCell>
                  <TableCell>{overallTestVariant.conversions}</TableCell>
                  <TableCell>{overallTestRate.toFixed(2)}%</TableCell>
                  <TableCell>
                    <UpliftValue isPositive={overallUplift >= 0}>
                      {overallUplift >= 0 ? '↑' : '↓'}{Math.abs(overallUplift).toFixed(2)}%
                    </UpliftValue>
                  </TableCell>
                  <TableCell>{overallPValue.toFixed(4)}</TableCell>
                  <TableCell>
                    <SignificanceBadge isSignificant={overallIsSignificant}>
                      {overallIsSignificant ? 'Significant' : 'Not Significant'}
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
                      <TableCell>{result.controlRate.toFixed(2)}%</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>Baseline</TableCell>
                    </tr>
                    <tr>
                      <TableCell>Test ({testKey})</TableCell>
                      <TableCell>{result.segment.variants[testKey]?.visitors || 0}</TableCell>
                      <TableCell>{result.segment.variants[testKey]?.conversions || 0}</TableCell>
                      <TableCell>{result.testRate.toFixed(2)}%</TableCell>
                      <TableCell>
                        <UpliftValue isPositive={result.uplift >= 0}>
                          {result.uplift >= 0 ? '↑' : '↓'}{Math.abs(result.uplift).toFixed(2)}%
                        </UpliftValue>
                      </TableCell>
                      <TableCell>{result.pValue.toFixed(4)}</TableCell>
                      <TableCell>
                        <SignificanceBadge isSignificant={result.isSignificant}>
                          {result.isSignificant ? 'Significant' : 'Not Significant'}
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
    </Container>
  );
}; 