import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { calculateTestStrength } from '../../utils/visualizationUtils';

interface TestStrengthMeterProps {
  pValue: number;
  confidenceLevel: number;
  isSignificant: boolean;
}

const fillAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const MeterContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeIn} 0.5s ease-out;
`;

const MeterTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MeterTrack = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    height: 8px;
  }
`;

const MeterFill = styled.div<{ strength: number; isSignificant: boolean; animate: boolean }>`
  height: 100%;
  width: ${({ strength }) => `${strength}%`};
  background-color: ${({ theme, strength, isSignificant }) => {
    if (isSignificant) return theme.colors.success;
    
    if (strength < 33) return theme.colors.error;
    if (strength < 66) return theme.colors.warning;
    return theme.colors.info; // Getting close
  }};
  border-radius: 4px;
  transition: width 1.5s ease-out;
  animation: ${({ animate }) => animate ? fillAnimation : 'none'} 1s ease-out forwards;
  --target-width: ${({ strength }) => `${strength}%`};
`;

const MeterLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MeterValue = styled.div<{ isSignificant: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.text.primary};
  animation: ${fadeIn} 0.5s ease-out 0.5s both;
`;

const TestStrengthMeter: React.FC<TestStrengthMeterProps> = ({
  pValue,
  confidenceLevel,
  isSignificant,
}) => {
  // State to control animation
  const [animate, setAnimate] = useState(false);
  
  // Alpha is derived from confidence level
  const alpha = 1 - (confidenceLevel / 100);
  
  // Calculate strength percentage
  const strength = calculateTestStrength(pValue, alpha);
  
  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);
  
  // Get appropriate label based on strength
  const getStrengthLabel = () => {
    if (isSignificant) return 'Significant Result';
    if (strength < 33) return 'Weak Evidence';
    if (strength < 66) return 'Moderate Evidence';
    return 'Strong Evidence';
  };
  
  return (
    <MeterContainer>
      <MeterTitle>
        Test Strength
        <MeterValue isSignificant={isSignificant}>
          {strength.toFixed(0)}%
        </MeterValue>
      </MeterTitle>
      
      <MeterTrack>
        <MeterFill 
          strength={strength} 
          isSignificant={isSignificant} 
          animate={animate}
        />
      </MeterTrack>
      
      <MeterLabel>
        <span>Weaker</span>
        <span>{getStrengthLabel()}</span>
        <span>Stronger</span>
      </MeterLabel>
    </MeterContainer>
  );
};

export default TestStrengthMeter; 