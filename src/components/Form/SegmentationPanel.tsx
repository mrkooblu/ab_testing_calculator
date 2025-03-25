import React, { useState } from 'react';
import styled from 'styled-components';
import { ABTestFormData, VariantKey } from '../../types';

// Define segment structure
export interface Segment {
  id: string;
  name: string;
  description?: string;
  variants: {
    [key in VariantKey]?: {
      visitors: number;
      conversions: number;
    };
  };
}

interface SegmentationPanelProps {
  testData: ABTestFormData;
  activeVariantKeys: VariantKey[];
  onSegmentDataUpdate: (segments: Segment[]) => void;
}

// Styled components
const Container = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
`;

const SegmentsList = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SegmentItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SegmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SegmentTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SegmentDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const VariantDataCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const VariantTitle = styled.h5`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InputLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}dd;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.error}10;
  }
`;

/**
 * Component for segmentation analysis in A/B testing
 */
export const SegmentationPanel: React.FC<SegmentationPanelProps> = ({
  testData,
  activeVariantKeys,
  onSegmentDataUpdate,
}) => {
  // State for segments
  const [segments, setSegments] = useState<Segment[]>([]);
  const [newSegmentName, setNewSegmentName] = useState<string>('');
  const [newSegmentDescription, setNewSegmentDescription] = useState<string>('');
  
  // Create empty segment data structure
  const createEmptySegmentVariants = () => {
    const variants: Segment['variants'] = {};
    activeVariantKeys.forEach(key => {
      variants[key] = { visitors: 0, conversions: 0 };
    });
    return variants;
  };
  
  // Add a new segment
  const handleAddSegment = () => {
    if (!newSegmentName.trim()) return;
    
    const newSegment: Segment = {
      id: `segment-${Date.now()}`,
      name: newSegmentName,
      description: newSegmentDescription,
      variants: createEmptySegmentVariants(),
    };
    
    const updatedSegments = [...segments, newSegment];
    setSegments(updatedSegments);
    onSegmentDataUpdate(updatedSegments);
    
    // Reset form
    setNewSegmentName('');
    setNewSegmentDescription('');
  };
  
  // Remove a segment
  const handleRemoveSegment = (segmentId: string) => {
    const updatedSegments = segments.filter(segment => segment.id !== segmentId);
    setSegments(updatedSegments);
    onSegmentDataUpdate(updatedSegments);
  };
  
  // Update segment data (visitors/conversions)
  const handleSegmentDataChange = (segmentId: string, variantKey: VariantKey, field: 'visitors' | 'conversions', value: number) => {
    const updatedSegments = segments.map(segment => {
      if (segment.id === segmentId) {
        // Deep clone the segment
        const updatedSegment = {...segment};
        
        // Ensure variants object exists
        if (!updatedSegment.variants) {
          updatedSegment.variants = {};
        }
        
        // Get current values or defaults
        const currentValues = updatedSegment.variants[variantKey] || { visitors: 0, conversions: 0 };
        
        // Update the specified field
        updatedSegment.variants[variantKey] = {
          visitors: currentValues.visitors || 0,
          conversions: currentValues.conversions || 0,
          [field]: value,
        };
        
        return updatedSegment;
      }
      return segment;
    });
    
    setSegments(updatedSegments);
    onSegmentDataUpdate(updatedSegments);
  };
  
  return (
    <Container>
      <Title>Segmentation Analysis</Title>
      
      <Description>
        Analyze your A/B test results across different user segments to gain deeper insights.
        Add segments such as "Mobile Users", "Desktop Users", "New Visitors", etc. and input their test data.
      </Description>
      
      <SegmentsList>
        {segments.map(segment => (
          <SegmentItem key={segment.id}>
            <SegmentHeader>
              <SegmentTitle>{segment.name}</SegmentTitle>
              <RemoveButton onClick={() => handleRemoveSegment(segment.id)}>
                Remove
              </RemoveButton>
            </SegmentHeader>
            
            {segment.description && (
              <SegmentDescription>{segment.description}</SegmentDescription>
            )}
            
            <DataGrid>
              {activeVariantKeys.map(variantKey => (
                <VariantDataCard key={`${segment.id}-${variantKey}`}>
                  <VariantTitle>Variant {variantKey}</VariantTitle>
                  
                  <InputContainer>
                    <InputLabel>Visitors</InputLabel>
                    <Input
                      type="number"
                      min="0"
                      value={segment.variants[variantKey]?.visitors || 0}
                      onChange={(e) => handleSegmentDataChange(
                        segment.id,
                        variantKey,
                        'visitors',
                        parseInt(e.target.value) || 0
                      )}
                    />
                  </InputContainer>
                  
                  <InputContainer>
                    <InputLabel>Conversions</InputLabel>
                    <Input
                      type="number"
                      min="0"
                      max={segment.variants[variantKey]?.visitors || 0}
                      value={segment.variants[variantKey]?.conversions || 0}
                      onChange={(e) => handleSegmentDataChange(
                        segment.id,
                        variantKey,
                        'conversions',
                        parseInt(e.target.value) || 0
                      )}
                    />
                  </InputContainer>
                </VariantDataCard>
              ))}
            </DataGrid>
          </SegmentItem>
        ))}
      </SegmentsList>
      
      <SegmentItem>
        <SegmentTitle>Add New Segment</SegmentTitle>
        
        <InputContainer>
          <InputLabel>Segment Name</InputLabel>
          <Input
            type="text"
            placeholder="e.g., Mobile Users"
            value={newSegmentName}
            onChange={(e) => setNewSegmentName(e.target.value)}
          />
        </InputContainer>
        
        <InputContainer>
          <InputLabel>Segment Description (optional)</InputLabel>
          <Input
            type="text"
            placeholder="Describe this segment..."
            value={newSegmentDescription}
            onChange={(e) => setNewSegmentDescription(e.target.value)}
          />
        </InputContainer>
        
        <ButtonContainer>
          <Button
            onClick={handleAddSegment}
            disabled={!newSegmentName.trim()}
          >
            Add Segment
          </Button>
        </ButtonContainer>
      </SegmentItem>
    </Container>
  );
}; 