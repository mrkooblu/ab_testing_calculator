import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ABTestFormData, VariantKey } from '../../types';
import { analyzeSequentialTest, calculateSequentialSampleSize } from '../../utils/sequentialTesting';

// Props for the Sequential Testing component
interface SequentialTestingProps {
  testData: ABTestFormData;
  controlKey: VariantKey;
  testKey: VariantKey;
}

// Animation for fade-in effect
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease forwards;
`;

const SequentialTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SequentialDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const StatusContainer = styled.div<{ isConclusive: boolean }>`
  background-color: ${({ theme, isConclusive }) => 
    isConclusive ? theme.colors.success + '20' : theme.colors.info + '20'};
  border-left: 4px solid ${({ theme, isConclusive }) => 
    isConclusive ? theme.colors.success : theme.colors.info};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatusTitle = styled.h4<{ isConclusive: boolean }>`
  color: ${({ theme, isConclusive }) => 
    isConclusive ? theme.colors.success : theme.colors.info};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatusText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const BoundariesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const BoundaryCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const BoundaryLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BoundaryValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LookCounter = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InputLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InputField = styled.input`
  width: 80px;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const SelectField = styled.select`
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

/**
 * Sequential Testing component that allows monitoring A/B tests over time
 * with interim analyses and early stopping decisions
 */
export const SequentialTesting: React.FC<SequentialTestingProps> = ({ 
  testData, 
  controlKey, 
  testKey 
}) => {
  // Get variant data
  const controlVariant = testData.variants[controlKey];
  const testVariant = testData.variants[testKey];
  
  // Settings for sequential monitoring
  const [currentLook, setCurrentLook] = useState(1);
  const [numInterimAnalyses, setNumInterimAnalyses] = useState(5);
  const [alphaBoundaryType, setAlphaBoundaryType] = useState<'pocock' | 'obrien-fleming'>('obrien-fleming');
  const [betaBoundaryType, setBetaBoundaryType] = useState<'pocock' | 'obrien-fleming'>('pocock');
  
  // Analyze sequential test
  const sequentialStatus = analyzeSequentialTest(
    controlVariant.visitors,
    controlVariant.conversions,
    testVariant.visitors,
    testVariant.conversions,
    currentLook,
    {
      alphaBoundaryType,
      betaBoundaryType,
      numInterimAnalyses,
      alpha: 0.05,
      beta: 0.2,
    }
  );
  
  // Sample size recommendation
  const baseRate = controlVariant.conversionRate / 100; // Convert to proportion
  const mde = Math.abs(testVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate;
  const recommendedSampleSize = calculateSequentialSampleSize(
    baseRate,
    mde,
    numInterimAnalyses
  );
  
  // Get status messages
  const getEfficacyMessage = () => {
    if (sequentialStatus.canStopForEfficacy) {
      return "Based on current data, you can stop the test and conclude a significant difference exists.";
    }
    return "Continue testing to gather more evidence for a significant difference.";
  };
  
  const getFutilityMessage = () => {
    if (sequentialStatus.canStopForFutility) {
      return "Based on current data, you can stop the test as it's unlikely to reach significance.";
    }
    return "Continue testing as there's still a reasonable chance to detect an effect.";
  };
  
  return (
    <SequentialContainer>
      <SequentialTitle>Sequential Testing Monitor</SequentialTitle>
      
      <SequentialDescription>
        Sequential testing allows you to monitor your A/B test as data accumulates, with the option to stop 
        early when sufficient evidence is collected. This approach can save resources while maintaining 
        statistical integrity.
      </SequentialDescription>
      
      <InputContainer>
        <InputLabel>Current look:</InputLabel>
        <InputField
          type="number"
          min="1"
          max={numInterimAnalyses}
          value={currentLook}
          onChange={(e) => setCurrentLook(Math.min(parseInt(e.target.value) || 1, numInterimAnalyses))}
        />
        
        <InputLabel>Total planned looks:</InputLabel>
        <InputField
          type="number"
          min="2"
          max="10"
          value={numInterimAnalyses}
          onChange={(e) => {
            const newValue = parseInt(e.target.value) || 2;
            setNumInterimAnalyses(newValue);
            setCurrentLook(Math.min(currentLook, newValue));
          }}
        />
        
        <InputLabel>Alpha spending function:</InputLabel>
        <SelectField 
          value={alphaBoundaryType}
          onChange={(e) => setAlphaBoundaryType(e.target.value as 'pocock' | 'obrien-fleming')}
        >
          <option value="obrien-fleming">O'Brien-Fleming (conservative early)</option>
          <option value="pocock">Pocock (equal across looks)</option>
        </SelectField>
      </InputContainer>
      
      <LookCounter>
        Look {currentLook} of {numInterimAnalyses}
        <span>Information fraction: {(currentLook / numInterimAnalyses * 100).toFixed(0)}%</span>
      </LookCounter>
      
      <StatusContainer isConclusive={sequentialStatus.isConclusive}>
        <StatusTitle isConclusive={sequentialStatus.isConclusive}>
          {sequentialStatus.isConclusive ? 'Decision Ready' : 'Continue Testing'}
        </StatusTitle>
        <StatusText>
          {sequentialStatus.canStopForEfficacy && 'Efficacy boundary crossed. You can stop the test and declare a significant result.'}
          {sequentialStatus.canStopForFutility && 'Futility boundary crossed. You can stop the test for lack of effect.'}
          {!sequentialStatus.isConclusive && 'Neither efficacy nor futility boundaries have been crossed. Continue testing.'}
        </StatusText>
      </StatusContainer>
      
      <BoundariesContainer>
        <BoundaryCard>
          <BoundaryLabel>P-value</BoundaryLabel>
          <BoundaryValue>{sequentialStatus.pValue.toFixed(4)}</BoundaryValue>
        </BoundaryCard>
        
        <BoundaryCard>
          <BoundaryLabel>Efficacy Boundary (alpha)</BoundaryLabel>
          <BoundaryValue>{sequentialStatus.alphaBoundary.toFixed(4)}</BoundaryValue>
        </BoundaryCard>
        
        <BoundaryCard>
          <BoundaryLabel>Futility Boundary (beta)</BoundaryLabel>
          <BoundaryValue>{sequentialStatus.betaBoundary.toFixed(4)}</BoundaryValue>
        </BoundaryCard>
        
        <BoundaryCard>
          <BoundaryLabel>Statistical Power</BoundaryLabel>
          <BoundaryValue>{sequentialStatus.power.toFixed(1)}%</BoundaryValue>
        </BoundaryCard>
      </BoundariesContainer>
      
      <BoundariesContainer>
        <BoundaryCard>
          <BoundaryLabel>Recommended sample size per group per look</BoundaryLabel>
          <BoundaryValue>{recommendedSampleSize}</BoundaryValue>
        </BoundaryCard>
      </BoundariesContainer>
    </SequentialContainer>
  );
}; 