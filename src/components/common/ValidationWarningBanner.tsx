import React, { useState } from 'react';
import styled from 'styled-components';
import { ValidationWarning } from '../../utils/validationUtils';

interface ValidationWarningBannerProps {
  warnings: ValidationWarning[];
}

const WarningContainer = styled.div`
  background-color: #FFF8E1; /* Light warning color */
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const WarningHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  min-height: 44px; /* Minimum touch target height */
`;

const WarningIcon = styled.span`
  color: #F57F17; /* Warning color */
  margin-right: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }
`;

const WarningTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0;
  flex-grow: 1;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

const WarningCount = styled.span`
  background-color: #F57F17; /* Warning color */
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 50px; /* Full rounded corners */
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    padding: ${({ theme }) => theme.spacing.sm};
    min-width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s ease-in-out;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    width: 30px;
    height: 30px;
  }
`;

const WarningList = styled.ul<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return '#F44336'; // Error color
    case 'medium':
      return '#F57F17'; // Warning color
    default:
      return '#2196F3'; // Info color
  }
};

const getSeverityLightColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return '#FFEBEE'; // Light error color
    case 'medium':
      return '#FFF8E1'; // Light warning color
    default:
      return '#E3F2FD'; // Light info color
  }
};

const WarningItem = styled.li<{ severity: string }>`
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ severity }) => getSeverityLightColor(severity)};
  border-left: 4px solid ${({ severity }) => getSeverityColor(severity)};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const WarningMessage = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

const WarningRecommendation = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`;

const ValidationWarningBanner: React.FC<ValidationWarningBannerProps> = ({ warnings }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (warnings.length === 0) {
    return null;
  }
  
  return (
    <WarningContainer>
      <WarningHeader onClick={() => setIsOpen(!isOpen)}>
        <WarningIcon>⚠️</WarningIcon>
        <WarningTitle>Statistical Reliability Issues Detected</WarningTitle>
        <WarningCount>{warnings.length}</WarningCount>
        <ChevronIcon isOpen={isOpen}>▼</ChevronIcon>
      </WarningHeader>
      
      <WarningList isOpen={isOpen}>
        {warnings.map((warning, index) => (
          <WarningItem key={index} severity={warning.severity}>
            <WarningMessage>{warning.message}</WarningMessage>
            <WarningRecommendation>{warning.recommendation}</WarningRecommendation>
          </WarningItem>
        ))}
      </WarningList>
    </WarningContainer>
  );
};

export default ValidationWarningBanner; 