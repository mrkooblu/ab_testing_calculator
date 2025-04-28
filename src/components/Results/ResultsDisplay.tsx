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
import {
  checkSampleSizeWarning,
  calculateConfidenceInterval
} from '../../utils/statistics';
import ConfidenceVisualization from './ConfidenceVisualization';
import TestStrengthMeter from './TestStrengthMeter';
import ResultsDashboard from './ResultsDashboard';
import ShareButton from '../common/ShareButton';
import AutomatedInsights from './AutomatedInsights';
import BayesianAnalysis from './BayesianAnalysis';
import { SequentialTesting } from './SequentialTesting';
import { Segment } from '../Form/SegmentationPanel';
import WinningVariant from './WinningVariant';
import { determineWinningVariant } from '../../utils/winningVariantAnalysis';
import { formatPercent, formatNumber, formatPValue, DECIMAL_PRECISION } from '../../utils/constants';
import LazyVisualization from './LazyVisualization';
import { useVisualization } from '../../context/VisualizationContext';

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
type AnalysisMethod = 'frequentist' | 'bayesian' | 'sequential';

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

const WinningVariantSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
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
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}10;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-left: ${({ theme }) => theme.spacing.xs};
  cursor: help;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}30;
  }
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    width: max-content;
    max-width: 280px;
    padding: 10px 14px;
    border-radius: 4px;
    background-color: rgba(33, 33, 33, 0.95);
    color: white;
    font-size: 13px;
    z-index: 1000;
    line-height: 1.4;
    text-align: left;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    
    /* Arrow pointing up */
    &:before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent rgba(33, 33, 33, 0.95) transparent;
    }
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      max-width: 250px;
      left: 0;
      transform: none;
      
      &:before {
        left: 10px;
      }
    }
  }
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

// Add warning banner styled component
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

const UpliftValue = styled.span<{ isPositive: boolean }>`
  color: ${({ theme, isPositive }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  display: inline-flex;
  align-items: center;
`;

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isVisible, segments = [] }) => {
  const { variants, settings } = data;
  
  // Track if this is a fresh display for animations
  const [isNewDisplay, setIsNewDisplay] = useState(false);
  // Add state for the analysis method
  const [activeTab, setActiveTab] = useState('frequentist');
  const [prevActiveTab, setPrevActiveTab] = useState<string | null>(null);
  const { setActiveTab: setVisualizationTab } = useVisualization();
  // Track previous analysis method to handle transitions
  const [prevAnalysisMethod, setPrevAnalysisMethod] = useState<AnalysisMethod | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Track which visualization tabs have been cached
  const [cachedVisualizations, setCachedVisualizations] = useState({
    frequentist: false,
    bayesian: false,
    sequential: false
  });

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
  
  // When the active results tab changes, update visualization context
  useEffect(() => {
    setVisualizationTab(activeTab);
    
    // For transition tracking
    if (activeTab !== prevActiveTab) {
      setPrevActiveTab(activeTab);
    }
  }, [activeTab, prevActiveTab, setVisualizationTab]);
  
  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

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
      
      // Add debug logging
      console.log(`Comparison ${controlType} vs ${testType}:`, {
        controlVisitors: controlVariant.visitors,
        controlConversions: controlVariant.conversions,
        controlRate,
        testVisitors: testVariant.visitors,
        testConversions: testVariant.conversions,
        testRate,
        pooledRate,
        standardError,
        zScore
      });
      
      // Calculate p-value - guard against invalid Z-score values
      const safeZScore = isNaN(zScore) || !isFinite(zScore) ? 0 : zScore;
      const pValue = calculatePValue(safeZScore, settings.hypothesisType === 'two-sided');
      
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
        standardError
      });
    }
    
    return comparisons;
  };
  
  const comparisons = generateComparisons();
  const [activeComparison, setActiveComparison] = useState<{controlKey: VariantKey, testKey: VariantKey} | null>(
    comparisons.length > 0 ? { controlKey: comparisons[0].controlKey, testKey: comparisons[0].testKey } : null
  );
  
  // Update prevAnalysisMethod when activeTab changes
  useEffect(() => {
    if (activeTab !== prevActiveTab) {
      setPrevAnalysisMethod(prevActiveTab as AnalysisMethod);
      // Set transition flag
      setIsTransitioning(true);
      
      // Clear transition flag after a short delay
      setTimeout(() => {
        setIsTransitioning(false);
        
        // Mark the new tab as cached to avoid recalculations
        setCachedVisualizations(prev => ({
          ...prev,
          [activeTab]: true
        }));
      }, 300);
    }
  }, [activeTab, prevActiveTab]);
  
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
      
      {/* Add Winning Variant Component */}
      {activeVariantKeys.length >= 2 && (
        <WinningVariantSection>
          {(() => {
            const { winningKey, confidenceLevel } = determineWinningVariant(
              data,
              settings.confidenceLevel
            );
            
            if (winningKey) {
              const winningVariant = variants[winningKey];
              const winningType = getVariantTypeFromKey(winningKey);
              
              // Generate comparisons with all other variants
              const variantComparisons = activeVariantKeys
                .filter(key => key !== winningKey)
                .map(key => {
                  const variantType = getVariantTypeFromKey(key);
                  const variantRate = variants[key].conversionRate;
                  const conversionRateDiff = winningVariant.conversionRate - variantRate;
                  
                  return {
                    variantType,
                    conversionRateDiff
                  };
                });
              
              return (
                <WinningVariant
                  winningVariantKey={winningKey}
                  winningVariantType={winningType}
                  conversionRate={winningVariant.conversionRate}
                  confidenceLevel={confidenceLevel}
                  comparisons={variantComparisons}
                  confidenceThreshold={settings.confidenceLevel}
                />
              );
            }
            return null;
          })()}
        </WinningVariantSection>
      )}
      
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
          {betterVariant === testKey && (
            <>
              Variant {testType}'s conversion rate ({testVariant.conversionRate.toFixed(2)}%) was{' '}
              <UpliftValue isPositive={relativeUplift > 0}>
                {relativeUplift > 0 ? '↑' : '↓'} {Math.abs(relativeUplift).toFixed(2)}%
              </UpliftValue>{' '}
              {relativeUplift > 0 ? 'higher' : 'lower'} than variant {controlType}'s conversion rate ({controlVariant.conversionRate.toFixed(2)}%).
            </>
          )}
          {betterVariant === controlKey && (
            <>
              Variant {controlType}'s conversion rate ({controlVariant.conversionRate.toFixed(2)}%) was{' '}
              <UpliftValue isPositive={relativeUplift < 0}>
                {relativeUplift < 0 ? '↑' : '↓'} {Math.abs(relativeUplift).toFixed(2)}%
              </UpliftValue>{' '}
              {relativeUplift < 0 ? 'higher' : 'lower'} than variant {testType}'s conversion rate ({testVariant.conversionRate.toFixed(2)}%).
            </>
          )}
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
            active={activeTab === 'frequentist'} 
            onClick={() => handleTabChange('frequentist')}
            disabled={isTransitioning}
          >
            Frequentist
          </ToggleButton>
          <ToggleButton 
            active={activeTab === 'bayesian'} 
            onClick={() => handleTabChange('bayesian')}
            disabled={isTransitioning}
          >
            Bayesian
          </ToggleButton>
          <ToggleButton 
            active={activeTab === 'sequential'} 
            onClick={() => handleTabChange('sequential')}
            disabled={isTransitioning}
          >
            Sequential
          </ToggleButton>
        </AnalysisToggleContainer>

        {activeTab === 'frequentist' && (
          <>
            {/* Add warning banner based on sample size check */}
            {(() => {
              const controlWarning = checkSampleSizeWarning(controlVariant.visitors, controlVariant.conversions);
              const testWarning = checkSampleSizeWarning(testVariant.visitors, testVariant.conversions);
              
              if (controlWarning.hasWarning || testWarning.hasWarning) {
                return (
                  <WarningBanner severity={
                    controlWarning.severity === 'high' || testWarning.severity === 'high' ? 'high' :
                    controlWarning.severity === 'medium' || testWarning.severity === 'medium' ? 'medium' : 'low'
                  }>
                    {controlWarning.hasWarning && `Control group: ${controlWarning.message} `}
                    {testWarning.hasWarning && `Test group: ${testWarning.message} `}
                    Sample size issues may affect the reliability of your results.
                  </WarningBanner>
                );
              }
              return null;
            })()}
            
            <LazyVisualization 
              priority={8} 
              forceLoading={activeTab === 'frequentist' && isTransitioning} 
              isCached={cachedVisualizations.frequentist}
              prevTabName={prevAnalysisMethod}
              currentTabName="frequentist"
            >
              <ConfidenceVisualization
                controlMean={controlVariant.conversionRate}
                controlStdDev={
                  Math.sqrt(
                    (controlVariant.conversionRate / 100) *
                      (1 - controlVariant.conversionRate / 100) /
                      controlVariant.visitors
                  ) * 100
                }
                testMean={testVariant.conversionRate}
                testStdDev={
                  Math.sqrt(
                    (testVariant.conversionRate / 100) *
                      (1 - testVariant.conversionRate / 100) /
                      testVariant.visitors
                  ) * 100
                }
                confidenceLevel={settings.confidenceLevel}
                isTwoSided={settings.hypothesisType === 'two-sided'}
                isSignificant={isSignificantResult}
                controlType={controlType}
                testType={testType}
              />
            </LazyVisualization>
            
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
                <StatLabel>Control Rate</StatLabel>
                <StatValue>{formatPercent(controlVariant.conversionRate)}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Test Rate</StatLabel>
                <StatValue>{formatPercent(testVariant.conversionRate)}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Relative Uplift</StatLabel>
                <StatValue>
                  <UpliftValue isPositive={relativeUplift > 0}>
                    {relativeUplift > 0 ? '+' : ''}{formatPercent(relativeUplift)}
                  </UpliftValue>
                </StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>
                  P-Value
                  <InfoIcon data-tooltip={
                    `A p-value of ${formatPValue(pValue)}${pValue < 0.0001 ? ' (extremely small)' : ''} ${
                      isSignificantResult ? 'indicates statistical significance' : 'is not statistically significant'
                    } at the ${settings.confidenceLevel}% confidence level. ${
                      settings.hypothesisType === 'one-sided' 
                      ? 'For one-sided tests, p-value is always 1.0 when the control outperforms the test variant, as we only test for improvement in one direction.' 
                      : 'This two-sided test looks for differences in either direction.'
                    }`
                  }>?</InfoIcon>
                </StatLabel>
                <StatValue>
                  {formatPValue(pValue)}
                </StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>
                  Power
                  <InfoIcon data-tooltip={
                    `Statistical power of ${formatPercent(power, DECIMAL_PRECISION.POWER)} represents the probability of detecting a true effect if one exists. Higher values (>80%) indicate a more reliable test.`
                  }>?</InfoIcon>
                </StatLabel>
                <StatValue>{formatPercent(power, DECIMAL_PRECISION.POWER)}</StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>
                  Z-Score
                  <InfoIcon data-tooltip={
                    `The Z-score of ${formatNumber(zScore, DECIMAL_PRECISION.Z_SCORE)} measures how many standard deviations the test variant's conversion rate is from the control. Values above ${settings.confidenceLevel === 95 ? '1.96' : settings.confidenceLevel === 99 ? '2.58' : '1.65'} indicate significance at ${settings.confidenceLevel}% confidence.`
                  }>?</InfoIcon>
                </StatLabel>
                <StatValue>{formatNumber(zScore, DECIMAL_PRECISION.Z_SCORE)}</StatValue>
              </StatItem>
            </StatsGrid>
            
            <LazyVisualization 
              priority={9} 
              height={120} 
              minHeight={100} 
              forceLoading={activeTab === 'frequentist' && isTransitioning}
              isCached={cachedVisualizations.frequentist}
              prevTabName={prevAnalysisMethod}
              currentTabName="frequentist"
            >
              <TestStrengthMeter
                pValue={pValue}
                confidenceLevel={settings.confidenceLevel}
                isSignificant={isSignificantResult}
              />
            </LazyVisualization>
            
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
                  {(() => {
                    const ci = calculateConfidenceInterval(controlVariant.visitors, controlVariant.conversions);
                    return (
                      <ConfidenceInterval>
                        95% CI: [{ci.lower.toFixed(2)}%, {ci.upper.toFixed(2)}%]
                      </ConfidenceInterval>
                    );
                  })()}
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
                  {(() => {
                    const ci = calculateConfidenceInterval(testVariant.visitors, testVariant.conversions);
                    return (
                      <ConfidenceInterval>
                        95% CI: [{ci.lower.toFixed(2)}%, {ci.upper.toFixed(2)}%]
                      </ConfidenceInterval>
                    );
                  })()}
                </VariantStat>
              </VariantCard>
            </VariantComparisonContainer>
          </>
        )}
        
        {activeTab === 'bayesian' && (
          <LazyVisualization 
            priority={5} 
            forceLoading={activeTab === 'bayesian' && isTransitioning}
            isCached={cachedVisualizations.bayesian}
            prevTabName={prevAnalysisMethod}
            currentTabName="bayesian"
          >
            <BayesianAnalysis
              testData={data}
              controlKey={controlKey}
              testKey={testKey}
            />
          </LazyVisualization>
        )}
        
        {activeTab === 'sequential' && (
          <LazyVisualization 
            priority={5} 
            forceLoading={activeTab === 'sequential' && isTransitioning}
            isCached={cachedVisualizations.sequential}
            prevTabName={prevAnalysisMethod}
            currentTabName="sequential"
          >
            <SequentialTesting
              testData={data}
              controlKey={controlKey}
              testKey={testKey}
            />
          </LazyVisualization>
        )}
      </DetailsContainer>
    </ResultsContainer>
  );
};

export default ResultsDisplay; 