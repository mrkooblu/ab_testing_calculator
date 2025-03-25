import React from 'react';
import styled from 'styled-components';
import Button from '../common/Button';

interface HeaderProps {
  scrollToCalculator: () => void;
}

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xxl} 0;
  text-align: center;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: ${({ theme }) => theme.typography.lineHeight.lg};
`;

const Header: React.FC<HeaderProps> = ({ scrollToCalculator }) => {
  return (
    <HeaderContainer>
      <div className="container">
        <Title>A/B Testing Significance Calculator</Title>
        <Subtitle>Calculate statistical significance with our calculator</Subtitle>
        <Description>
          Are your results statistically significant? Find out if your test variations made a real difference.
          Our calculator helps you determine significance, analyze conversion rates, and make data-driven decisions.
        </Description>
        <Button onClick={scrollToCalculator} size="large">
          Get Started
        </Button>
      </div>
    </HeaderContainer>
  );
};

export default Header; 