import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { VariantKey, VariantType, ABTestFormData, VariantComparison } from '../../types';
import {
  calculateRelativeUplift,
  calculateStandardError,
  calculateStandardErrorDiff,
  calculateZScore,
  calculatePValue,
  calculatePower,
  isSignificant,
} from '../../utils/statsCalculator';
import ConfidenceVisualization from './ConfidenceVisualization';
import TestStrengthMeter from './TestStrengthMeter';
import ResultsDashboard from './ResultsDashboard';
import ShareButton from '../common/ShareButton';
import AutomatedInsights from './AutomatedInsights';
import BayesianAnalysis from './BayesianAnalysis';
import { SequentialTesting } from './SequentialTesting';
import { SegmentAnalysisResults } from './SegmentAnalysisResults';
import { Segment } from '../Form/SegmentationPanel';

// Define keyframe animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const highlightValue = keyframes`
  0% {
    background-color: rgba(67, 97, 238, 0);
  }
  50% {
    background-color: rgba(67, 97, 238, 0.1);
  }
  100% {
    background-color: rgba(67, 97, 238, 0);
  }
`;

// Define a new type for analysis method options
type AnalysisMethod = 'frequentist' | 'bayesian' | 'sequential' | 'segmentation';

interface ResultsDisplayProps {
  data: ABTestFormData;
  isVisible: boolean;
  segments?: Segment[];
}

// Update styled components with animations
const ResultsContainer = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  animation: ${fadeIn} 0.5s ease-out;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => `0 ${theme.spacing.sm}`};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ResultsTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.surface : 'transparent'};
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : theme.colors.text.secondary};
  border: none;
  border-bottom: 2px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary : 'transparent'};
  font-weight: ${({ theme, isActive }) => 
    isActive ? theme.typography.fontWeight.semiBold : theme.typography.fontWeight.regular};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SummaryContainer = styled.div<{ isSignificant: boolean }>`
  background-color: ${({ theme, isSignificant }) => 
    isSignificant ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 87, 34, 0.1)'};
  border-left: 4px solid ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.sm}`};
  animation: ${scaleIn} 0.5s ease-out 0.2s both;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    margin: ${({ theme }) => `${theme.spacing.md} 0`};
  }
`;

const SummaryTitle = styled.h3<{ isSignificant: boolean }>`
  color: ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeIn} 0.5s ease-out 0.3s both;
`;

const SummaryText = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  animation: ${fadeIn} 0.5s ease-out 0.4s both;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.sm}`};
  animation: ${fadeIn} 0.5s ease-out 0.5s both;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    margin: ${({ theme }) => `${theme.spacing.lg} 0`};
  }
`;

const DetailsTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.sm}`};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.sm};
    margin: ${({ theme }) => `${theme.spacing.md} 0`};
  }
`;

const StatItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  animation: ${highlightValue} 1.5s ease-out 0.8s;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const VariantComparisonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.sm}`};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
    margin: ${({ theme }) => `${theme.spacing.md} 0`};
  }
`;

const VariantCard = styled.div<{ variantType: VariantType }>`
  background-color: ${({ theme, variantType }) => {
    switch(variantType) {
      case 'A': return 'rgba(67, 97, 238, 0.1)';
      case 'B': return 'rgba(247, 37, 133, 0.1)';
      case 'C': return 'rgba(114, 9, 183, 0.1)';
      case 'D': return 'rgba(58, 12, 163, 0.1)';
      default: return 'rgba(67, 97, 238, 0.1)';
    }
  }};
  border-left: 4px solid ${({ theme, variantType }) => {
    switch(variantType) {
      case 'A': return theme.colors.variantA;
      case 'B': return theme.colors.variantB;
      case 'C': return theme.colors.variantC;
      case 'D': return theme.colors.variantD;
      default: return theme.colors.variantA;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.5s ease-out 0.7s both;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const VariantTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const VariantStat = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
  
  span {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const getVariantTypeFromKey = (key: VariantKey): VariantType => {
  return key.charAt(key.length - 1) as VariantType;
};

// Add new styled components for the toggle switch
const AnalysisToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: ${({ theme }) => theme.spacing.lg} 0;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.background};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-weight: ${({ active }) => active ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  min-width: 120px;
  
  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  }
`;

// Add a styled component for the analysis method title
const AnalysisMethodTitle = styled.h3`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isVisible, segments = [] }) => {
  const { variants, settings } = data;
  
  // Track if this is a fresh display for animations
  const [isNewDisplay, setIsNewDisplay] = useState(false);
  // Add state for the analysis method
  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>('frequentist');

  useEffect(() => {
    if (isVisible) {
      setIsNewDisplay(true);
      // Reset the animation trigger after a delay
      const timer = setTimeout(() => {
        setIsNewDisplay(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, data]);

  // Get active variants (those with visitors > 0)
  const activeVariantKeys = Object.keys(variants).filter(
    key => variants[key as VariantKey].visitors > 0
  ) as VariantKey[];
  
  // Generate all possible comparisons with variant A as control
  const generateComparisons = (): VariantComparison[] => {
    const comparisons: VariantComparison[] = [];
    
    if (activeVariantKeys.length < 2) {
      return comparisons;
    }
    
    // Use first variant as control and compare against others
    const controlKey = activeVariantKeys[0];
    const controlType = variants[controlKey].type;
    
    for (let i = 1; i < activeVariantKeys.length; i++) {
      const testKey = activeVariantKeys[i];
      const testType = variants[testKey].type;
      
      const controlVariant = variants[controlKey];
      const testVariant = variants[testKey];
      
      // Calculate relative uplift
      const relativeUplift = calculateRelativeUplift(
        controlVariant.conversionRate,
        testVariant.conversionRate
      );
      
      // Calculate standard errors using raw counts
      const controlRate = controlVariant.conversions / controlVariant.visitors;
      const testRate = testVariant.conversions / testVariant.visitors;
      const pooledRate = (controlVariant.conversions + testVariant.conversions) / 
                        (controlVariant.visitors + testVariant.visitors);
      
      // Calculate standard error using pooled estimate
      const standardError = Math.sqrt(
        pooledRate * (1 - pooledRate) * 
        (1 / controlVariant.visitors + 1 / testVariant.visitors)
      );
      
      // Calculate Z-score using raw proportions
      const zScore = (testRate - controlRate) / standardError;
      
      // Calculate p-value
      const pValue = calculatePValue(zScore, settings.hypothesisType === 'two-sided');
      
      // Calculate power
      const alpha = (100 - settings.confidenceLevel) / 100;
      const power = calculatePower(
        controlVariant.visitors,
        testVariant.visitors,
        controlVariant.conversionRate,
        testVariant.conversionRate,
        alpha
      );
      
      // Determine if the result is significant
      const isSignificantResult = pValue < (alpha);
      
      // Determine which variant is better
      let betterVariant: VariantKey | null = null;
      if (testVariant.conversionRate > controlVariant.conversionRate) {
        betterVariant = testKey;
      } else if (controlVariant.conversionRate > testVariant.conversionRate) {
        betterVariant = controlKey;
      }
      
      comparisons.push({
        controlKey,
        testKey,
        controlType,
        testType,
        controlRate: controlVariant.conversionRate,
        testRate: testVariant.conversionRate,
        relativeUplift,
        zScore,
        pValue,
        power,
        isSignificant: isSignificantResult,
        betterVariant,
      });
    }
    
    return comparisons;
  };
  
  const comparisons = generateComparisons();
  const [activeComparison, setActiveComparison] = useState<{controlKey: VariantKey, testKey: VariantKey} | null>(
    comparisons.length > 0 ? { controlKey: comparisons[0].controlKey, testKey: comparisons[0].testKey } : null
  );
  
  if (comparisons.length === 0) {
    return null;
  }
  
  const currentComparison = comparisons.find(
    comp => comp.controlKey === activeComparison?.controlKey && comp.testKey === activeComparison?.testKey
  ) || comparisons[0];
  
  const {
    controlKey,
    testKey,
    controlType,
    testType,
    relativeUplift,
    zScore,
    pValue,
    power,
    isSignificant: isSignificantResult,
    betterVariant,
  } = currentComparison;
  
  const controlVariant = variants[controlKey];
  const testVariant = variants[testKey];
  
  const getConfidenceStatement = () => {
    if (!isSignificantResult) {
      return `You cannot be ${settings.confidenceLevel}% confident that there is a real difference between variants ${controlType} and ${testType}.`;
    }
    
    if (betterVariant === testKey) {
      return `You can be ${settings.confidenceLevel}% confident that variant ${testType} will perform better than variant ${controlType}.`;
    } else if (betterVariant === controlKey) {
      return `You can be ${settings.confidenceLevel}% confident that variant ${controlType} will perform better than variant ${testType}.`;
    }
    
    return '';
  };

  const handleSelectComparison = (controlKey: VariantKey, testKey: VariantKey) => {
    setActiveComparison({ controlKey, testKey });
  };

  return (
    <ResultsContainer isVisible={isVisible}>
      <ResultsHeader>
        <ResultsTitle>Test Results</ResultsTitle>
        <ShareButton testData={data} />
      </ResultsHeader>
      
      <ResultsDashboard
        variantData={variants}
        comparisons={comparisons}
        confidenceLevel={settings.confidenceLevel}
        activeComparison={activeComparison}
        onSelectComparison={handleSelectComparison}
      />
      
      <SummaryContainer isSignificant={isSignificantResult}>
        <SummaryTitle isSignificant={isSignificantResult}>
          {isSignificantResult ? 'Significant Result!' : 'Not Significant'}
        </SummaryTitle>
        
        <SummaryText>
          {betterVariant === testKey && 
            `Variant ${testType}'s conversion rate (${testVariant.conversionRate.toFixed(2)}%) was ${Math.abs(relativeUplift).toFixed(2)}% ${relativeUplift > 0 ? 'higher' : 'lower'} than variant ${controlType}'s conversion rate (${controlVariant.conversionRate.toFixed(2)}%).`
          }
          {betterVariant === controlKey && 
            `Variant ${controlType}'s conversion rate (${controlVariant.conversionRate.toFixed(2)}%) was ${Math.abs(relativeUplift).toFixed(2)}% ${relativeUplift < 0 ? 'higher' : 'lower'} than variant ${testType}'s conversion rate (${testVariant.conversionRate.toFixed(2)}%).`
          }
          {!betterVariant && 
            `Variant ${controlType}'s conversion rate (${controlVariant.conversionRate.toFixed(2)}%) and variant ${testType}'s conversion rate (${testVariant.conversionRate.toFixed(2)}%) are identical.`
          }
        </SummaryText>
        
        <SummaryText>
          {getConfidenceStatement()}
        </SummaryText>
      </SummaryContainer>
      
      <DetailsContainer>
        <AnalysisMethodTitle>Analysis Methods</AnalysisMethodTitle>
        <AnalysisToggleContainer>
          <ToggleButton 
            active={analysisMethod === 'frequentist'} 
            onClick={() => setAnalysisMethod('frequentist')}
          >
            Frequentist
          </ToggleButton>
          <ToggleButton 
            active={analysisMethod === 'bayesian'} 
            onClick={() => setAnalysisMethod('bayesian')}
          >
            Bayesian
          </ToggleButton>
          <ToggleButton 
            active={analysisMethod === 'sequential'} 
            onClick={() => setAnalysisMethod('sequential')}
          >
            Sequential
          </ToggleButton>
          <ToggleButton 
            active={analysisMethod === 'segmentation'} 
            onClick={() => setAnalysisMethod('segmentation')}
          >
            Segmentation
          </ToggleButton>
        </AnalysisToggleContainer>

        {analysisMethod === 'frequentist' && (
          <>
            <ConfidenceVisualization
              controlMean={controlVariant.conversionRate}
              controlStdDev={Math.sqrt(controlVariant.conversionRate * (100 - controlVariant.conversionRate) / controlVariant.visitors)}
              testMean={testVariant.conversionRate}
              testStdDev={Math.sqrt(testVariant.conversionRate * (100 - testVariant.conversionRate) / testVariant.visitors)}
              confidenceLevel={settings.confidenceLevel}
              isTwoSided={settings.hypothesisType === 'two-sided'}
              isSignificant={isSignificantResult}
              controlType={controlType}
              testType={testType}
            />
            
            <AutomatedInsights
              testData={data}
              controlKey={controlKey}
              testKey={testKey}
              pValue={pValue}
              relativeUplift={relativeUplift}
              isSignificant={isSignificantResult}
              power={power}
            />
            
            <StatsGrid>
              <StatItem>
                <StatLabel>P-value</StatLabel>
                <StatValue>{pValue.toFixed(4)}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Z-score</StatLabel>
                <StatValue>{Math.abs(zScore).toFixed(2)}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Statistical Power</StatLabel>
                <StatValue>{power.toFixed(2)}%</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Relative Uplift</StatLabel>
                <StatValue>{relativeUplift.toFixed(2)}%</StatValue>
              </StatItem>
            </StatsGrid>
            
            <TestStrengthMeter
              pValue={pValue}
              confidenceLevel={settings.confidenceLevel}
              isSignificant={isSignificantResult}
            />
            
            <VariantComparisonContainer>
              <VariantCard variantType={controlType}>
                <VariantTitle>Variant {controlType} (Control)</VariantTitle>
                <VariantStat>
                  Visitors: <span>{controlVariant.visitors}</span>
                </VariantStat>
                <VariantStat>
                  Conversions: <span>{controlVariant.conversions}</span>
                </VariantStat>
                <VariantStat>
                  Conversion Rate: <span>{controlVariant.conversionRate.toFixed(2)}%</span>
                </VariantStat>
              </VariantCard>
              
              <VariantCard variantType={testType}>
                <VariantTitle>Variant {testType} (Test)</VariantTitle>
                <VariantStat>
                  Visitors: <span>{testVariant.visitors}</span>
                </VariantStat>
                <VariantStat>
                  Conversions: <span>{testVariant.conversions}</span>
                </VariantStat>
                <VariantStat>
                  Conversion Rate: <span>{testVariant.conversionRate.toFixed(2)}%</span>
                </VariantStat>
              </VariantCard>
            </VariantComparisonContainer>
          </>
        )}
        
        {analysisMethod === 'bayesian' && (
          <BayesianAnalysis
            testData={data}
            controlKey={controlKey}
            testKey={testKey}
          />
        )}
        
        {analysisMethod === 'sequential' && (
          <SequentialTesting
            testData={data}
            controlKey={controlKey}
            testKey={testKey}
          />
        )}
        
        {analysisMethod === 'segmentation' && (
          <SegmentAnalysisResults
            testData={data}
            segments={segments}
            controlKey={controlKey}
            testKey={testKey}
          />
        )}
      </DetailsContainer>
    </ResultsContainer>
  );
};

export default ResultsDisplay; 