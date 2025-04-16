import React, { useState } from 'react';
import styled from 'styled-components';
import { ABTestFormData } from '../../types';

interface ExampleDataSetsProps {
  onSelectExample: (example: ABTestFormData) => void;
}

const ExamplesContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ExamplesTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extraBold};
  line-height: 1.4;
`;

// Improved Layout - Switch to a 2x3 grid with larger cards
const ExampleCards = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

// Enhanced card design with better shadows and hover effects
const ExampleCard = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

// Better Visual Hierarchy - More prominent titles
const ExampleTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  padding-right: 80px; // Make room for the significance badge
`;

// Streamlined Content - Expandable description
const ExampleDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const TruncatedText = styled.p`
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ReadMore = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

// Visual Data Representation - Container for the bar chart
const VariantsComparisonChart = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const BarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const BarLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-bottom: 2px;
`;

const BarWrapper = styled.div`
  height: 12px;
  width: 100%;
  background-color: ${({ theme }) => `${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  overflow: hidden;
`;

const Bar = styled.div<{ width: number; variant: string }>`
  height: 100%;
  width: ${({ width }) => `${width}%`};
  background-color: ${({ variant }) => {
    switch(variant) {
      case 'A': return '#2E5CE5'; // Original primary blue
      case 'B': return '#1A4BDB'; // Deeper blue variant
      case 'C': return '#4270EF'; // Brighter blue variant
      case 'D': return '#3D4DAA'; // More navy-tinted blue
      default: return '#2E5CE5';
    }
  }};
  transition: width 0.5s ease;
`;

// Better Visual Hierarchy - Move significance badge to top right
const SignificanceBadge = styled.div<{ isSignificant: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, isSignificant }) => 
    isSignificant ? theme.colors.success : theme.colors.error};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// More compact stats display
const VariantsStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatCard = styled.div<{ variant: string }>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  border-left: 3px solid ${({ variant }) => {
    switch(variant) {
      case 'A': return '#2E5CE5'; // Original primary blue
      case 'B': return '#1A4BDB'; // Deeper blue variant
      case 'C': return '#4270EF'; // Brighter blue variant
      case 'D': return '#3D4DAA'; // More navy-tinted blue
      default: return '#2E5CE5';
    }
  }};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const StatLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

// More prominent call to action
const ApplyButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Example datasets
const examples: {name: string, description: string, isSignificant: boolean, data: ABTestFormData}[] = [
  {
    name: "Clear Significance",
    description: "A test with a large sample size and a meaningful difference between variants, resulting in clear statistical significance.",
    isSignificant: true,
    data: {
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
    }
  },
  {
    name: "Borderline Significance",
    description: "A test with a moderate sample size and a small improvement, resulting in borderline statistical significance.",
    isSignificant: true,
    data: {
      variants: {
        variantA: { type: 'A', visitors: 5000, conversions: 250, conversionRate: 5 },
        variantB: { type: 'B', visitors: 5000, conversions: 280, conversionRate: 5.6 },
        variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
        variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
      },
      settings: {
        hypothesisType: 'one-sided',
        confidenceLevel: 95
      }
    }
  },
  {
    name: "No Significance",
    description: "A test with insufficient sample size to detect the small observed difference, resulting in no statistical significance.",
    isSignificant: false,
    data: {
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
    }
  },
  {
    name: "Multiple Variants",
    description: "A test comparing multiple variants against a control, with varying levels of performance and significance.",
    isSignificant: true,
    data: {
      variants: {
        variantA: { type: 'A', visitors: 5000, conversions: 250, conversionRate: 5 },
        variantB: { type: 'B', visitors: 5000, conversions: 300, conversionRate: 6 },
        variantC: { type: 'C', visitors: 5000, conversions: 275, conversionRate: 5.5 },
        variantD: { type: 'D', visitors: 5000, conversions: 225, conversionRate: 4.5 },
      },
      settings: {
        hypothesisType: 'two-sided',
        confidenceLevel: 95
      }
    }
  },
  {
    name: "High Confidence Test",
    description: "A test with a very high confidence level requirement (99%), showing how increasing confidence standards affects significance.",
    isSignificant: false,
    data: {
      variants: {
        variantA: { type: 'A', visitors: 2000, conversions: 100, conversionRate: 5 },
        variantB: { type: 'B', visitors: 2000, conversions: 120, conversionRate: 6 },
        variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
        variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
      },
      settings: {
        hypothesisType: 'one-sided',
        confidenceLevel: 99
      }
    }
  },
  {
    name: "Two-sided vs One-sided",
    description: "Compare how the same data yields different results with one-sided and two-sided hypothesis tests.",
    isSignificant: true,
    data: {
      variants: {
        variantA: { type: 'A', visitors: 3000, conversions: 150, conversionRate: 5 },
        variantB: { type: 'B', visitors: 3000, conversions: 180, conversionRate: 6 },
        variantC: { type: 'C', visitors: 0, conversions: 0, conversionRate: 0 },
        variantD: { type: 'D', visitors: 0, conversions: 0, conversionRate: 0 },
      },
      settings: {
        hypothesisType: 'two-sided',
        confidenceLevel: 95
      }
    }
  }
];

// Helper function to get max conversion rate for bar chart scaling
const getMaxConversionRate = (variants: any): number => {
  return Math.max(
    ...Object.values(variants)
      .filter((v: any) => v.visitors > 0)
      .map((v: any) => v.conversionRate)
  );
};

const ExampleDataSets: React.FC<ExampleDataSetsProps> = ({ onSelectExample }) => {
  // State to track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<number[]>([]);
  
  const toggleDescription = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedDescriptions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  return (
    <ExamplesContainer>
      <ExamplesTitle>Interactive Example Data Sets</ExamplesTitle>
      
      <ExampleCards>
        {examples.map((example, index) => {
          const maxRate = getMaxConversionRate(example.data.variants);
          const isExpanded = expandedDescriptions.includes(index);
          
          return (
            <ExampleCard key={index} onClick={() => onSelectExample(example.data)}>
              {/* Better Visual Hierarchy - Significance badge at top right */}
              <SignificanceBadge isSignificant={example.isSignificant}>
                {example.isSignificant ? 'Significant' : 'Not Significant'}
              </SignificanceBadge>
              
              <ExampleTitle>{example.name}</ExampleTitle>
              
              {/* Streamlined Content - Expandable description */}
              <ExampleDescription>
                {isExpanded ? (
                  <>
                    <p>{example.description}</p>
                    <ReadMore onClick={(e) => toggleDescription(index, e)}>
                      Show Less
                    </ReadMore>
                  </>
                ) : (
                  <>
                    <TruncatedText>{example.description}</TruncatedText>
                    <ReadMore onClick={(e) => toggleDescription(index, e)}>
                      Read More
                    </ReadMore>
                  </>
                )}
              </ExampleDescription>
              
              {/* Visual Data Representation - Simple bar chart */}
              <VariantsComparisonChart>
                <BarContainer>
                  {Object.entries(example.data.variants)
                    .filter(([_, variant]) => variant.visitors > 0)
                    .map(([key, variant]) => (
                      <div key={key}>
                        <BarLabel>
                          <span>Variant {variant.type}</span>
                          <span>{variant.conversionRate}%</span>
                        </BarLabel>
                        <BarWrapper>
                          <Bar 
                            variant={variant.type} 
                            width={(variant.conversionRate / maxRate) * 100} 
                          />
                        </BarWrapper>
                      </div>
                    ))}
                </BarContainer>
              </VariantsComparisonChart>
              
              {/* More compact stats display */}
              <VariantsStats>
                {Object.entries(example.data.variants)
                  .filter(([_, variant]) => variant.visitors > 0)
                  .map(([key, variant]) => (
                    <StatCard key={key} variant={variant.type}>
                      <StatLabel>Variant {variant.type}</StatLabel>
                      <StatValue>{variant.visitors.toLocaleString()} visitors</StatValue>
                      <StatValue>{variant.conversions.toLocaleString()} conversions</StatValue>
                    </StatCard>
                  ))}
              </VariantsStats>
              
              <ApplyButton onClick={(e) => { 
                e.stopPropagation(); 
                onSelectExample(example.data);
              }}>
                Apply Example
              </ApplyButton>
            </ExampleCard>
          );
        })}
      </ExampleCards>
    </ExamplesContainer>
  );
};

export default ExampleDataSets; 