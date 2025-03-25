import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import theme from './theme';
import GlobalStyles from './styles/GlobalStyles';
import ABTestForm from './components/Form/ABTestForm';
import ResultsDisplay from './components/Results/ResultsDisplay';
import SetupWizard from './components/Guidance/SetupWizard';
import { ABTestFormData } from './types';
import { decodeURLToTestData } from './utils/urlParameters';
import { Segment } from './components/Form/SegmentationPanel';
import TabsContainer from './components/Tabs/TabsContainer';
import { CalculatorIcon, GuideIcon, SampleSizeIcon, ExamplesIcon } from './components/Icons/TabIcons';
import SampleSizeCalculator from './components/Guidance/SampleSizeCalculator';
import ExampleDataSets from './components/Guidance/ExampleDataSets';
import { calculateConversionRate } from './utils/statsCalculator';

// Define a key for storing wizard completion in localStorage
const WIZARD_COMPLETED_KEY = 'ab_testing_calculator_wizard_completed';

// Styled components for the App
const AppContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1rem;
  }
`;

const HeaderSection = styled.div`
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: 4rem 2rem;
  position: relative;
  background: linear-gradient(to bottom, ${({ theme }) => `${theme.colors.primary}10, ${theme.colors.background}`});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(${({ theme }) => `${theme.colors.primary}15`} 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.5;
    z-index: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.5rem 1rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 100%;
  }
`;

const MainTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
    margin-bottom: 1rem;
    line-height: 1.4;
  }
`;

const GetStartedButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}dd;
  }
`;

const ContentContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const TutorialContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.5rem 1rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const TutorialDescription = styled.p`
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1rem;
`;

const App: React.FC = () => {
  const [testData, setTestData] = useState<ABTestFormData | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeTab, setActiveTab] = useState<string>('calculator');
  
  const calculatorRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Check for URL parameters on initial load
  useEffect(() => {
    // Parse URL search parameters
    const searchParams = new URLSearchParams(window.location.search);
    const encodedData = Object.fromEntries(searchParams.entries());
    
    // If we have parameters, try to decode them
    if (Object.keys(encodedData).length > 0) {
      const decodedData = decodeURLToTestData(window.location.search);
      if (decodedData) {
        setTestData(decodedData);
        setIsCalculated(true);
        
        // Scroll to results since we have data from URL params
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300); // Slightly longer delay to ensure everything renders
      }
    }
    
    // Check if user has completed the wizard before
    const hasCompletedWizard = localStorage.getItem(WIZARD_COMPLETED_KEY) === 'true';
    if (!hasCompletedWizard) {
      setShowWizard(true);
    }
  }, []);
  
  const handleWizardComplete = () => {
    setShowWizard(false);
    localStorage.setItem(WIZARD_COMPLETED_KEY, 'true');
  };
  
  const handleTestCalculation = (data: ABTestFormData, segmentData: Segment[] = []) => {
    setTestData(data);
    setSegments(segmentData);
    setIsCalculated(true);
    
    // Scroll to results
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  const handleApplyExample = (exampleData: ABTestFormData) => {
    // Force a completely new object with primitive values to ensure React detects changes
    const processedData = {
      variants: {
        variantA: { 
          type: 'A' as const, 
          visitors: Number(exampleData.variants.variantA.visitors), 
          conversions: Number(exampleData.variants.variantA.conversions), 
          conversionRate: Number(exampleData.variants.variantA.conversionRate)
        },
        variantB: { 
          type: 'B' as const, 
          visitors: Number(exampleData.variants.variantB.visitors), 
          conversions: Number(exampleData.variants.variantB.conversions), 
          conversionRate: Number(exampleData.variants.variantB.conversionRate) 
        },
        variantC: { 
          type: 'C' as const, 
          visitors: Number(exampleData.variants.variantC.visitors), 
          conversions: Number(exampleData.variants.variantC.conversions), 
          conversionRate: Number(exampleData.variants.variantC.conversionRate) 
        },
        variantD: { 
          type: 'D' as const, 
          visitors: Number(exampleData.variants.variantD.visitors), 
          conversions: Number(exampleData.variants.variantD.conversions), 
          conversionRate: Number(exampleData.variants.variantD.conversionRate) 
        }
      },
      settings: {
        hypothesisType: exampleData.settings.hypothesisType === 'one-sided' ? 'one-sided' as const : 'two-sided' as const,
        confidenceLevel: Number(exampleData.settings.confidenceLevel)
      }
    };
    
    // Reset calculated state first
    setIsCalculated(false);
    
    // Set the data and switch tabs
    setTestData(processedData);
    setActiveTab('calculator');
    
    // Add a small delay to ensure the form is reset before showing calculation
    setTimeout(() => {
      setIsCalculated(true);
      
      // Scroll to calculator first
      if (calculatorRef.current) {
        calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
        
        // After a brief delay, scroll to results
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    }, 200);
  };
  
  const scrollToCalculator = () => {
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Define the main tabs
  const mainTabs = [
    {
      id: 'calculator',
      label: 'A/B Testing Calculator',
      icon: <CalculatorIcon />,
      content: (
        <div key={JSON.stringify(testData || {})}>
          <div ref={calculatorRef}>
            <ABTestForm 
              onCalculate={handleTestCalculation} 
              initialData={testData || undefined} 
            />
          </div>
          
          <div ref={resultsRef} id="results-section">
            {testData && (
              <ResultsDisplay 
                data={testData} 
                isVisible={isCalculated} 
                segments={segments}
              />
            )}
          </div>
        </div>
      )
    },
    {
      id: 'guide',
      label: 'A/B Testing Guide',
      icon: <GuideIcon />,
      content: (
        <TutorialContainer>
          <TutorialDescription>
            Learn how to create effective A/B tests with this step-by-step tutorial. Each step explains a key concept with examples.
          </TutorialDescription>
          <SetupWizard onComplete={() => {}} onApplyExample={handleApplyExample} isModal={false} />
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
      content: <ExampleDataSets onSelectExample={handleApplyExample} />
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AppContainer>
        <HeaderSection>
          <HeroContent>
            <MainTitle>A/B Testing Significance Calculator</MainTitle>
            <Description>
              Are your results statistically significant? Find out if your test variations made a 
              real difference. Our calculator helps you determine significance, analyze 
              conversion rates, and make data-driven decisions.
            </Description>
          </HeroContent>
        </HeaderSection>

        <TabsContainer 
          tabs={mainTabs} 
          defaultTab="calculator" 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {showWizard && (
          <SetupWizard 
            onComplete={handleWizardComplete} 
            onApplyExample={handleApplyExample}
          />
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 