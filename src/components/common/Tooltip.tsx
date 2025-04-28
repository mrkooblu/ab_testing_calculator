import React, { useState, useRef } from 'react';
import styled from 'styled-components';

interface TooltipProps {
  content: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  maxWidth?: string;
  visualExample?: string;
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TooltipIcon = styled.div<{ size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || 18}px;
  height: ${({ size }) => size || 18}px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary}10;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ size }) => (size ? `${size * 0.6}px` : '12px')};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-left: 4px;
  cursor: help;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}30;
  }
`;

const TooltipContent = styled.div<{ visible: boolean; maxWidth?: string }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  background-color: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  z-index: 1000;
  max-width: ${({ maxWidth }) => maxWidth || '280px'};
  width: max-content;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: opacity 0.2s, visibility 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  
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
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 250px;
    left: 0;
    transform: none;
    
    &:before {
      left: 10px;
    }
  }
`;

const VisualExample = styled.div`
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  
  img {
    max-width: 100%;
    border-radius: 4px;
    display: block;
  }
`;

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  showIcon = true,
  iconSize,
  maxWidth,
  visualExample,
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <TooltipContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showIcon && (
        <TooltipIcon size={iconSize}>
          ?
        </TooltipIcon>
      )}
      <TooltipContent
        ref={tooltipRef}
        visible={visible}
        maxWidth={maxWidth}
      >
        {content}
        {visualExample && (
          <VisualExample>
            <img src={visualExample} alt="Visual example" />
          </VisualExample>
        )}
      </TooltipContent>
    </TooltipContainer>
  );
};

export default Tooltip; 