import React from 'react';
import styled from 'styled-components';

interface RadioOption {
  label: string;
  value: string | number;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  horizontal?: boolean;
  tooltipText?: string;
}

const RadioGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const RadioGroupLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

const OptionsContainer = styled.div<{ horizontal?: boolean }>`
  display: flex;
  flex-direction: ${({ horizontal }) => (horizontal ? 'row' : 'column')};
  gap: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  min-height: 44px; /* Minimum touch target height */
  padding: ${({ theme }) => theme.spacing.xs} 0;
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

const RadioInput = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.sm};
  position: relative;
  cursor: pointer;
  
  &:checked {
    border-color: ${({ theme }) => theme.colors.primary};
    
    &:after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    
    &:checked:after {
      top: 4px;
      left: 4px;
      width: 12px;
      height: 12px;
    }
  }
`;

const Tooltip = styled.div`
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
  margin-left: ${({ theme }) => theme.spacing.xs};
  cursor: help;
  
  @media (max-width: 768px) {
    width: 22px;
    height: 22px;
    font-size: 14px;
  }
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: 200px;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    background-color: ${({ theme }) => theme.colors.text.primary};
    color: white;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    z-index: 10;
    
    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      max-width: 250px;
      padding: ${({ theme }) => theme.spacing.sm};
    }
    
    @media (max-width: 480px) {
      width: 200px;
      left: auto;
      right: 0;
      transform: none;
    }
  }
`;

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  horizontal = false,
  tooltipText,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <RadioGroupContainer>
      {label && (
        <RadioGroupLabel>
          {label}
          {tooltipText && (
            <Tooltip data-tooltip={tooltipText}>?</Tooltip>
          )}
        </RadioGroupLabel>
      )}
      <OptionsContainer horizontal={horizontal}>
        {options.map((option) => (
          <RadioLabel key={option.value.toString()}>
            <RadioInput
              type="radio"
              name={name}
              value={option.value.toString()}
              checked={value.toString() === option.value.toString()}
              onChange={handleChange}
            />
            {option.label}
          </RadioLabel>
        ))}
      </OptionsContainer>
    </RadioGroupContainer>
  );
};

export default RadioGroup; 