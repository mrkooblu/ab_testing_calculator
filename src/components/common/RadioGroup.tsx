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
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid transparent;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}05`};
  }
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    padding: ${({ theme }) => theme.spacing.sm};
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
  flex-shrink: 0;
  
  &:checked {
    border-color: ${({ theme }) => theme.colors.primary};
    
    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${({ theme }) => theme.colors.primary};
      animation: pulse 0.3s ease-in-out;
    }
    
    @keyframes pulse {
      0% { 
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      100% { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
    
    & + span {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
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
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}10;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-left: ${({ theme }) => theme.spacing.xs};
  cursor: help;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}30;
  }
  
  @media (max-width: 768px) {
    width: 22px;
    height: 22px;
    font-size: 14px;
  }
  
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 10px;
    width: max-content;
    max-width: 280px;
    padding: 10px 14px;
    border-radius: 4px;
    background-color: rgba(33, 33, 33, 0.95);
    color: white;
    font-size: 13px;
    z-index: 1000;
    line-height: 1.4;
    text-align: left;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    
    /* Arrow pointing up */
    &:before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent rgba(33, 33, 33, 0.95) transparent;
    }
    
    @media (max-width: 768px) {
      max-width: 250px;
      left: 0;
      transform: none;
      
      &:before {
        left: 10px;
      }
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
          <RadioLabel 
            key={option.value.toString()}
            style={value.toString() === option.value.toString() ? 
              { backgroundColor: 'rgba(67, 97, 238, 0.08)', borderColor: 'rgba(67, 97, 238, 0.3)' } : undefined}
          >
            <RadioInput
              type="radio"
              name={name}
              value={option.value.toString()}
              checked={value.toString() === option.value.toString()}
              onChange={handleChange}
            />
            <span>{option.label}</span>
          </RadioLabel>
        ))}
      </OptionsContainer>
    </RadioGroupContainer>
  );
};

export default RadioGroup; 