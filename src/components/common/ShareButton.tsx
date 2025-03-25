import React, { useState } from 'react';
import styled from 'styled-components';
import { ABTestFormData } from '../../types';
import { getShareableURL } from '../../utils/urlParameters';

interface ShareButtonProps {
  testData: ABTestFormData;
}

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: auto;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  
  svg {
    margin-right: ${({ theme }) => theme.spacing.xs};
  }
`;

const TooltipContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.success} transparent transparent transparent;
  }
`;

const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const ShareButton: React.FC<ShareButtonProps> = ({ testData }) => {
  const [copied, setCopied] = useState(false);
  
  const handleShare = () => {
    // Generate the shareable URL
    const shareableURL = getShareableURL(testData);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableURL)
      .then(() => {
        // Show the "Copied!" tooltip
        setCopied(true);
        
        // Hide the tooltip after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        alert('Failed to copy URL to clipboard. Please try again.');
      });
  };
  
  return (
    <ButtonWrapper>
      <TooltipContainer visible={copied}>Copied!</TooltipContainer>
      <Button onClick={handleShare}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37069L8.08261 9.2395C7.54435 8.46207 6.6924 8 5.72727 8C4.22107 8 3 9.18628 3 10.6509C3 12.1155 4.22107 13.3018 5.72727 13.3018C6.37819 13.3018 6.97929 13.0751 7.45455 12.6959L14.977 17.6209C14.9745 17.7242 14.9706 17.8279 14.9706 17.933C14.9706 19.6049 16.3333 21 18.0071 21C19.6809 21 21.0436 19.6049 21.0436 17.933C21.0436 16.2611 19.6809 14.866 18.0071 14.866C17.4659 14.866 16.9618 15.0123 16.5255 15.2732L9.8473 10.8681C9.89013 10.6309 9.91169 10.3887 9.91169 10.1415C9.91169 9.9516 9.90257 9.76507 9.88462 9.58298L16.5255 5.84812C16.9447 6.08337 17.4458 6.21687 18 6.21687C18.0071 6.21687 18.0142 6.21686 18.0213 6.21683L18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Share Results
      </Button>
    </ButtonWrapper>
  );
};

export default ShareButton; 