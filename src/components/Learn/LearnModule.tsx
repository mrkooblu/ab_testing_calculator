import React from 'react';
import styled from 'styled-components';
import LearnTabs from '../Tabs/LearnTabs';
import { GuideIcon, SampleSizeIcon, ExamplesIcon } from '../Icons/TabIcons';
import SetupWizard from '../Guidance/SetupWizard';
import SampleSizeCalculator from '../Guidance/SampleSizeCalculator';
import ExampleDataSets from '../Guidance/ExampleDataSets';
import { ABTestFormData } from '../../types';

interface LearnModuleProps {
  onApplyExample: (exampleData: ABTestFormData) => void;
}

const LearnTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TutorialContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const GuideContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const GuideHeader = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GuideSidebar = styled.div`
  width: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  margin-right: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const GuideContent = styled.div`
  flex: 1;
`;

const GuideTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  line-height: 1.4;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GuideDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LearnModule: React.FC<LearnModuleProps> = ({ onApplyExample }) => {
  const learnTabs = [
    {
      id: 'guide',
      label: 'A/B Testing Guide',
      icon: <GuideIcon />,
      content: (
        <TutorialContainer>
          <GuideContainer>
            <SetupWizard onComplete={() => {}} onApplyExample={onApplyExample} isModal={false} />
          </GuideContainer>
        </TutorialContainer>
      )
    },
    {
      id: 'sample-size',
      label: 'Sample Size Calculator',
      icon: <SampleSizeIcon />,
      content: <SampleSizeCalculator onClose={() => {}} />
    },
    {
      id: 'examples',
      label: 'Example Datasets',
      icon: <ExamplesIcon />,
      content: <ExampleDataSets onSelectExample={onApplyExample} />
    }
  ];

  return (
    <div>
      <LearnTabs tabs={learnTabs} defaultTab="guide" />
    </div>
  );
};

export default LearnModule; 