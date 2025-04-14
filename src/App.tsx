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
import Tooltip from './components/common/Tooltip';

// Define a key for storing wizard completion in localStorage
const WIZARD_COMPLETED_KEY = 'ab_testing_calculator_wizard_completed';
// Define a key for tracking page load state
const SESSION_KEY = 'ab_testing_calculator_session';

// Styled components for the App
const AppWrapper = styled.div`
  width: 100%;
`;

const AppContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1rem;
  }
`;

// Full width header that extends beyond the AppContainer
const HeaderSection = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: 4.2rem 0;
  background: #121737 url('/tools-background.svg') no-repeat center center;
  background-size: cover;
  width: 100%;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem 0;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 850px;
  margin: 0;
  padding: 0 2rem;
  text-align: left;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 100%;
    padding: 0 1rem;
  }
`;

const MainTitle = styled.h1`
  font-family: 'Manrope', sans-serif;
  font-size: 44px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 2rem;
  line-height: 1.3;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
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
  font-family: 'Manrope', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  max-width: 750px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const GetStartedButton = styled.button`
  font-family: 'Manrope', sans-serif;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
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
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 1.5rem 1rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const TutorialTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
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
    // Check if this is a page refresh by checking sessionStorage
    const isPageRefresh = sessionStorage.getItem(SESSION_KEY) === 'active';
    
    // Set session flag for future page loads
    sessionStorage.setItem(SESSION_KEY, 'active');
    
    // If this is a page refresh, clear URL parameters
    if (isPageRefresh && window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
      return; // Exit early to prevent processing URL parameters
    }
    
    // Only process URL parameters if not a page refresh
    if (window.location.search) {
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
    }
    
    // Check if user has completed the wizard before
    const hasCompletedWizard = localStorage.getItem(WIZARD_COMPLETED_KEY) === 'true';
    if (!hasCompletedWizard) {
      setShowWizard(true);
    }
    
    // Add event listener for beforeunload to reset session on hard refreshes
    const handleBeforeUnload = () => {
      // Keep the session active, but ensure URL params are cleared on next load
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  
  // Add a reset function to clear state and URL parameters
  const handleReset = () => {
    // Clear state
    setTestData(null);
    setIsCalculated(false);
    setSegments([]);
    
    // Clear URL parameters
    window.history.pushState({}, '', window.location.pathname);
    
    // Scroll to top of calculator
    setTimeout(() => {
      if (calculatorRef.current) {
        calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
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
    setActiveTab('calculator');
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
          <TutorialTitle>
            Interactive Tutorial: Understanding A/B Testing
            <Tooltip
              title="Interactive Tutorial"
              content={
                <>
                  <p>This interactive tutorial guides you through the basics of A/B testing and how to use this calculator effectively.</p>
                  <p>Each step explains key concepts with examples to help you understand statistical significance in A/B tests.</p>
                </>
              }
            />
          </TutorialTitle>
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
      <AppWrapper>
        <HeaderSection>
          <AppContainer>
            <HeroContent>
              <MainTitle>
                A/B Testing Significance Calculator
              </MainTitle>
              <Description>
                Are your results statistically significant? Find out if your test variations made a 
                real difference. Our calculator helps you determine significance, analyze 
                conversion rates, and make data-driven decisions.
              </Description>
            </HeroContent>
          </AppContainer>
        </HeaderSection>

        <AppContainer>
          <TabsContainer 
            tabs={mainTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          {/* Add the reset button after the container that displays the active tab content */}
          {isCalculated && activeTab === 'calculator' && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <button 
                onClick={handleReset}
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text.primary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Reset Calculator
              </button>
            </div>
          )}
          
          {showWizard && (
            <SetupWizard 
              onComplete={handleWizardComplete} 
              onApplyExample={handleApplyExample}
            />
          )}
        </AppContainer>
      </AppWrapper>
    </ThemeProvider>
  );
};

export default App; 