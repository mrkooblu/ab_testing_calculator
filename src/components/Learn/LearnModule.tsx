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

const TutorialDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const LearnModule: React.FC<LearnModuleProps> = ({ onApplyExample }) => {
  const learnTabs = [
    {
      id: 'guide',
      label: 'A/B Testing Guide',
      icon: <GuideIcon />,
      content: (
        <TutorialContainer>
          <TutorialDescription>
            Learn how to create effective A/B tests with this step-by-step tutorial. Each step explains a key concept with examples.
          </TutorialDescription>
          <SetupWizard onComplete={() => {}} onApplyExample={onApplyExample} isModal={false} />
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