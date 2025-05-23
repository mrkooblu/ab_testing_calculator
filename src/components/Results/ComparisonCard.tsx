import React from 'react';
import styled, { keyframes } from 'styled-components';
import TestStrengthMeter from './TestStrengthMeter';

interface ComparisonCardProps {
  controlKey: string;
  testKey: string;
  controlType: string;
  testType: string;
  controlRate: number;
  testRate: number;
  relativeUplift: number;
  isSignificant: boolean;
  betterVariant: string;
  pValue: number;
  confidenceLevel: number;
  selected: boolean;
  onClick: () => void;
  animationDelay?: number; // Optional animation delay
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

const CardContainer = styled.div<{ selected: boolean, isSignificant: boolean, delay?: number }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme, selected }) => selected ? theme.shadows.md : theme.shadows.sm};
  margin: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 2px solid ${({ theme, selected, isSignificant }) => 
    selected 
      ? (isSignificant ? theme.colors.success : theme.colors.primary)
      : 'transparent'
  };
  animation: ${fadeIn} 0.4s ease-out;
  animation-delay: ${({ delay }) => delay ? `${delay}s` : '0s'};
  animation-fill-mode: both;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.sm};
    margin: ${({ theme }) => theme.spacing.xs} 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const Title = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SignificanceLabel = styled.div<{ isSignificant: boolean }>`
  background-color: ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.error};
  color: #ffffff;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  
  @media (max-width: 768px) {
    align-self: flex-start;
  }
`;

const RatesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const RateBox = styled.div<{ variantType: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme, variantType }) => {
    switch(variantType) {
      case 'A': return `${theme.colors.variantA}20`;
      case 'B': return `${theme.colors.variantB}20`;
      case 'C': return `${theme.colors.variantC}20`;
      case 'D': return `${theme.colors.variantD}20`;
      default: return `${theme.colors.variantA}20`;
    }
  }};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  flex: 1;
  max-width: 45%;
  
  @media (max-width: 768px) {
    max-width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const VariantLabel = styled.div<{ variantType: string }>`
  font-size: 12px;
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
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  
  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`;

const RateValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ComparisonIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xs};
    align-self: flex-end;
  }
`;

const UpliftContainer = styled.div<{ isPositive: boolean, isSignificant: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme, isPositive }) => 
    isPositive ? theme.colors.success : theme.colors.error};
  font-size: 12px;
  opacity: ${({ isSignificant }) => isSignificant ? 1 : 0.8};
  background-color: ${({ theme, isPositive }) => 
    isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-width: 80px;
  text-align: center;
  justify-content: center;
`;

// Modify the formatPercentage function to make it more descriptive and directional
const formatPercentage = (value: number, isTestBetter: boolean, testType: string, controlType: string): string => {
  const formattedValue = value.toFixed(2);
  if (isTestBetter) {
    return `${testType} is better by ${formattedValue}%`;
  } else {
    return `${testType} is worse by ${formattedValue}%`;
  }
};

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  controlKey,
  testKey,
  controlType,
  testType,
  controlRate,
  testRate,
  relativeUplift,
  isSignificant,
  betterVariant,
  pValue,
  confidenceLevel,
  selected,
  onClick,
  animationDelay = 0,
}) => {
  // Update logic to properly determine which variant is better
  const isTestBetter = testRate > controlRate;
  const isNeutral = testRate === controlRate;
  
  return (
    <CardContainer 
      selected={selected} 
      isSignificant={isSignificant} 
      onClick={onClick}
      delay={animationDelay}
    >
      <CardHeader>
        <Title>{controlType} vs {testType}</Title>
        <SignificanceLabel isSignificant={isSignificant}>
          {isSignificant ? 'Significant' : 'Not Significant'}
        </SignificanceLabel>
      </CardHeader>
      
      <RatesContainer>
        <RateBox variantType={controlType}>
          <VariantLabel variantType={controlType}>Variant {controlType}</VariantLabel>
          <RateValue>{controlRate.toFixed(2)}%</RateValue>
        </RateBox>
        
        <ComparisonIndicator>
          <UpliftContainer isPositive={isTestBetter} isSignificant={isSignificant}>
            {isNeutral ? '=' : (isTestBetter ? '↑' : '↓')}
            {isNeutral ? 'No change' : formatPercentage(Math.abs(relativeUplift), isTestBetter, testType, controlType)}
          </UpliftContainer>
        </ComparisonIndicator>
        
        <RateBox variantType={testType}>
          <VariantLabel variantType={testType}>Variant {testType}</VariantLabel>
          <RateValue>{testRate.toFixed(2)}%</RateValue>
        </RateBox>
      </RatesContainer>
      
      <TestStrengthMeter
        pValue={pValue}
        confidenceLevel={confidenceLevel}
        isSignificant={isSignificant}
      />
    </CardContainer>
  );
};

export default ComparisonCard; 