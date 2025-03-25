import React from 'react';
import styled, { keyframes } from 'styled-components';
import ComparisonCard from './ComparisonCard';
import { VariantType, VariantKey, VariantComparison } from '../../types';

interface ResultsDashboardProps {
  variantData: Record<VariantKey, {
    type: VariantType;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }>;
  comparisons: VariantComparison[];
  confidenceLevel: number;
  activeComparison: { controlKey: VariantKey, testKey: VariantKey } | null;
  onSelectComparison: (controlKey: VariantKey, testKey: VariantKey) => void;
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

const DashboardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: ${fadeIn} 0.4s ease-out;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const DashboardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  variantData,
  comparisons,
  confidenceLevel,
  activeComparison,
  onSelectComparison,
}) => {
  if (!comparisons.length) {
    return (
      <DashboardContainer>
        <DashboardTitle>Variant Comparisons</DashboardTitle>
        <EmptyState>No comparisons available.</EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardTitle>Variant Comparisons</DashboardTitle>
      <GridContainer>
        {comparisons.map((comparison, index) => {
          const { controlKey, testKey } = comparison;
          const controlType = variantData[controlKey].type;
          const testType = variantData[testKey].type;
          
          const isSelected = activeComparison 
            ? activeComparison.controlKey === controlKey && activeComparison.testKey === testKey
            : false;
            
          return (
            <ComparisonCard
              key={`${controlKey}-${testKey}`}
              controlKey={controlKey}
              testKey={testKey}
              controlType={controlType}
              testType={testType}
              controlRate={variantData[controlKey].conversionRate}
              testRate={variantData[testKey].conversionRate}
              relativeUplift={comparison.relativeUplift}
              isSignificant={comparison.isSignificant}
              betterVariant={comparison.betterVariant || ''}
              pValue={comparison.pValue}
              confidenceLevel={confidenceLevel}
              selected={isSelected}
              onClick={() => onSelectComparison(controlKey, testKey)}
              animationDelay={0.1 * (index + 1)}
            />
          );
        })}
      </GridContainer>
    </DashboardContainer>
  );
};

export default ResultsDashboard; 