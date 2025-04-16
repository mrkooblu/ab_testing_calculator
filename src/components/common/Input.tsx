import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import styled from 'styled-components';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  error?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  tooltipText?: string;
  allowMultipleNumbers?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  debounceTime?: number;
}

// Function to parse multiple numbers from input
const parseMultipleNumbers = (input: string): number[] => {
  if (!input.trim()) return [];

  // Handle plain consecutive numbers (e.g., "100200300")
  if (/^\d+$/.test(input)) {
    return [parseInt(input)];
  }
  
  // Split by various delimiters (comma, space, newline)
  const numbers = input
    .split(/[\s,\n]+/)
    .filter(str => str.trim() !== '')
    .map(str => parseInt(str.trim()))
    .filter(num => !isNaN(num));
  
  return numbers;
};

// Debounce function for optimizing input handling
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const InputLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background};
  transition: ${({ theme }) => theme.focus.transitionProperty} ${({ theme }) => theme.focus.transitionDuration} ${({ theme }) => theme.focus.transitionTimingFunction};
  width: 100%;
  height: 44px; /* Minimum height for touch targets */
  
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: ${({ theme, hasError }) => 
      hasError ? '0 0 0 3px rgba(244, 67, 54, 0.3)' : theme.focus.ring};
  }
  
  &:focus-visible {
    outline: ${({ theme }) => theme.focus.outline};
    outline-offset: 1px;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.surface};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
  }
  
  /* Prevent iOS zoom on focus by increasing font size */
  @media (max-width: 480px) {
    font-size: 16px; /* iOS doesn't zoom when font-size is 16px or larger */
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  
  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
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
      max-width: 280px;
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

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  id,
  error,
  min,
  max,
  disabled = false,
  required = false,
  fullWidth = false,
  tooltipText,
  allowMultipleNumbers = false,
  tabIndex,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  debounceTime = 0
}) => {
  const [intermediateValue, setIntermediateValue] = useState<string>('');
  const [isFirstInput, setIsFirstInput] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize intermediate value
  useEffect(() => {
    if (!intermediateValue) {
      setIntermediateValue(value.toString());
    }
  }, [intermediateValue, value]);

  // Create a memoized change handler to avoid unnecessary re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (type === 'number') {
      // Always update the intermediate value to show what user is typing
      setIntermediateValue(newValue);
      
      if (allowMultipleNumbers) {
        // If this is the first input and the current value is "0", clear it
        if (isFirstInput && intermediateValue === '0' && /^\d/.test(newValue)) {
          setIntermediateValue(newValue.charAt(newValue.length - 1));
          setIsFirstInput(false);
          return;
        }
        
        setIsFirstInput(false);
        
        // Allow empty input for backspace/delete operations
        if (!newValue.trim()) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              value: '0'
            }
          };
          onChange(syntheticEvent);
          setIsFirstInput(true);
          return;
        }
        
        // Check if the input ends with a delimiter
        const endsWithDelimiter = /[\s,\n]$/.test(newValue);
        
        // Only update parent when we have a complete number (ends with delimiter or Enter key press)
        if (endsWithDelimiter) {
          const numbers = parseMultipleNumbers(newValue);
          if (numbers.length > 0) {
            const syntheticEvent = {
              ...e,
              target: {
                ...e.target,
                value: numbers[numbers.length - 1].toString()
              }
            };
            onChange(syntheticEvent);
          }
        }
      } else {
        // For regular number inputs, directly update parent with the numeric value
        const numericValue = newValue === '' ? '0' : newValue;
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: numericValue
          }
        };
        onChange(syntheticEvent);
      }
    } else {
      // For other inputs, pass through normally
      setIntermediateValue(newValue);
      onChange(e);
    }
  }, [type, allowMultipleNumbers, intermediateValue, isFirstInput, onChange]);

  // Create a debounced version of the handler if debounceTime is specified
  const debouncedChangeHandler = useCallback(
    debounceTime > 0 
      ? debounce(handleInputChange, debounceTime) 
      : handleInputChange,
    [handleInputChange, debounceTime]
  );

  // Handle paste event with memoization
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === 'number' && allowMultipleNumbers) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      
      // Process the pasted content
      const numbers = parseMultipleNumbers(pastedText);
      if (numbers.length > 0) {
        // Update intermediate value to show all pasted numbers
        const formattedNumbers = numbers.join(', ');
        setIntermediateValue(formattedNumbers);
        setIsFirstInput(false);

        // Update parent with the last number
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: numbers[numbers.length - 1].toString()
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
  }, [type, allowMultipleNumbers, onChange]);

  // Handle blur event with memoization
  const handleBlur = useCallback(() => {
    if (type === 'number' && allowMultipleNumbers) {
      const numbers = parseMultipleNumbers(intermediateValue);
      if (numbers.length > 0) {
        // Update with the last entered number
        const lastNumber = numbers[numbers.length - 1].toString();
        setIntermediateValue(lastNumber);
        
        // Also update the parent component with this value
        const syntheticEvent = {
          target: {
            value: lastNumber
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      } else {
        setIntermediateValue('0');
        
        // Update parent with zero value
        const syntheticEvent = {
          target: {
            value: '0'
          }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
        setIsFirstInput(true);
      }
    }
  }, [type, allowMultipleNumbers, intermediateValue, onChange]);

  return (
    <InputContainer fullWidth={fullWidth}>
      {label && (
        <InputLabel htmlFor={id || name}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
          {tooltipText && (
            <Tooltip data-tooltip={tooltipText}>?</Tooltip>
          )}
        </InputLabel>
      )}
      <StyledInput
        ref={inputRef}
        type={allowMultipleNumbers && type === 'number' ? 'text' : type}
        id={id || name}
        name={name}
        placeholder={allowMultipleNumbers && type === 'number' ? 'Enter number(s)' : placeholder}
        value={intermediateValue}
        onChange={debouncedChangeHandler}
        onPaste={handlePaste}
        onBlur={handleBlur}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
        disabled={disabled}
        required={required}
        hasError={!!error}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default memo(Input); 