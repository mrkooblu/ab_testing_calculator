import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { VariantKey, VariantType, ABTestFormData, VariantData } from '../../types';

import Button from '../common/Button';
import Input from '../common/Input';
import RadioGroup from '../common/RadioGroup';
import { calculateConversionRate } from '../../utils/statsCalculator';
import { updateBrowserURL } from '../../utils/urlParameters';
import Tooltip from '../common/Tooltip';

interface ABTestFormProps {
  onCalculate: (formData: ABTestFormData) => void;
  initialData?: ABTestFormData;
}

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const FormTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`;

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const SectionTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const VariantContainer = styled.div<{ variantType: VariantType }>`
  background-color: ${({ theme, variantType }) => {
    switch(variantType) {
      case 'A': return 'rgba(67, 97, 238, 0.1)';
      case 'B': return 'rgba(247, 37, 133, 0.1)';
      case 'C': return 'rgba(114, 9, 183, 0.1)';
      case 'D': return 'rgba(58, 12, 163, 0.1)';
      default: return 'rgba(67, 97, 238, 0.1)';
    }
  }};
  border-left: 4px solid ${({ theme, variantType }) => {
    switch(variantType) {
      case 'A': return theme.colors.variantA;
      case 'B': return theme.colors.variantB;
      case 'C': return theme.colors.variantC;
      case 'D': return theme.colors.variantD;
      default: return theme.colors.variantA;
    }
  }};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const RemoveVariantButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.short};

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background-color: rgba(244, 67, 54, 0.1);
  }
`;

const VariantTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const VariantFieldsContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

const StatLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;

  & > div {
    position: relative;
  }
`;

const StatValue = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background};
  width: 100%;
  text-align: right;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

// Helper function to get the variant type (A, B, C, D) from the variant key
const getVariantTypeFromKey = (key: VariantKey): VariantType => {
  switch (key) {
    case 'variantA': return 'A';
    case 'variantB': return 'B';
    case 'variantC': return 'C';
    case 'variantD': return 'D';
    default: return 'A';
  }
};

// Add improved styling for the Add Variant button container
const AddVariantButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

// Add these new styled components for the Test Settings
const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RadioGroupContainer = styled.div`
  position: relative;
`;

const HorizontalRadioOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const RadioOption = styled.label<{ isSelected: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme, isSelected }) => 
    isSelected ? `${theme.colors.primary}10` : theme.colors.background};
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme, isSelected }) => 
      isSelected ? `${theme.colors.primary}20` : `${theme.colors.primary}05`};
  }
  
  input {
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

// Add a collapsible container for the advanced settings
const CollapsibleSection = styled.div`
  position: relative;
`;

const ExpandIcon = styled.span<{ isOpen: boolean }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  position: relative;
  transition: transform 0.3s ease;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.text.primary};
    transition: transform 0.3s ease, background-color 0.2s ease;
  }
  
  &::before {
    top: 7px;
    left: 0;
    width: 16px;
    height: 2px;
  }
  
  &::after {
    top: 0;
    left: 7px;
    width: 2px;
    height: 16px;
    transform: ${({ isOpen }) => isOpen ? 'rotate(90deg) scale(0)' : 'rotate(0) scale(1)'};
  }
`;

const CollapsibleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
  
  &:hover ${ExpandIcon}::before {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:hover ${ExpandIcon}::after {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.sm}`};
    min-height: 54px; /* Larger touch target */
  }
`;

const CollapsibleTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  height: ${({ isOpen }) => (isOpen ? 'auto' : '0')};
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  transition: opacity 0.3s ease-in-out;
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
`;

const SettingsInnerContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const HelperText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const SelectedSettingsPreview = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    gap: ${({ theme }) => theme.spacing.xs};
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

const SettingTag = styled.span`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.xs}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

// Add a tooltip component for explaining settings
const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  margin-left: ${({ theme }) => theme.spacing.xs};
`;

const TooltipIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.text.secondary};
  color: white;
  font-size: 10px;
  cursor: help;
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.text.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  width: 200px;
  z-index: 10;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-align: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.text.primary} transparent transparent transparent;
  }
  
  ${TooltipIcon}:hover + & {
    visibility: visible;
    opacity: 1;
  }
`;

// Tooltip component for explaining settings
const SettingTooltip: React.FC<{ content: string }> = ({ content }) => (
  <TooltipContainer>
    <TooltipIcon>?</TooltipIcon>
    <TooltipContent>{content}</TooltipContent>
  </TooltipContainer>
);

// Local tooltip for consistency with Input component
const InputTooltip = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.text.secondary};
  color: white;
  font-size: 10px;
  cursor: help;
  z-index: 5; /* Ensure the icon itself has a z-index */
`;

// Fixed positioning tooltip that looks like the screenshot
const TooltipData = styled.div`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  background-color: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
  width: max-content;
  max-width: 250px;
  font-size: 12px;
  line-height: 1.4;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  pointer-events: none; /* Prevent tooltip from blocking hover */
  
  /* Position the tooltip */
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px; /* Space between tooltip and icon */
  transition: opacity 0.2s, visibility 0.2s;
  
  /* Arrow pointing down */
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(33, 33, 33, 0.95) transparent transparent transparent;
  }
  
  ${InputTooltip}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

// Wrapper component to create a proper positioning context
const TooltipWrapper = styled.span`
  position: relative;
  display: inline-flex;
  margin-left: ${({ theme }) => theme.spacing.xs};
`;

const ABTestForm: React.FC<ABTestFormProps> = ({ onCalculate, initialData }): JSX.Element => {
  // Initialize form data
  const [formData, setFormData] = useState<ABTestFormData>({
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
  });

  // Set active variants based on initial data
  const [activeVariantKeys, setActiveVariantKeys] = useState<VariantKey[]>(['variantA', 'variantB']);
  
  // Track form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Add state for test settings collapse
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Improve useEffect for initialData handling
  useEffect(() => {
    if (initialData) {
      // Reset any form errors
      setFormErrors({});
      
      // Apply the new data
      setFormData(initialData);
      
      // Set active variants based on initialData
      const activeKeys = Object.entries(initialData.variants)
        .filter(([_, variant]) => variant.visitors > 0)
        .map(([key]) => key as VariantKey);
      
      // Ensure at least 2 variants are active
      if (activeKeys.length < 2) {
        if (!activeKeys.includes('variantA')) activeKeys.push('variantA');
        if (!activeKeys.includes('variantB') && activeKeys.length < 2) activeKeys.push('variantB');
      }
      
      setActiveVariantKeys(activeKeys);
      
      // Auto-expand settings if non-default settings are used
      const hasNonDefaultSettings = 
        initialData.settings.hypothesisType !== 'one-sided' || 
        initialData.settings.confidenceLevel !== 95;
      
      if (hasNonDefaultSettings) {
        setIsSettingsOpen(true);
      }
    }
  }, [initialData]); // Only re-run when initialData changes

  // Handle numeric input changes
  const handleInputChange = (
    variantKey: VariantKey,
    field: 'visitors' | 'conversions',
    value: string
  ): void => {
    // Ensure we have a valid number or default to 0
    const numValue = value === '' ? 0 : Number(value);
    
    // Only update if we have a valid number
    if (!isNaN(numValue)) {
      // Create temporary copy of variants to work with
      const updatedVariants = { ...formData.variants };
      const updatedVariant = { ...updatedVariants[variantKey] };
      
      // Update the specific field
      updatedVariant[field] = numValue;
      
      // Recalculate conversion rate
      const visitors = field === 'visitors' ? numValue : updatedVariant.visitors;
      const conversions = field === 'conversions' ? numValue : updatedVariant.conversions;
      
      // Ensure conversions can't exceed visitors
      const validatedConversions = Math.min(conversions, visitors);
      if (field === 'conversions' && validatedConversions !== conversions) {
        updatedVariant.conversions = validatedConversions;
      }
      
      updatedVariant.conversionRate = calculateConversionRate(visitors, validatedConversions);
      
      // Update the variant in our temporary variants object
      updatedVariants[variantKey] = updatedVariant;
      
      // Update the form data with all changes at once
      setFormData(prevData => ({
        ...prevData,
        variants: updatedVariants
      }));
      
      // Clear error for this field if it exists
      if (formErrors[`${variantKey}.${field}`]) {
        setFormErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[`${variantKey}.${field}`];
          return newErrors;
        });
      }
      
      // Validate that conversions are not greater than visitors
      if (
        field === 'conversions' && 
        numValue > updatedVariant.visitors
      ) {
        setFormErrors(prevErrors => ({
          ...prevErrors,
          [`${variantKey}.${field}`]: 'Conversions cannot exceed visitors'
        }));
      }
      
      // Validate that values are not negative
      if (numValue < 0) {
        setFormErrors(prevErrors => ({
          ...prevErrors,
          [`${variantKey}.${field}`]: 'Value cannot be negative'
        }));
      }
    }
  };

  // Handle settings changes
  const handleSettingChange = (
    setting: 'hypothesisType' | 'confidenceLevel',
    value: string | number
  ) => {
    setFormData(prevData => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        [setting]: setting === 'confidenceLevel' ? Number(value) : value
      }
    }));
  };

  // Add a new variant
  const handleAddVariant = () => {
    if (activeVariantKeys.length >= 4) return;
    
    const availableKeys: VariantKey[] = ['variantA', 'variantB', 'variantC', 'variantD']
      .filter(key => !activeVariantKeys.includes(key as VariantKey)) as VariantKey[];
    
    if (availableKeys.length > 0) {
      setActiveVariantKeys([...activeVariantKeys, availableKeys[0]]);
    }
  };

  // Remove a variant
  const handleRemoveVariant = (variantToRemove: VariantKey) => {
    if (activeVariantKeys.length <= 2) return;
    
    setActiveVariantKeys(activeVariantKeys.filter(key => key !== variantToRemove));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Check if at least two variants have visitors
    const variantsWithVisitors = activeVariantKeys.filter(
      key => Number(formData.variants[key].visitors) > 0
    );
    
    if (variantsWithVisitors.length < 2) {
      newErrors['general'] = 'At least two variants must have visitors';
      isValid = false;
    }
    
    // Validate each active variant's inputs
    activeVariantKeys.forEach(variantKey => {
      const variant = formData.variants[variantKey];
      
      if (Number(variant.conversions) > Number(variant.visitors)) {
        newErrors[`${variantKey}.conversions`] = 'Conversions cannot exceed visitors';
        isValid = false;
      }
      
      if (Number(variant.visitors) < 0) {
        newErrors[`${variantKey}.visitors`] = 'Value cannot be negative';
        isValid = false;
      }
      
      if (Number(variant.conversions) < 0) {
        newErrors[`${variantKey}.conversions`] = 'Value cannot be negative';
        isValid = false;
      }
    });
    
    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Create a copy of the variants with freshly calculated conversion rates
    const processedVariants = Object.entries(formData.variants).reduce((acc, [key, variant]) => {
      const variantKey = key as VariantKey;
      const visitors = Number(variant.visitors);
      const conversions = Number(variant.conversions);
      const freshConversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
      
      acc[variantKey] = {
        ...variant,
        visitors: visitors,
        conversions: conversions,
        conversionRate: freshConversionRate
      };
      return acc;
    }, {} as Record<VariantKey, VariantData>);
    
    // Filter only active variants for the calculation
    const calculationData: ABTestFormData = {
      variants: processedVariants,
      settings: { ...formData.settings }
    };
    
    // Update URL parameters with the test data
    updateBrowserURL(calculationData);
    
    // Call the onCalculate callback with form data
    onCalculate(calculationData);
  };

  // Settings toggle handler
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <FormContainer>
      <FormTitle>A/B Testing Calculator</FormTitle>
      
      <form onSubmit={handleSubmit}>
        {activeVariantKeys.map(variantKey => {
          const variant = formData.variants[variantKey];
          const variantType = getVariantTypeFromKey(variantKey);
          
          return (
            <VariantContainer 
              key={`${variantKey}-${variant.visitors}-${variant.conversions}`} 
              variantType={variantType}
            >
              {activeVariantKeys.length > 2 && (
                <RemoveVariantButton
                  type="button"
                  onClick={() => handleRemoveVariant(variantKey)}
                  aria-label={`Remove variant ${variantType}`}
                >
                  ✕
                </RemoveVariantButton>
              )}
              
              <VariantTitle>Variant {variantType}</VariantTitle>
              
              <VariantFieldsContainer>
                <div>
                  <Input
                    id={`${variantKey}-visitors`}
                    label="Visitors"
                    type="number"
                    min={0}
                    value={variant.visitors}
                    onChange={(e) => handleInputChange(variantKey, 'visitors', e.target.value)}
                    error={formErrors[`${variantKey}.visitors`]}
                    fullWidth
                    key={`visitors-${variant.visitors}`}
                    allowMultipleNumbers={true}
                    tooltipText="Enter a single number or paste multiple numbers separated by commas or spaces"
                  />
                </div>
                
                <div>
                  <Input
                    id={`${variantKey}-conversions`}
                    label="Conversions"
                    type="number"
                    min={0}
                    max={variant.visitors}
                    value={variant.conversions}
                    onChange={(e) => handleInputChange(variantKey, 'conversions', e.target.value)}
                    error={formErrors[`${variantKey}.conversions`]}
                    fullWidth
                    key={`conversions-${variant.conversions}`}
                    allowMultipleNumbers={true}
                    tooltipText="Enter a single number or paste multiple numbers separated by commas or spaces"
                  />
                </div>
                
                <StatCard>
                  <StatLabel>
                    Conversion Rate
                    <TooltipWrapper>
                      <InputTooltip>
                        ?
                        <TooltipData>
                          Calculated as (Conversions / Visitors) × 100%. This value updates automatically based on your inputs.
                        </TooltipData>
                      </InputTooltip>
                    </TooltipWrapper>
                  </StatLabel>
                  <StatValue>
                    {variant.visitors > 0 
                      ? ((variant.conversions / variant.visitors) * 100).toFixed(2) 
                      : '0.00'}%
                  </StatValue>
                </StatCard>
              </VariantFieldsContainer>
            </VariantContainer>
          );
        })}
        
        {activeVariantKeys.length < 4 && (
          <AddVariantButtonContainer>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVariant}
              fullWidth
            >
              + Add Variant
            </Button>
          </AddVariantButtonContainer>
        )}
        
        <CollapsibleSection>
          <CollapsibleHeader onClick={toggleSettings}>
            <CollapsibleTitle>
              <ExpandIcon isOpen={isSettingsOpen} />
              Test Settings
              {!isSettingsOpen && (
                <HelperText>(click to customize)</HelperText>
              )}
            </CollapsibleTitle>
            <SelectedSettingsPreview>
              <SettingTag>Hypothesis: {formData.settings.hypothesisType === 'one-sided' ? 'One-sided' : 'Two-sided'}</SettingTag>
              <SettingTag>Confidence: {formData.settings.confidenceLevel}%</SettingTag>
            </SelectedSettingsPreview>
          </CollapsibleHeader>
          
          <CollapsibleContent isOpen={isSettingsOpen}>
            <SettingsInnerContent>
              <SettingsGrid>
                <RadioGroupContainer>
                  <StatLabel>
                    Hypothesis Type
                    <Tooltip
                      content="One-sided tests detect changes in one direction only (e.g., improvement). Two-sided tests detect changes in both directions (improvement or decline)."
                    />
                  </StatLabel>
                  <HorizontalRadioOptions>
                    {[
                      { value: 'one-sided', label: 'One-sided' },
                      { value: 'two-sided', label: 'Two-sided' }
                    ].map(option => (
                      <RadioOption 
                        key={option.value}
                        isSelected={formData.settings.hypothesisType === option.value}
                      >
                        <input
                          type="radio"
                          name="hypothesisType"
                          value={option.value}
                          checked={formData.settings.hypothesisType === option.value}
                          onChange={() => handleSettingChange('hypothesisType', option.value)}
                        />
                        {option.label}
                      </RadioOption>
                    ))}
                  </HorizontalRadioOptions>
                </RadioGroupContainer>
                
                <RadioGroupContainer>
                  <StatLabel>
                    Confidence Level
                    <Tooltip
                      content="Higher confidence levels (95%, 99%) reduce the chance of false positives but require stronger evidence to detect real effects."
                    />
                  </StatLabel>
                  <HorizontalRadioOptions>
                    {[
                      { value: '90', label: '90%' },
                      { value: '95', label: '95%' },
                      { value: '99', label: '99%' }
                    ].map(option => (
                      <RadioOption 
                        key={option.value}
                        isSelected={formData.settings.confidenceLevel.toString() === option.value}
                      >
                        <input
                          type="radio"
                          name="confidenceLevel"
                          value={option.value}
                          checked={formData.settings.confidenceLevel.toString() === option.value}
                          onChange={() => handleSettingChange('confidenceLevel', option.value)}
                        />
                        {option.label}
                      </RadioOption>
                    ))}
                  </HorizontalRadioOptions>
                </RadioGroupContainer>
              </SettingsGrid>
            </SettingsInnerContent>
          </CollapsibleContent>
        </CollapsibleSection>
        
        {formErrors['general'] && (
          <ErrorMessage>{formErrors['general']}</ErrorMessage>
        )}
        
        <FormActions>
          <Button
            type="submit"
            variant="primary"
            disabled={Object.keys(formErrors).length > 0}
            fullWidth
          >
            Calculate Results
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  );
};

export default ABTestForm; 