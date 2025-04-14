import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { VariantType, VariantKey } from '../../types';

// Add a comparison interface
interface VariantComparison {
  variantType: VariantType;
  conversionRateDiff: number;
}

interface WinningVariantProps {
  winningVariantKey: VariantKey;
  winningVariantType: VariantType;
  conversionRate: number;
  confidenceLevel: number;
  comparisons: VariantComparison[];
  // Add new prop for confidence threshold
  confidenceThreshold?: number;
}

// Define confetti animation
const confettiAnimation = keyframes`
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
`;

// Trophy glow animation
const trophyGlow = keyframes`
  0% { text-shadow: 0 0 5px gold, 0 0 10px gold; }
  50% { text-shadow: 0 0 20px gold, 0 0 30px gold; }
  100% { text-shadow: 0 0 5px gold, 0 0 10px gold; }
`;

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

// Add subtle pattern and gradient for visual differentiation
const WinningVariantContainer = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => `${theme.colors.surface}F0`} 100%);
  background-image: radial-gradient(${({ theme }) => `${theme.colors.primary}05`} 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: row;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const VariantInfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-right: ${({ theme }) => theme.spacing.md};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-right: 0;
    padding-bottom: ${({ theme }) => theme.spacing.md};
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const MetricsColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-left: 0;
    padding-top: ${({ theme }) => theme.spacing.md};
  }
`;

const MetricsRow = styled.div`
  display: flex;
  align-items: center;
`;

const WinnerLabel = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Add glow animation for high confidence
const TrophyIcon = styled.span<{ isHighConfidence?: boolean }>`
  margin-right: ${({ theme }) => theme.spacing.sm};
  display: inline-block;
  ${({ isHighConfidence }) => isHighConfidence && css`
    animation: ${trophyGlow} 2s infinite;
  `}
`;

const WinnerTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
`;

const VariantType = styled.span<{ variantType: VariantType }>`
  margin-left: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, variantType }) => {
    switch(variantType) {
      case 'A': return theme.colors.variantA;
      case 'B': return theme.colors.variantB;
      case 'C': return theme.colors.variantC;
      case 'D': return theme.colors.variantD;
      default: return theme.colors.variantA;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const WinnerRate = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

const ComparisonText = styled.div<{ isPositive: boolean }>`
  color: ${({ theme, isPositive }) => isPositive ? theme.colors.success : theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
`;

const ComparisonArrow = styled.span`
  margin-right: ${({ theme }) => theme.spacing.xs};
`;

const ComparisonsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ComparisonsLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return '#4CAF50'; // green
  if (confidence >= 80) return '#FF9800'; // yellow/orange
  return '#F44336'; // red
};

const CircleProgress = styled.div<{ percentage: number, confidence: number }>`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  margin-right: ${({ theme }) => theme.spacing.md};
  
  &:before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border-radius: 50%;
    background: white;
    z-index: 1;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      ${({ confidence }) => getConfidenceColor(confidence)} ${({ percentage }) => percentage}%, 
      #f0f0f0 ${({ percentage }) => percentage}% 100%
    );
  }
`;

// Add confidence threshold marker
const ThresholdMarker = styled.div<{ threshold: number }>`
  position: absolute;
  width: 3px;
  height: 10px;
  background-color: #333;
  z-index: 2;
  top: 0;
  left: 50%;
  transform-origin: bottom center;
  transform: translateX(-50%) rotate(${({ threshold }) => (threshold / 100) * 360}deg) translateY(-34px);
  
  &:after {
    content: '';
    position: absolute;
    top: -3px;
    left: -2px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #333;
  }
`;

const CircleText = styled.div<{ confidence: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ confidence }) => getConfidenceColor(confidence)};
  z-index: 2;
`;

const ConfidenceIndicator = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConfidenceLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: #000000;
`;

const ConfidenceExplanation = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

// Action recommendation banner
const RecommendationBanner = styled.div<{ confidence: number }>`
  background-color: ${({ confidence }) => 
    confidence >= 95 ? '#E8F5E9' :  // High confidence - green background
    confidence >= 80 ? '#FFF8E1' :  // Medium confidence - yellow background
    '#FFEBEE'                       // Low confidence - red background
  };
  border-left: 4px solid ${({ confidence }) => 
    confidence >= 95 ? '#4CAF50' :  // High confidence - green border
    confidence >= 80 ? '#FF9800' :  // Medium confidence - yellow border
    '#F44336'                       // Low confidence - red border
  };
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const RecommendationText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

// Confetti element for celebration
const Confetti = styled.div<{ delay: number }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: ${() => {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45aaf2', '#a55eea'];
    return colors[Math.floor(Math.random() * colors.length)];
  }};
  top: -10px;
  left: ${() => `${Math.random() * 100}%`};
  animation: ${confettiAnimation} 3s forwards;
  animation-delay: ${({ delay }) => `${delay * 0.1}s`};
`;

// View toggle switch
const DensityToggleContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  z-index: 10;
`;

const ToggleLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-right: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border};
  transition: .3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
  }
`;

const getRecommendationText = (confidenceLevel: number, variantType: VariantType) => {
  if (confidenceLevel >= 95) {
    return `Strong evidence - Implement Variant ${variantType}`;
  } else if (confidenceLevel >= 80) {
    return `Moderate evidence - Consider implementing Variant ${variantType}`;
  } else {
    return 'Insufficient evidence - Continue testing';
  }
};

const WinningVariant: React.FC<WinningVariantProps> = ({
  winningVariantKey,
  winningVariantType,
  conversionRate,
  confidenceLevel,
  comparisons,
  confidenceThreshold = 95
}) => {
  const hasComparisons = comparisons && comparisons.length > 0;
  const isHighConfidence = confidenceLevel >= 95;
  const [showDetails, setShowDetails] = useState(true);
  
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };
  
  // Generate confetti pieces for celebration effect
  const confettiCount = isHighConfidence ? 20 : 0;
  const confettiPieces = Array(confettiCount).fill(0).map((_, i) => (
    <Confetti key={`confetti-${i}`} delay={i} />
  ));
  
  return (
    <WinningVariantContainer>
      {/* Celebration confetti for high confidence winners */}
      {confettiPieces}
      
      {/* Information density toggle */}
      <DensityToggleContainer>
        <ToggleLabel onClick={toggleDetails}>
          {showDetails ? "Hide Details" : "Show Details"}
        </ToggleLabel>
        <ToggleSwitch>
          <ToggleInput 
            type="checkbox" 
            checked={showDetails}
            onChange={toggleDetails}
            id="details-toggle"
          />
          <ToggleSlider />
        </ToggleSwitch>
      </DensityToggleContainer>
      
      <VariantInfoColumn>
        <WinnerLabel>
          <TrophyIcon isHighConfidence={isHighConfidence}>🏆</TrophyIcon>
          OVERALL WINNER
        </WinnerLabel>
        <WinnerTitle>
          Variant <VariantType variantType={winningVariantType}>{winningVariantType}</VariantType>
        </WinnerTitle>
        <WinnerRate>
          {conversionRate.toFixed(2)}% conversion rate
          {showDetails && hasComparisons && (
            <ComparisonsContainer>
              <ComparisonsLabel>Compared to other variants:</ComparisonsLabel>
              {comparisons.map((comparison) => (
                <ComparisonText 
                  key={`comparison-${comparison.variantType}`}
                  isPositive={comparison.conversionRateDiff > 0}
                >
                  <ComparisonArrow>{comparison.conversionRateDiff > 0 ? '↑' : '↓'}</ComparisonArrow>
                  {Math.abs(comparison.conversionRateDiff).toFixed(2)}% vs Variant {comparison.variantType}
                </ComparisonText>
              ))}
            </ComparisonsContainer>
          )}
        </WinnerRate>
      </VariantInfoColumn>
      
      <MetricsColumn>
        <MetricsRow>
          <CircleProgress 
            percentage={confidenceLevel} 
            confidence={confidenceLevel}
          >
            {/* Confidence threshold marker */}
            <ThresholdMarker threshold={confidenceThreshold} />
            <CircleText confidence={confidenceLevel}>
              {confidenceLevel}%
            </CircleText>
          </CircleProgress>
          
          <ConfidenceIndicator>
            <div>
              <ConfidenceLabel>Confidence</ConfidenceLabel>
              {showDetails && (
                <ConfidenceExplanation>
                  Statistical confidence this is the best variant
                </ConfidenceExplanation>
              )}
            </div>
          </ConfidenceIndicator>
        </MetricsRow>
        
        {/* Action recommendation banner */}
        <RecommendationBanner confidence={confidenceLevel}>
          <RecommendationText>
            {getRecommendationText(confidenceLevel, winningVariantType)}
          </RecommendationText>
        </RecommendationBanner>
      </MetricsColumn>
    </WinningVariantContainer>
  );
};

export default WinningVariant; 