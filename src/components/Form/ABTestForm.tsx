import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { VariantKey, VariantType, ABTestFormData, VariantData } from '../../types';

import Button from '../common/Button';
import Input from '../common/Input';
import RadioGroup from '../common/RadioGroup';
import { calculateConversionRate } from '../../utils/statsCalculator';
import { updateBrowserURL } from '../../utils/urlParameters';
import Tooltip from '../common/Tooltip';
import { validateABTestForm, ValidationResult, ValidationWarning } from '../../utils/validationUtils';
import ValidationWarningBanner from '../common/ValidationWarningBanner';

interface ABTestFormProps {
  onCalculate: (formData: ABTestFormData) => void;
  initialData?: ABTestFormData;
}

const FormContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
  
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.sm};
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

const VariantContainer = styled.div<{ isFirst?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  position: relative;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const RemoveVariantButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.error};
    color: white;
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
`;

const VariantTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const VariantFieldsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    margin: -${({ theme }) => theme.spacing.xs};
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 200px;
  padding: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xs};
  }
  
  @media (max-width: 480px) {
    min-width: 100%;
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
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

const CollapsibleHeader = styled.div.attrs<{
  tabIndex?: number;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}>((props) => ({
  tabIndex: props.tabIndex || 0,
  'aria-expanded': props['aria-expanded'],
  'aria-controls': props['aria-controls'],
}))`
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
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
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

const CollapsibleContent = styled.div.attrs<{
  isOpen: boolean;
  id?: string;
}>((props) => ({
  id: props.id
}))<{ isOpen: boolean }>`
  height: ${({ isOpen }) => (isOpen ? 'auto' : '0')};
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  transition: opacity 0.3s ease-in-out;
  
  ${({ isOpen }) => !isOpen && `
    overflow: hidden;
    pointer-events: none;
  `}
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
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
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

// Create a more reliable tabIndex generation function
const getTabIndex = (variantIndex: number, field: 'visitors' | 'conversions'): number => {
  const baseIndex = variantIndex * 10; // Use multiples of 10 to leave room for potential elements in between
  return field === 'visitors' ? baseIndex + 1 : baseIndex + 2;
};

// Add the missing styled components for the settings section
const SettingsToggle = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color 0.2s;
  min-height: 44px; /* Minimum touch target height */
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.focus.ring};
  }
  
  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const SettingsIcon = styled.span<{ isOpen: boolean }>`
  margin-right: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0.7)};
  transition: opacity 0.2s;
`;

const SettingsLabel = styled.span`
  flex: 1;
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s ease-in-out;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SettingsContent = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const SettingsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin: 0;
  }
`;

const SettingGroup = styled.div`
  flex: 1;
  min-width: 250px;
  padding: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    min-width: 100%;
    padding: ${({ theme }) => theme.spacing.sm} 0;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const SettingLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
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
  
  // Track form validation errors - update type to support our validation structure
  const [formErrors, setFormErrors] = useState<Record<string, Record<string, any>>>({});

  // Add state for test settings collapse
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Add state for validation warnings
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);

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
  }, [initialData]);

  // Handle numeric input changes
  const handleInputChange = (
    variantKey: VariantKey,
    field: 'visitors' | 'conversions',
    value: string
  ): void => {
    // Process comma-separated values
    const processedValue = value.replace(/,/g, '');
    
    // Validate input is a number
    if (processedValue && !/^[0-9]*$/.test(processedValue)) {
      return; // Don't update if not a positive integer
    }
    
    // Convert to number
    const numValue = processedValue ? parseInt(processedValue, 10) : 0;
    
    // Update the form data
    setFormData((prevData) => {
      const newVariants = { ...prevData.variants };
      newVariants[variantKey] = {
        ...newVariants[variantKey],
        [field]: numValue,
      };
      
      // Update conversion rate if visitors or conversions changed
      if (field === 'visitors' || field === 'conversions') {
        const variant = newVariants[variantKey];
        const convRate = calculateConversionRate(variant.visitors, variant.conversions);
        newVariants[variantKey].conversionRate = convRate;
        
        // If conversions > visitors, adjust conversions to equal visitors
        if (variant.conversions > variant.visitors && variant.visitors > 0) {
          newVariants[variantKey].conversions = variant.visitors;
          newVariants[variantKey].conversionRate = calculateConversionRate(
            variant.visitors,
            variant.visitors
          );
        }
      }
      
      const updatedData = {
        ...prevData,
        variants: newVariants,
      };
      
      // Collect warnings with the updated data immediately
      const validationResult = validateABTestForm(updatedData);
      setTimeout(() => {
        setValidationWarnings(validationResult.warnings);
      }, 0);
      
      return updatedData;
    });
  };

  // Update the collect warnings function to use the latest state
  const collectWarnings = () => {
    // This function will now be called with the current formData
    setFormData(currentData => {
      const validationResult = validateABTestForm(currentData);
      setValidationWarnings(validationResult.warnings);
      return currentData; // Return the same state to avoid an unnecessary update
    });
  };

  // Handle settings changes - update to handle proper event type from RadioGroup
  const handleSettingChange = (
    setting: 'hypothesisType' | 'confidenceLevel',
    value: string | number
  ) => {
    if (setting === 'confidenceLevel') {
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          [setting]: Number(value)
        }
      });
    } else {
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          [setting]: value as 'one-sided' | 'two-sided'
        }
      });
    }
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
    // Prevent removal of control variant (A)
    if (variantToRemove === 'variantA') return;
    
    // Ensure we keep minimum of 2 variants
    if (activeVariantKeys.length <= 2) return;
    
    setActiveVariantKeys(activeVariantKeys.filter(key => key !== variantToRemove));
  };

  // Update validate function to use our new validation utility
  const validateForm = (): boolean => {
    const validationResult = validateABTestForm(formData);
    setFormErrors(validationResult.errors);
    setValidationWarnings(validationResult.warnings);
    return validationResult.isValid;
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
      <FormTitle>A/B Test Calculator</FormTitle>
      
      {/* Add ValidationWarningBanner to display warnings */}
      {validationWarnings.length > 0 && (
        <ValidationWarningBanner warnings={validationWarnings} />
      )}
      
      <form onSubmit={handleSubmit} role="form">
        {/* Keep existing form content structure */}
        {activeVariantKeys.map((variantKey, variantIndex) => {
          const variant = formData.variants[variantKey];
          const variantErrors = formErrors[variantKey] || {};
          
          return (
            <VariantContainer key={variantKey}>
              <VariantTitle>Variant {variant.type}</VariantTitle>
              
              {/* Only show remove button for non-control variants */}
              {variantKey !== 'variantA' && (
                <RemoveVariantButton
                  type="button"
                  onClick={() => handleRemoveVariant(variantKey)}
                  aria-label={`Remove Variant ${variant.type}`}
                >
                  ×
                </RemoveVariantButton>
              )}
              
              <VariantFieldsContainer>
                <InputWrapper>
                  <StatCard>
                    <StatLabel>
                      Visitors
                      <TooltipWrapper>
                        <InputTooltip>?
                          <TooltipData>
                            Total number of users who saw this variant.
                          </TooltipData>
                        </InputTooltip>
                      </TooltipWrapper>
                    </StatLabel>
                    <Input
                      type="number"
                      value={variant.visitors || ''}
                      onChange={(e) => handleInputChange(variantKey, 'visitors', e.target.value)}
                      tabIndex={getTabIndex(variantIndex, 'visitors')}
                      aria-label={`Variant ${variant.type} Visitors`}
                      min={0}
                      error={variantErrors?.visitors?.message}
                      allowMultipleNumbers={true}
                      tooltipText="Only positive integers are allowed"
                    />
                    {variantErrors?.visitors?.message && (
                      <ErrorMessage>{variantErrors.visitors.message}</ErrorMessage>
                    )}
                  </StatCard>
                </InputWrapper>
                
                <InputWrapper>
                  <StatCard>
                    <StatLabel>
                      Conversions
                      <TooltipWrapper>
                        <InputTooltip>?
                          <TooltipData>
                            Number of conversions (e.g., clicks, purchases) for this variant.
                          </TooltipData>
                        </InputTooltip>
                      </TooltipWrapper>
                    </StatLabel>
                    <Input
                      type="number"
                      value={variant.conversions || ''}
                      onChange={(e) => handleInputChange(variantKey, 'conversions', e.target.value)}
                      tabIndex={getTabIndex(variantIndex, 'conversions')}
                      aria-label={`Variant ${variant.type} Conversions`}
                      min={0}
                      max={variant.visitors}
                      error={variantErrors?.conversions?.message}
                      allowMultipleNumbers={true}
                      tooltipText="Cannot exceed the number of visitors"
                    />
                    {variantErrors?.conversions?.message && (
                      <ErrorMessage>{variantErrors.conversions.message}</ErrorMessage>
                    )}
                  </StatCard>
                </InputWrapper>
                
                <InputWrapper>
                  <StatCard>
                    <StatLabel>
                      Conversion Rate
                      <TooltipWrapper>
                        <InputTooltip>?
                          <TooltipData>
                            Percentage of visitors who converted.
                          </TooltipData>
                        </InputTooltip>
                      </TooltipWrapper>
                    </StatLabel>
                    <StatValue>
                      {variant.conversionRate.toFixed(2)}%
                    </StatValue>
                  </StatCard>
                </InputWrapper>
              </VariantFieldsContainer>
            </VariantContainer>
          );
        })}
        
        {/* Keep rest of form unchanged */}
        {activeVariantKeys.length < 4 && (
          <AddVariantButtonContainer>
            <Button
              type="button" 
              variant="outline"
              onClick={handleAddVariant}
              fullWidth
              tabIndex={activeVariantKeys.length * 10 + 1} // After the last variant's inputs
              aria-label="Add another variant"
            >
              + Add Variant
            </Button>
          </AddVariantButtonContainer>
        )}
        
        {/* Keep settings section unchanged */}
        <CollapsibleSection>
          <SettingsToggle 
            type="button" 
            onClick={toggleSettings}
            aria-expanded={isSettingsOpen}
            aria-controls="test-settings"
          >
            <SettingsIcon isOpen={isSettingsOpen}>⚙️</SettingsIcon>
            <SettingsLabel>Test Settings</SettingsLabel>
            <ChevronIcon isOpen={isSettingsOpen}>▼</ChevronIcon>
          </SettingsToggle>
          
          <SettingsContent 
            isOpen={isSettingsOpen}
            id="test-settings"
            aria-hidden={!isSettingsOpen}
          >
            <SettingsRow>
              <SettingGroup>
                <SettingLabel>
                  Hypothesis Type
                  <SettingTooltip content="One-sided test looks for improvement only. Two-sided test looks for any difference." />
                </SettingLabel>
                <RadioGroup
                  name="hypothesisType"
                  options={[
                    { value: 'one-sided', label: 'One-sided (B > A)' },
                    { value: 'two-sided', label: 'Two-sided (B ≠ A)' }
                  ]}
                  value={formData.settings.hypothesisType}
                  onChange={value => handleSettingChange('hypothesisType', value)}
                />
              </SettingGroup>
              
              <SettingGroup>
                <SettingLabel>
                  Confidence Level
                  <SettingTooltip content="Higher confidence means less chance of false positives, but requires more data." />
                </SettingLabel>
                <RadioGroup
                  name="confidenceLevel"
                  options={[
                    { value: '90', label: '90%' },
                    { value: '95', label: '95%' },
                    { value: '99', label: '99%' }
                  ]}
                  value={formData.settings.confidenceLevel.toString()}
                  onChange={value => handleSettingChange('confidenceLevel', value)}
                />
              </SettingGroup>
            </SettingsRow>
          </SettingsContent>
        </CollapsibleSection>
        
        {/* Update error display */}
        {formErrors.form && formErrors.form.general && (
          <ErrorMessage>{formErrors.form.general.message}</ErrorMessage>
        )}
        
        <FormActions>
          <Button 
            type="submit" 
            variant="primary"
            fullWidth
            tabIndex={activeVariantKeys.length * 10 + 10} // Always the last tabIndex in the form
          >
            Calculate Results
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  );
};

export default ABTestForm; 