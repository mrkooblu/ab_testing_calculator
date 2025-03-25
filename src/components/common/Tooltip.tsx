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
  width: ${({ size }) => size || 16}px;
  height: ${({ size }) => size || 16}px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ size }) => (size ? `${size * 0.6}px` : '10px')};
  margin-left: 4px;
  cursor: help;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const TooltipContent = styled.div<{ visible: boolean; maxWidth?: string }>`
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translate(-50%, -100%);
  background-color: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  z-index: 1000;
  max-width: ${({ maxWidth }) => maxWidth || '250px'};
  width: max-content;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: opacity 0.2s, visibility 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
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
          i
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