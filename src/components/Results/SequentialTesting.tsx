import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ABTestFormData, VariantKey } from '../../types';
import { analyzeSequentialTest, calculateSequentialSampleSize } from '../../utils/sequentialTesting';
import { checkSampleSizeWarning, calculateConfidenceInterval } from '../../utils/statistics';

// Props for the Sequential Testing component
interface SequentialTestingProps {
  testData: ABTestFormData;
  controlKey: VariantKey;
  testKey: VariantKey;
}

// Animation for fade-in
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const SequentialContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: ${fadeIn} 0.5s ease forwards;
`;

const SequentialTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SequentialDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.5;
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

const ConfidenceInterval = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: block;
  margin-top: 2px;
`;

const LookInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SequentialInput = styled.input`
  width: 80px;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SequentialSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  background-color: ${({ theme }) => theme.colors.background};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DataCard = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CardValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CardSubValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StatusContainer = styled.div<{ isConclusive: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, isConclusive }) => 
    isConclusive ? `${theme.colors.success}15` : `${theme.colors.info}15`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatusTitle = styled.div<{ isConclusive: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, isConclusive }) => 
    isConclusive ? theme.colors.success : theme.colors.info};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatusDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BoundaryContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const BoundaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const BoundaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BoundaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BoundaryValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

/**
 * Sequential Testing component that allows monitoring A/B tests over time
 */
export const SequentialTesting: React.FC<SequentialTestingProps> = ({
  testData,
  controlKey,
  testKey,
}) => {
  // State for the current look (number of times data has been analyzed)
  const [currentLook, setCurrentLook] = useState<number>(1);
  const [totalLooks, setTotalLooks] = useState<number>(5);
  const [boundaryType, setBoundaryType] = useState<'pocock' | 'obrien-fleming'>('obrien-fleming');
  
  const control = testData.variants[controlKey];
  const test = testData.variants[testKey];
  
  // Check sample size warnings
  const controlWarning = checkSampleSizeWarning(control.visitors, control.conversions);
  const testWarning = checkSampleSizeWarning(test.visitors, test.conversions);
  
  // Settings for sequential monitoring
  const options = {
    alphaBoundaryType: boundaryType,
    betaBoundaryType: boundaryType,
    numInterimAnalyses: totalLooks,
    alpha: 0.05,
    beta: 0.2
  };
  
  // Analyze sequential test
  const sequentialStatus = analyzeSequentialTest(
    control.visitors,
    control.conversions,
    test.visitors,
    test.conversions,
    currentLook,
    options
  );
  
  // Calculate confidence intervals
  const controlCI = calculateConfidenceInterval(control.visitors, control.conversions);
  const testCI = calculateConfidenceInterval(test.visitors, test.conversions);
  
  // Calculate confidence interval for the difference
  const controlRate = control.conversions / control.visitors;
  const testRate = test.conversions / test.visitors;
  const se = Math.sqrt(
    controlRate * (1-controlRate) / control.visitors + 
    testRate * (1-testRate) / test.visitors
  );
  const deltaLower = ((testRate - controlRate) - 1.96 * se) * 100;
  const deltaUpper = ((testRate - controlRate) + 1.96 * se) * 100;
  
  const deltaCI = {
    lower: deltaLower,
    upper: deltaUpper
  };
  
  // Calculate recommended sample size
  const recommendedSampleSize = calculateSequentialSampleSize(
    control.conversionRate,
    10, // Assuming 10% minimum detectable effect
    totalLooks,
    0.05,
    0.8,
    boundaryType
  );
  
  // Determine test status message
  let statusMessage = '';
  if (sequentialStatus.canStopForEfficacy) {
    statusMessage = 'Efficacy boundary crossed. You can stop the test and declare a significant result.';
  } else if (sequentialStatus.canStopForFutility) {
    statusMessage = 'Futility boundary crossed. You can stop the test for lack of effect.';
  } else {
    statusMessage = 'Neither efficacy nor futility boundaries have been crossed. Continue testing.';
  }
  
  return (
    <SequentialContainer>
      <SequentialTitle>Sequential Testing Monitor</SequentialTitle>
      
      <SequentialDescription>
        Sequential testing allows you to monitor your A/B test as data accumulates, with the option to stop
        early when results are conclusive. This helps maximize efficiency while controlling error rates.
      </SequentialDescription>
      
      {(controlWarning.hasWarning || testWarning.hasWarning) && (
        <WarningBanner severity={
          controlWarning.severity === 'high' || testWarning.severity === 'high' ? 'high' :
          controlWarning.severity === 'medium' || testWarning.severity === 'medium' ? 'medium' : 'low'
        }>
          {controlWarning.hasWarning && `Control group: ${controlWarning.message} `}
          {testWarning.hasWarning && `Test group: ${testWarning.message} `}
          Sequential testing results may be less reliable with small sample sizes.
        </WarningBanner>
      )}
      
      <LookInputContainer>
        <div>
          <Label htmlFor="currentLook">Current look:</Label>
          <SequentialInput 
            id="currentLook"
            type="number"
            min="1"
            max={totalLooks}
            value={currentLook}
            onChange={(e) => setCurrentLook(Math.min(totalLooks, Math.max(1, parseInt(e.target.value) || 1)))}
          />
        </div>
        
        <div>
          <Label htmlFor="totalLooks">Total planned looks:</Label>
          <SequentialInput 
            id="totalLooks"
            type="number"
            min="2"
            max="10"
            value={totalLooks}
            onChange={(e) => {
              const newValue = Math.max(2, parseInt(e.target.value) || 2);
              setTotalLooks(newValue);
              setCurrentLook(Math.min(currentLook, newValue));
            }}
          />
        </div>
        
        <div>
          <Label htmlFor="boundaryType">Boundary type:</Label>
          <SequentialSelect 
            id="boundaryType"
            value={boundaryType}
            onChange={(e) => setBoundaryType(e.target.value as 'pocock' | 'obrien-fleming')}
          >
            <option value="obrien-fleming">O'Brien-Fleming (Conservative early)</option>
            <option value="pocock">Pocock (Constant threshold)</option>
          </SequentialSelect>
        </div>
      </LookInputContainer>
      
      <Grid>
        <DataCard>
          <CardTitle>Control Variant ({controlKey})</CardTitle>
          <CardValue>{control.visitors} visitors, {control.conversions} conv.</CardValue>
          <CardSubValue>
            Rate: {control.conversionRate.toFixed(2)}%
            <ConfidenceInterval>
              CI: [{controlCI.lower.toFixed(2)}%, {controlCI.upper.toFixed(2)}%]
            </ConfidenceInterval>
          </CardSubValue>
        </DataCard>
        
        <DataCard>
          <CardTitle>Test Variant ({testKey})</CardTitle>
          <CardValue>{test.visitors} visitors, {test.conversions} conv.</CardValue>
          <CardSubValue>
            Rate: {test.conversionRate.toFixed(2)}%
            <ConfidenceInterval>
              CI: [{testCI.lower.toFixed(2)}%, {testCI.upper.toFixed(2)}%]
            </ConfidenceInterval>
          </CardSubValue>
        </DataCard>
        
        <DataCard>
          <CardTitle>Absolute Difference</CardTitle>
          <CardValue>{(test.conversionRate - control.conversionRate).toFixed(2)}%</CardValue>
          <CardSubValue>
            <ConfidenceInterval>
              CI: [{deltaCI.lower.toFixed(2)}%, {deltaCI.upper.toFixed(2)}%]
            </ConfidenceInterval>
          </CardSubValue>
        </DataCard>
        
        <DataCard>
          <CardTitle>Recommended Sample Size</CardTitle>
          <CardValue>{recommendedSampleSize} per variant</CardValue>
          <CardSubValue>Per interim analysis (look)</CardSubValue>
        </DataCard>
      </Grid>
      
      <StatusContainer isConclusive={sequentialStatus.isConclusive}>
        <StatusTitle isConclusive={sequentialStatus.isConclusive}>
          {sequentialStatus.isConclusive ? 'Decision Ready' : 'Continue Testing'}
        </StatusTitle>
        <StatusDescription>
          {statusMessage}
        </StatusDescription>
        
        <BoundaryContainer>
          <BoundaryGrid>
            <BoundaryItem>
              <BoundaryLabel>Current P-value:</BoundaryLabel>
              <BoundaryValue>{sequentialStatus.pValue.toFixed(4)}</BoundaryValue>
            </BoundaryItem>
            
            <BoundaryItem>
              <BoundaryLabel>Efficacy boundary:</BoundaryLabel>
              <BoundaryValue>{sequentialStatus.alphaBoundary.toFixed(4)}</BoundaryValue>
            </BoundaryItem>
            
            <BoundaryItem>
              <BoundaryLabel>Futility boundary:</BoundaryLabel>
              <BoundaryValue>{sequentialStatus.betaBoundary.toFixed(4)}</BoundaryValue>
            </BoundaryItem>
            
            <BoundaryItem>
              <BoundaryLabel>Current power:</BoundaryLabel>
              <BoundaryValue>{sequentialStatus.power.toFixed(1)}%</BoundaryValue>
            </BoundaryItem>
          </BoundaryGrid>
        </BoundaryContainer>
      </StatusContainer>
      
      <SequentialDescription>
        <strong>Note:</strong> Sequential testing allows for early stopping while controlling Type I error. The
        O'Brien-Fleming boundary is more conservative early in the test, while Pocock boundaries use a constant
        threshold across all looks.
      </SequentialDescription>
    </SequentialContainer>
  );
}; 