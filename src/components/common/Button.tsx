import React from 'react';
import styled from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return `
        background-color: ${theme.colors.primary};
        color: white;
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.secondary};
          border-color: ${theme.colors.secondary};
        }
      `;
    case 'secondary':
      return `
        background-color: ${theme.colors.secondary};
        color: white;
        border: 1px solid ${theme.colors.secondary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
        }
      `;
    case 'outline':
      return `
        background-color: transparent;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary};
          color: white;
        }
      `;
    case 'text':
      return `
        background-color: transparent;
        color: ${theme.colors.primary};
        border: none;
        
        &:hover:not(:disabled) {
          color: ${theme.colors.secondary};
          text-decoration: underline;
        }
      `;
    default:
      return '';
  }
};

const getButtonSizeStyles = (size: ButtonSize, theme: any) => {
  switch (size) {
    case 'small':
      return `
        padding: ${theme.spacing.xs} ${theme.spacing.sm};
        font-size: ${theme.typography.fontSize.sm};
      `;
    case 'medium':
      return `
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        font-size: ${theme.typography.fontSize.md};
      `;
    case 'large':
      return `
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.lg};
      `;
    default:
      return '';
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'small': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'large': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  }};
  font-size: ${({ theme, size }) => {
    switch (size) {
      case 'small': return theme.typography.fontSize.sm;
      case 'large': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.md;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, variant }) => 
    variant === 'outline' ? theme.colors.primary : '#fff'};
  background-color: ${({ theme, variant }) => 
    variant === 'outline' ? 'transparent' : theme.colors.primary};
  border: ${({ theme, variant }) => 
    variant === 'outline' ? `1px solid ${theme.colors.primary}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.focus.transitionProperty} ${({ theme }) => theme.focus.transitionDuration} ${({ theme }) => theme.focus.transitionTimingFunction};
  text-decoration: none;
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'outline' ? 'rgba(46, 92, 229, 0.05)' : '#2854cf'};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.focus.ring};
  }
  
  &:focus-visible {
    outline: ${({ theme }) => theme.focus.outline};
    outline-offset: 2px;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  tabIndex,
  'aria-label': ariaLabel,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      type={type}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 