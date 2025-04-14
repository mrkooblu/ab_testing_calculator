import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ABTestFormData } from '../../types';

interface SetupWizardProps {
  onComplete: () => void;
  onApplyExample: (data: ABTestFormData) => void;
  isModal?: boolean;
}

const WizardOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const WizardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const InlineContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  width: 100%;
`;

const DescriptionBox = styled.div`
  background-color: ${({ theme }) => `${theme.colors.info}10`};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const BlueSidebar = styled.div`
  width: 6px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const DescriptionText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const ContentContainer = styled.div`
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const WizardHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const WizardTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  line-height: 1.4;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StepDot = styled.div<{ active: boolean, completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 ${({ theme }) => theme.spacing.xs};
  background-color: ${({ theme, active, completed }) => 
    active ? theme.colors.primary : 
    completed ? theme.colors.success : 
    theme.colors.border};
  transition: background-color 0.3s ease;
`;

const StepContent = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TutorialStep = styled.div`
  padding-left: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StepTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const StepDescription = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ExampleContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const ExampleTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ExampleDescription = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ExampleButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LeftNavButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavButton = styled.button<{ primary?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ theme, primary }) => primary ? theme.colors.primary : 'transparent'};
  color: ${({ theme, primary, disabled }) => {
    if (disabled) return theme.colors.text.disabled;
    return primary ? 'white' : theme.colors.text.primary;
  }};
  border: ${({ theme, primary, disabled }) => {
    if (disabled) return `1px solid ${theme.colors.border}`;
    return primary ? 'none' : `1px solid ${theme.colors.border}`;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  
  &:hover {
    background-color: ${({ theme, primary, disabled }) => {
      if (disabled) return 'transparent';
      return primary ? theme.colors.secondary : theme.colors.surface;
    }};
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  background-color: ${({ theme, primary }) => primary ? theme.colors.primary : 'transparent'};
  color: ${({ theme, primary }) => primary ? 'white' : theme.colors.text.primary};
  border: ${({ theme, primary }) => primary ? 'none' : `1px solid ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${({ theme, primary }) => primary ? theme.colors.secondary : theme.colors.surface};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImageContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
  text-align: center;
  img {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const KeyConcept = styled.div`
  background-color: ${({ theme }) => `${theme.colors.info}10`};
  border-left: 4px solid ${({ theme }) => theme.colors.info};
  padding: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const KeyConceptTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const TermsList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const TermItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: flex-start;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TermLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  margin-right: ${({ theme }) => theme.spacing.xs};
  min-width: 140px;
  display: inline-block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const TermDescription = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, onApplyExample, isModal = true }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to A/B Testing Calculator",
      content: (
        <>
          <StepDescription>
            This wizard will guide you through the basics of A/B testing and how to use this calculator 
            effectively to determine statistical significance in your tests.
          </StepDescription>
          <KeyConcept>
            <KeyConceptTitle>What is A/B Testing?</KeyConceptTitle>
            <p>A/B testing is a method of comparing two or more versions of a webpage or app to determine 
            which one performs better in terms of a specified goal (conversion).</p>
          </KeyConcept>
        </>
      )
    },
    {
      title: "Understanding Statistical Significance",
      content: (
        <>
          <StepDescription>
            Statistical significance helps you determine if the difference between your variants is 
            real or just due to random chance.
          </StepDescription>
          <KeyConcept>
            <KeyConceptTitle>Key Terms:</KeyConceptTitle>
            <TermsList>
              <TermItem>
                <TermLabel>Confidence Level:</TermLabel>
                <TermDescription>How sure you want to be that your results are not due to chance (usually 95%).</TermDescription>
              </TermItem>
              <TermItem>
                <TermLabel>P-value:</TermLabel>
                <TermDescription>The probability that the difference you observed is due to random chance.</TermDescription>
              </TermItem>
              <TermItem>
                <TermLabel>Statistical Power:</TermLabel>
                <TermDescription>The probability of detecting a true effect when it exists.</TermDescription>
              </TermItem>
            </TermsList>
          </KeyConcept>
        </>
      )
    },
    {
      title: "How to Use This Calculator",
      content: (
        <>
          <StepDescription>
            Using the calculator is simple. Input your data for each variant, and the calculator will determine 
            if your results are statistically significant.
          </StepDescription>
          <KeyConcept>
            <KeyConceptTitle>Required Inputs:</KeyConceptTitle>
            <TermsList>
              <TermItem>
                <TermLabel>Visitors:</TermLabel>
                <TermDescription>The number of people who viewed each variant.</TermDescription>
              </TermItem>
              <TermItem>
                <TermLabel>Conversions:</TermLabel>
                <TermDescription>The number of people who took the desired action.</TermDescription>
              </TermItem>
              <TermItem>
                <TermLabel>Hypothesis Type:</TermLabel>
                <TermDescription>One-sided (looking for improvement) or Two-sided (looking for any difference).</TermDescription>
              </TermItem>
              <TermItem>
                <TermLabel>Confidence Level:</TermLabel>
                <TermDescription>How confident you want to be in the results (usually 95%).</TermDescription>
              </TermItem>
            </TermsList>
          </KeyConcept>
        </>
      )
    },
    {
      title: "Try a Sample Test",
      content: (
        <>
          <StepDescription>
            Let's start with a sample test to see how the calculator works. You can choose from the examples below 
            or input your own data.
          </StepDescription>
          
          <ExampleContainer>
            <ExampleTitle>Significant Difference Example</ExampleTitle>
            <ExampleDescription>
              This example demonstrates a test where there is a statistically significant improvement 
              of Variant B over Variant A.
            </ExampleDescription>
            <ExampleButton onClick={() => handleApplyExample('significant')}>
              Apply This Example
            </ExampleButton>
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>No Significant Difference Example</ExampleTitle>
            <ExampleDescription>
              This example shows a test where the observed difference is not statistically significant 
              and could be due to random chance.
            </ExampleDescription>
            <ExampleButton onClick={() => handleApplyExample('notSignificant')}>
              Apply This Example
            </ExampleButton>
          </ExampleContainer>
          
          <ExampleContainer>
            <ExampleTitle>Multiple Variants Example</ExampleTitle>
            <ExampleDescription>
              This example demonstrates how to compare multiple variants against a control.
            </ExampleDescription>
            <ExampleButton onClick={() => handleApplyExample('multipleVariants')}>
              Apply This Example
            </ExampleButton>
          </ExampleContainer>
        </>
      )
    }
  ];
  
  const handleApplyExample = (type: string) => {
    let exampleData: ABTestFormData;
    
    switch (type) {
      case 'significant':
        exampleData = {
          variants: {
            variantA: { type: 'A', visitors: 10000, conversions: 500, conversionRate: 5 },
            variantB: { type: 'B', visitors: 10000, conversions: 600, conversionRate: 6 },
            variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
            variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
          },
          settings: {
            hypothesisType: 'one-sided',
            confidenceLevel: 95
          }
        };
        break;
      case 'notSignificant':
        exampleData = {
          variants: {
            variantA: { type: 'A', visitors: 500, conversions: 50, conversionRate: 10 },
            variantB: { type: 'B', visitors: 500, conversions: 55, conversionRate: 11 },
            variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
            variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
          },
          settings: {
            hypothesisType: 'one-sided',
            confidenceLevel: 95
          }
        };
        break;
      case 'multipleVariants':
        exampleData = {
          variants: {
            variantA: { type: 'A', visitors: 5000, conversions: 250, conversionRate: 5 },
            variantB: { type: 'B', visitors: 5000, conversions: 300, conversionRate: 6 },
            variantC: { type: 'C', visitors: 5000, conversions: 275, conversionRate: 5.5 },
            variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
          },
          settings: {
            hypothesisType: 'one-sided',
            confidenceLevel: 95
          }
        };
        break;
      default:
        exampleData = {
          variants: {
            variantA: { type: 'A', visitors: 0, conversions: 0, conversionRate: 0 },
            variantB: { type: 'B', visitors: 0, conversions: 0, conversionRate: 0 },
            variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
            variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
          },
          settings: {
            hypothesisType: 'one-sided',
            confidenceLevel: 95
          }
        };
    }
    
    onApplyExample(exampleData);
    onComplete();
  };
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  const renderContent = () => (
    <>
      <WizardHeader>
        {isModal && <WizardTitle>A/B Testing Guide</WizardTitle>}
        <StepIndicator>
          {steps.map((_, index) => (
            <StepDot 
              key={index} 
              active={index === currentStep} 
              completed={index < currentStep} 
            />
          ))}
        </StepIndicator>
      </WizardHeader>
      
      <StepContent>
        <TutorialStep>
          <StepTitle>{steps[currentStep].title}</StepTitle>
          {steps[currentStep].content}
        </TutorialStep>
      </StepContent>
      
      <NavigationButtons>
        <LeftNavButtons>
          <NavButton 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
          >
            ← Previous
          </NavButton>
          
          {isModal && currentStep === 0 && (
            <NavButton onClick={handleSkip}>
              Skip Tutorial
            </NavButton>
          )}
        </LeftNavButtons>
        
        <NavButton 
          primary 
          onClick={handleNext}
        >
          {currentStep < steps.length - 1 ? 'Next →' : 'Finish'}
        </NavButton>
      </NavigationButtons>
    </>
  );
  
  if (isModal) {
    return (
      <WizardOverlay>
        <WizardContainer>
          <CloseButton onClick={handleSkip}>×</CloseButton>
          {renderContent()}
        </WizardContainer>
      </WizardOverlay>
    );
  }
  
  return (
    <InlineContainer>
      <DescriptionBox>
        <DescriptionText>
          Learn how to create effective A/B tests with this step-by-step tutorial. Each step explains a key concept with examples.
        </DescriptionText>
      </DescriptionBox>
      <ContentContainer>{renderContent()}</ContentContainer>
    </InlineContainer>
  );
};

export default SetupWizard; 