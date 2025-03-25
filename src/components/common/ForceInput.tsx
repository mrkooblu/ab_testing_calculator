import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ForceInputProps {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  error?: string;
  min?: number;
  max?: number;
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const InputLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background};
  transition: border-color ${({ theme }) => theme.transitions.short};
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, hasError }) => 
      hasError ? 'rgba(244, 67, 54, 0.3)' : 'rgba(67, 97, 238, 0.3)'};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ForceInput: React.FC<ForceInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  id,
  error,
  min,
  max,
  fullWidth = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Force update the input value when value prop changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value.toString();
    }
  }, [value]);
  
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && (
        <InputLabel htmlFor={id}>
          {label}
        </InputLabel>
      )}
      <StyledInput
        ref={inputRef}
        type={type}
        id={id}
        defaultValue={value}
        onChange={onChange}
        min={min}
        max={max}
        hasError={!!error}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default ForceInput; 