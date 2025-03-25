import React from 'react';
import styled, { keyframes } from 'styled-components';
import { generateInsights } from '../../utils/insightsGenerator';
import { ABTestFormData, VariantKey } from '../../types';

interface AutomatedInsightsProps {
  testData: ABTestFormData;
  controlKey: VariantKey;
  testKey: VariantKey;
  pValue: number;
  relativeUplift: number;
  isSignificant: boolean;
  power: number;
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

const InsightsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  animation: ${fadeIn} 0.5s ease-out 0.7s both;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const InsightsTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const SummaryText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: 1.5;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const InsightsList = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InsightItem = styled.div<{ type: 'success' | 'warning' | 'info' | 'error' }>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: flex-start;
  
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return `${theme.colors.success}10`;
      case 'warning': return `${theme.colors.warning}10`;
      case 'error': return `${theme.colors.error}10`;
      default: return `${theme.colors.info}10`;
    }
  }};
  
  border-left: 4px solid ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.info;
    }
  }};
`;

const InsightIcon = styled.div<{ type: 'success' | 'warning' | 'info' | 'error' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
  
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.info;
    }
  }};
  
  color: white;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const InsightDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RecommendationsTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const RecommendationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const RecommendationItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
`;

const RecommendationAction = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RecommendationReasoning = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ConfidenceBadge = styled.span<{ confidence: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  background-color: ${({ theme, confidence }) => {
    switch (confidence) {
      case 'high': return `${theme.colors.success}20`;
      case 'medium': return `${theme.colors.warning}20`;
      case 'low': return `${theme.colors.error}20`;
    }
  }};
  
  color: ${({ theme, confidence }) => {
    switch (confidence) {
      case 'high': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.error;
    }
  }};
`;

const getIcon = (type: 'success' | 'warning' | 'info' | 'error') => {
  switch (type) {
    case 'success': return '✓';
    case 'warning': return '!';
    case 'error': return '✕';
    default: return 'i';
  }
};

const AutomatedInsights: React.FC<AutomatedInsightsProps> = ({
  testData,
  controlKey,
  testKey,
  pValue,
  relativeUplift,
  isSignificant,
  power,
}) => {
  const { insights, recommendations, summary } = generateInsights(
    testData, 
    controlKey, 
    testKey, 
    pValue, 
    relativeUplift, 
    isSignificant, 
    power
  );

  return (
    <InsightsContainer>
      <InsightsTitle>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Test Insights & Recommendations
      </InsightsTitle>
      
      <SummaryText>{summary}</SummaryText>
      
      <InsightsList>
        {insights.map((insight, index) => (
          <InsightItem key={index} type={insight.type}>
            <InsightIcon type={insight.type}>
              {getIcon(insight.type)}
            </InsightIcon>
            <InsightContent>
              <InsightTitle>{insight.title}</InsightTitle>
              <InsightDescription>{insight.description}</InsightDescription>
            </InsightContent>
          </InsightItem>
        ))}
      </InsightsList>
      
      <RecommendationsTitle>Recommendations</RecommendationsTitle>
      <RecommendationsList>
        {recommendations.map((recommendation, index) => (
          <RecommendationItem key={index}>
            <RecommendationAction>
              {recommendation.action}
              <ConfidenceBadge confidence={recommendation.confidence}>
                {recommendation.confidence.charAt(0).toUpperCase() + recommendation.confidence.slice(1)} confidence
              </ConfidenceBadge>
            </RecommendationAction>
            <RecommendationReasoning>{recommendation.reasoning}</RecommendationReasoning>
          </RecommendationItem>
        ))}
      </RecommendationsList>
    </InsightsContainer>
  );
};

export default AutomatedInsights; 